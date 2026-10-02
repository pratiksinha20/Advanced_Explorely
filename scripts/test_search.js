const spots = require('../public/data/spots.json');

const SYNONYMS = {
    'mandir': ['temple', 'shrine', 'devalaya', 'kovil', 'dham'],
    'temple': ['mandir', 'shrine', 'kovil', 'devasthanam', 'dham'],
    'shrine': ['mandir', 'temple', 'dargah'],
    'masjid': ['mosque', 'dargah'],
    'mosque': ['masjid', 'dargah'],
    'church': ['cathedral', 'basilica'],
    'cathedral': ['church', 'basilica'],
    'basilica': ['church', 'cathedral'],
    'gurudwara': ['gurdwara', 'sahib'],
    'gurdwara': ['gurudwara', 'sahib'],
    'fort': ['qila', 'killa', 'garh', 'durg', 'citadel', 'fortress'],
    'qila': ['fort', 'killa', 'garh'],
    'garh': ['fort', 'qila'],
    'palace': ['mahal', 'haveli', 'rajbari', 'bhavan', 'niwas'],
    'mahal': ['palace', 'bhavan', 'haveli'],
    'lake': ['tal', 'jheel', 'sarovar', 'kund', 'pokhari'],
    'tal': ['lake', 'jheel'],
    'kund': ['lake', 'sarovar', 'tal', 'tank'],
    'waterfall': ['falls', 'cascade', 'jharna'],
    'falls': ['waterfall', 'cascade', 'jharna'],
    'beach': ['sea', 'coast', 'shore'],
    'garden': ['park', 'bagh', 'udyan', 'vatika'],
    'park': ['garden', 'bagh', 'udyan'],
    'bagh': ['garden', 'park'],
    'wildlife': ['sanctuary', 'national park', 'safari', 'zoo'],
    'zoo': ['zoological', 'wildlife', 'safari'],
    'market': ['bazaar', 'bazar', 'chowk', 'mandi'],
    'bazaar': ['market', 'bazar', 'chowk'],
    'bazar': ['market', 'bazaar', 'chowk']
};

function normalizePhonetic(str) {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[\s\-_,.'()]+/g, '')
        .replace(/x/g, 'ksh')
        .replace(/ph/g, 'f')
        .replace(/ee/g, 'i')
        .replace(/oo/g, 'u')
        .replace(/w/g, 'v')
        .replace(/(.)\1+/g, '$1');
}

function levenshtein(a, b) {
    if (a === b) return 0;
    const aLen = a.length;
    const bLen = b.length;
    if (aLen === 0) return bLen;
    if (bLen === 0) return aLen;
    if (Math.abs(aLen - bLen) > 3) return 99;

    const row = new Array(aLen + 1);
    for (let j = 0; j <= aLen; j++) row[j] = j;

    for (let i = 1; i <= bLen; i++) {
        let prev = i;
        const bChar = b.charCodeAt(i - 1);
        for (let j = 1; j <= aLen; j++) {
            let val;
            if (bChar === a.charCodeAt(j - 1)) {
                val = row[j - 1];
            } else {
                val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
            }
            row[j - 1] = prev;
            prev = val;
        }
        row[aLen] = prev;
    }
    return row[aLen];
}

function wordMatchesCandidate(word, cand) {
    if (word === cand) return { matched: true, score: 100 };
    if (word.startsWith(cand)) return { matched: true, score: 85 };
    if (cand.length >= 3 && word.includes(cand)) return { matched: true, score: 70 };

    // Phonetic match
    const pWord = normalizePhonetic(word);
    const pCand = normalizePhonetic(cand);
    if (pWord === pCand) return { matched: true, score: 80 };
    if (pWord.startsWith(pCand) && pCand.length >= 4) return { matched: true, score: 75 };

    // Typo / Fuzzy edit distance
    if (cand.length >= 4) {
        const maxDiff = cand.length <= 6 ? 1 : (cand.length <= 9 ? 2 : 3);
        
        // Exact length similarity check
        if (Math.abs(word.length - cand.length) <= maxDiff) {
            const dist = levenshtein(word, cand);
            if (dist <= maxDiff) {
                return { matched: true, score: 65 - dist * 10 };
            }
        }

        // Prefix similarity check (e.g. user typed "ramnath" for "ramanathaswamy")
        if (word.length > cand.length) {
            const sub = word.slice(0, cand.length);
            const dist = levenshtein(sub, cand);
            if (dist <= 1) {
                return { matched: true, score: 55 };
            }
        }
    }
    return { matched: false, score: 0 };
}

function scoreSpot(spot, query) {
    const q = query.trim().toLowerCase();
    if (!q) return 0;

    const spotName = (spot.name || '').toLowerCase();
    const spotCity = (spot.city || '').toLowerCase();
    const spotState = (spot.state || '').toLowerCase();
    const spotCat = (spot.category || '').toLowerCase();
    const spotDesc = (spot.description || '').toLowerCase();

    // Direct full match
    if (spotName === q) return 1000;
    if (spotName.startsWith(q)) return 800;
    if (spotName.includes(q)) return 600;

    // Compressed string match (e.g. 'goldentemple', 'tajmahal')
    const compName = spotName.replace(/[\s\-_,.'()]+/g, '');
    const compFull = (spotName + spotCity + spotState).replace(/[\s\-_,.'()]+/g, '');
    const compQuery = q.replace(/[\s\-_,.'()]+/g, '');
    if (compName.includes(compQuery)) return 750;
    if (compFull.includes(compQuery)) return 700;

    // Tokenized multi-field search
    const queryTokens = q.split(/[\s,]+/).filter(Boolean);
    const nameWords = spotName.split(/[\s\-_,.'()]+/).filter(w => w.length > 1);
    const cityWords = spotCity.split(/[\s\-_,.'()]+/).filter(w => w.length > 1);
    const stateWords = spotState.split(/[\s\-_,.'()]+/).filter(w => w.length > 1);
    const catWords = spotCat.split(/[\s\-_,.'()]+/).filter(w => w.length > 1);
    const descWords = spotDesc.split(/[\s\-_,.'()]+/).filter(w => w.length > 2);

    let totalScore = 0;

    for (const tok of queryTokens) {
        const candidates = [tok, ...(SYNONYMS[tok] || [])];
        let tokenBestScore = 0;

        for (const cand of candidates) {
            // Check compound match in spotName (e.g. cand = 'goldentemple' inside 'goldentempleharmandirsahib')
            if (compName.includes(cand)) {
                if (250 > tokenBestScore) tokenBestScore = 250;
            }

            // 1. Name match (Highest weight: 3x)
            for (const w of nameWords) {
                const res = wordMatchesCandidate(w, cand);
                if (res.matched && res.score * 3 > tokenBestScore) {
                    tokenBestScore = res.score * 3;
                }
            }

            // 2. City / State match (2.5x)
            for (const w of cityWords) {
                const res = wordMatchesCandidate(w, cand);
                if (res.matched && res.score * 2.5 > tokenBestScore) {
                    tokenBestScore = res.score * 2.5;
                }
            }
            for (const w of stateWords) {
                const res = wordMatchesCandidate(w, cand);
                if (res.matched && res.score * 2.5 > tokenBestScore) {
                    tokenBestScore = res.score * 2.5;
                }
            }

            // 3. Category match (2x)
            for (const w of catWords) {
                const res = wordMatchesCandidate(w, cand);
                if (res.matched && res.score * 2 > tokenBestScore) {
                    tokenBestScore = res.score * 2;
                }
            }

            // 4. Description match (1x)
            if (tokenBestScore < 50) {
                for (const w of descWords) {
                    const res = wordMatchesCandidate(w, cand);
                    if (res.matched && res.score > tokenBestScore) {
                        tokenBestScore = res.score;
                    }
                }
            }
        }

        if (tokenBestScore === 0) {
            return 0; // Token failed to match anywhere
        }

        totalScore += tokenBestScore;
    }

    // Boost top-tier places
    if (spot.tier === 'most famous') totalScore += 50;
    if (spot.rating) totalScore += spot.rating * 5;

    return totalScore;
}

function searchSpots(query, limit = 20) {
    const scored = [];
    for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        const sc = scoreSpot(s, query);
        if (sc > 0) {
            scored.push({ spot: s, score: sc });
        }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.spot);
}

const tests = [
    'kali mandir',
    'hawa jaipur',
    'bhadrakli',
    'akshardam delhi',
    'goldentemple amritsar',
    'taj agra',
    'vaishno katra',
    'puri jagannath',
    'ramnathswamy',
    'meenaxi madurai'
];

tests.forEach(t => {
    console.log(`\n=== Query: "${t}" ===`);
    const t0 = Date.now();
    const res = searchSpots(t, 5);
    const ms = Date.now() - t0;
    console.log(`Found ${res.length} in ${ms}ms:`);
    res.forEach((s, idx) => console.log(`  ${idx+1}. ${s.name} (${s.city}, ${s.state})`));
});
