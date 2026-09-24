require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================
const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ Cloudinary environment variables missing in .env file.");
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

// ============================================================
// FILE PATHS & CONSTANTS
// ============================================================
const spotsPath = path.join(__dirname, "../public/data/spots.json");
const backupPath = path.join(__dirname, "../public/data/spots.backup.json");
const reportPath = path.join(__dirname, "../image-update-report.json");

const USER_AGENT =
    "ExplorelyImageImporter/1.0 (https://explorely.in; contact: pratiksinha@gmail.com)";

const CONFIG = {
    concurrency: 4,
    wikimediaIntervalMs: 300, // Polite to Wikimedia Commons (~3 req/sec max)
    minWidth: 400,
    minHeight: 300,
    maxImageSizeMB: 40,
    maxWidth: 1600,
    maxHeight: 1600,
    webpQuality: 82,

    strongMatchScore: 100,
    relatedMatchScore: 50,
    locationFallbackScore: 35,

    saveIntervalMs: 5000,
    saveBatchCount: 20,

    UNSUITABLE_TITLE_WORDS: [
        "map",
        "location map",
        "district map",
        "railway map",
        "railway network",
        "network map",
        "route map",
        "diagram",
        "schematic",
        "chart",
        "logo",
        "coat of arms",
        "flag",
        "seal of",
        "portrait of",
        "portrait",
        "politician",
        "minister",
        "president",
        "governor",
        "prime minister",
        "narendra modi",
        "ceremony",
        "addressing",
        "speech",
        "screenshot",
        "cemetery",
        "graveyard",
        "aircraft",
        "air crash",
        "stamp",
        "coin",
        "banknote",
        "document",
        "newspaper",
        "clipping",
        "pdf",
        "scan",
        "scanned",
        "manuscript",
    ],

    FOREIGN_COUNTRY_WORDS: [
        "france", "germany", "united states", "usa", "uk",
        "england", "scotland", "ireland", "australia", "canada",
        "russia", "poland", "michigan", "hawaii", "california",
        "texas", "florida", "ohio", "norway", "sweden", "spain", "italy",
    ],

    LOCATION_VISUAL_WORDS: [
        "lake", "jheel", "reservoir", "pond", "water", "river",
        "waterfall", "falls", "park", "forest", "wildlife",
        "sanctuary", "reserve", "hill", "hills", "mountain",
        "valley", "beach", "coast", "garden", "landscape",
        "nature", "view", "scenery", "temple", "fort", "palace",
        "monument", "museum", "cave", "bridge", "tower",
        "shrine", "mosque", "church", "gurudwara", "gurdwara",
        "monastery", "stupa", "ghat", "mandir", "bazaar", "market",
    ],
};

const GENERIC_WORDS = new Set([
    "the", "and", "of", "in", "at", "on", "for", "a", "an", "near",
    "view", "views", "place", "point", "area", "road", "street",
    "district", "city", "town", "village", "india", "indian", "tourism",
    "tourist", "photo", "photograph", "picture", "image", "file",
    "jpg", "jpeg", "png", "webp", "nearby", "region", "state",
]);

const LOCATION_WORDS = new Set([
    "india", "delhi", "mumbai", "bombay", "kolkata", "calcutta",
    "chennai", "madras", "bengaluru", "bangalore", "hyderabad",
    "pune", "agra", "jaipur", "lucknow", "patna", "varanasi", "goa",
]);

const ATTRACTION_GENERIC = new Set([
    "temple", "mosque", "church", "gurudwara", "gurdwara", "fort",
    "palace", "museum", "monument", "sanctuary", "shrine", "park",
    "garden", "lake", "waterfall", "waterfalls", "beach", "dam",
    "cave", "hill", "hills", "tower", "gate", "bridge", "station",
    "zoo", "reserve", "forest", "wildlife", "national", "memorial",
    "ashram", "stupa", "mahal", "nature", "valley", "river",
    "monastery", "falls", "reservoir", "pond", "jheel", "sarovar",
]);

const TYPE_ALIASES = {
    lake: ["lake", "jheel", "sarovar", "reservoir", "pond", "waterbody", "water"],
    waterfall: ["waterfall", "waterfalls", "falls", "cascade"],
    fort: ["fort", "qila", "kila", "citadel"],
    temple: ["temple", "mandir", "shrine", "devasthan"],
    mosque: ["mosque", "masjid"],
    church: ["church", "cathedral", "chapel"],
    palace: ["palace", "mahal"],
    museum: ["museum"],
    beach: ["beach", "coast", "shore"],
    dam: ["dam", "barrage"],
    cave: ["cave", "cavern"],
    hill: ["hill", "hills", "mountain", "peak", "valley"],
    park: ["park", "garden", "national park", "wildlife", "reserve", "sanctuary", "forest"],
    monument: ["monument", "memorial", "tower", "gate", "stupa"],
};

// ============================================================
// STATE & CIRCUIT BREAKERS
// ============================================================
let openverseRateLimited = false;
let cloudinaryCreditLimitReached = false;
let lastWikimediaTime = 0;
let spots = [];
let isDirty = false;
let lastSaveTime = Date.now();
let updatesSinceLastSave = 0;

const reportData = {
    totalSpotsProcessed: 0,
    unsplashUrlsFound: 0,
    successfullyReplaced: 0,
    wikipediaUsed: 0,
    openverseUsed: 0,
    wikimediaCommonsUsed: 0,
    failed: 0,
    skippedValidOrProtected: 0,
    failedSpots: [],
    replacedSpots: [],
};

// ============================================================
// UTILITIES
// ============================================================
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(text = "") {
    return String(text)
        .replace(/<[^>]*>?/gm, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function normalize(text = "") {
    return String(text)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function words(text = "") {
    return normalize(text)
        .split(" ")
        .filter(Boolean);
}

function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesWord(text, word) {
    if (!text || !word) return false;
    return new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(text);
}

function containsAnyPhrase(text, phrases) {
    const value = normalize(text);
    return phrases.some((phrase) => value.includes(normalize(phrase)));
}

function safeSlug(text) {
    return normalize(text)
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100);
}

function buildPublicId(spot) {
    const loc = safeSlug(`${spot.city || ""}-${spot.state || ""}`);
    const name = safeSlug(spot.name || "spot");
    return ["explorely", "spots", loc, name].filter(Boolean).join("/");
}

function titleLooksUnsuitable(title) {
    return containsAnyPhrase(title, CONFIG.UNSUITABLE_TITLE_WORDS);
}

function mentionsForeignCountry(text) {
    return containsAnyPhrase(text, CONFIG.FOREIGN_COUNTRY_WORDS);
}

function isSvg(mime = "", url = "") {
    return (
        String(mime).toLowerCase() === "image/svg+xml" ||
        /\.svg(?:$|[?#])/i.test(url)
    );
}

function cleanNameParts(spot) {
    const name = words(spot.name || "");
    const city = words(spot.city || "");
    const state = words(spot.state || "");

    const attractionWords = name.filter(
        (word) =>
            word.length >= 3 &&
            !GENERIC_WORDS.has(word) &&
            !LOCATION_WORDS.has(word) &&
            !city.includes(word) &&
            !state.includes(word)
    );

    const typeWords = name.filter(
        (word) => word.length >= 4 && ATTRACTION_GENERIC.has(word)
    );

    return {
        nameWords: [...new Set(name.filter((word) => word.length >= 3))],
        attractionWords: [...new Set(attractionWords)],
        typeWords: [...new Set(typeWords)],
        cityWords: [...new Set(city.filter((word) => word.length >= 3))],
        stateWords: [...new Set(state.filter((word) => word.length >= 3))],
    };
}

function inferTypeWords(spot) {
    const name = normalize(spot.name || "");
    const found = new Set();
    for (const [type, aliases] of Object.entries(TYPE_ALIASES)) {
        if (aliases.some((alias) => name.includes(normalize(alias)))) {
            found.add(type);
        }
    }
    return [...found];
}

function calculateScore(candidateText, spot) {
    const title = normalize(candidateText);
    if (!title) return { score: 0 };

    const placeName = normalize(spot.name || "");
    const city = normalize(spot.city || "");
    const state = normalize(spot.state || "");
    const { nameWords, attractionWords, typeWords } = cleanNameParts(spot);
    const inferredTypes = inferTypeWords(spot);

    let score = 0;
    const exact = placeName.length >= 5 && title.includes(placeName);
    if (exact) score += 180;

    // Filter out foreign locations if not exact
    if (!exact && mentionsForeignCountry(title)) {
        return { score: 0 };
    }

    const matchedNameWords = nameWords.filter((w) => includesWord(title, w));
    const matchedAttractionWords = attractionWords.filter((w) => includesWord(title, w));

    const nameRatio = nameWords.length ? matchedNameWords.length / nameWords.length : 0;
    const attractionRatio = attractionWords.length ? matchedAttractionWords.length / attractionWords.length : 0;

    score += Math.round(nameRatio * 80);
    score += Math.round(attractionRatio * 90);

    const typeMatches = [
        ...new Set(
            inferredTypes.filter((type) =>
                TYPE_ALIASES[type].some((alias) => title.includes(normalize(alias)))
            )
        ),
    ];

    const typeMatched = typeMatches.length > 0 || typeWords.some((w) => includesWord(title, w));
    if (typeMatched) score += 30;

    const cityMatched = city.length > 2 && includesWord(title, city);
    if (cityMatched) score += 25;

    const stateMatched = state.length > 2 && includesWord(title, state);
    if (stateMatched) score += 10;

    if (matchedAttractionWords.length >= 2) score += 30;
    if (matchedNameWords.length >= 2) score += 10;
    if (exact && (cityMatched || stateMatched)) score += 25;

    const locationVisualMatched = CONFIG.LOCATION_VISUAL_WORDS.some((w) =>
        title.includes(normalize(w))
    );
    if (locationVisualMatched) score += 5;

    // Relevance gating: must have exact match OR (city/state match with attraction word)
    const isReliable =
        exact ||
        (matchedAttractionWords.length >= 1 && (cityMatched || stateMatched)) ||
        (matchedNameWords.length >= 2 && (cityMatched || stateMatched || typeMatched));

    if (!isReliable && score < CONFIG.strongMatchScore) {
        return { score: 0 };
    }

    return {
        score: Math.max(0, score),
        exact,
        nameRatio,
        attractionRatio,
        matchedNameWords,
        matchedAttractionWords,
        cityMatched,
        stateMatched,
        typeMatched,
        typeMatches,
        locationVisualMatched,
    };
}

function openverseLicenseAllowed(license) {
    const val = normalize(license || "");
    if (!val || val === "unknown") return false;
    return !(
        val.includes("by-nc") ||
        val.includes(" nc ") ||
        val.endsWith(" nc") ||
        val.includes("non commercial")
    );
}

// ============================================================
// SPOT QUALIFICATION
// ============================================================
function getSpotStatus(spot) {
    if (!spot) return { action: "skip", reason: "invalid_spot" };

    if (spot.imageProtected === true || spot.imageSource === "manual") {
        return { action: "skip", reason: "manual_protected" };
    }

    const img = String(spot.image || "").trim();

    if (img.includes("res.cloudinary.com")) {
        return { action: "skip", reason: "cloudinary_exists" };
    }

    if (img.includes("upload.wikimedia.org") || img.includes("wikipedia.org")) {
        return { action: "skip", reason: "wikipedia_exists" };
    }

    if (!img) {
        return { action: "process", reason: "missing_image" };
    }

    if (img.includes("images.unsplash.com")) {
        return { action: "process", reason: "unsplash_image" };
    }

    return { action: "process", reason: "other_image" };
}

const SYNTHETIC_SUFFIXES = [
    " complex", " view", " viewpoint", " resort", " area", " trek", " trail",
    " walk", " picnic", " sunset", " sunrise", " tour", " camping", " camp",
    " local market", " market", " sweet market", " food walk", " border view",
    " town park", " flower garden", " garden walk", " pine walk", " snow slide",
    " watchtower", " bird watching", " angling spot", " snorkeling", " scuba diving",
    " glass bottom boat", " boating", " river rafting", " river view", " river side",
    " crop fields", " clock tower", " site", " ruins", " temple ruins", " temple pond",
    " pond", " industry view", " main gate", " guest house", " hilltop temple"
];

function getCleanBaseName(name = "") {
    let cleaned = String(name || "").trim();
    const lower = cleaned.toLowerCase();
    for (const suffix of SYNTHETIC_SUFFIXES) {
        if (lower.endsWith(suffix) && cleaned.length - suffix.length >= 3) {
            cleaned = cleaned.substring(0, cleaned.length - suffix.length).trim();
            break;
        }
    }
    return cleaned;
}

// ============================================================
// RATE LIMITED HTTP CLIENT FOR APIS
// ============================================================
async function rateLimitedWikimediaGet(url, params) {
    const now = Date.now();
    const elapsed = now - lastWikimediaTime;
    if (elapsed < CONFIG.wikimediaIntervalMs) {
        await sleep(CONFIG.wikimediaIntervalMs - elapsed);
    }
    lastWikimediaTime = Date.now();

    return axios.get(url, {
        params,
        timeout: 20000,
        headers: { "User-Agent": USER_AGENT },
    });
}

// ============================================================
// SEARCH WIKIPEDIA ARTICLE LEAD IMAGES (AUTHORITATIVE)
// ============================================================
async function searchWikipedia(spot) {
    const rawName = String(spot.name || "").trim();
    const cleanName = getCleanBaseName(rawName);
    const city = String(spot.city || "").trim();
    const state = String(spot.state || "").trim();

    const queries = [];
    if (cleanName) queries.push(cleanName);
    if (cleanName && city) queries.push(`${cleanName} ${city}`);
    if (rawName && rawName !== cleanName) queries.push(rawName);

    const candidates = [];

    for (const q of queries) {
        try {
            const resp = await axios.get("https://en.wikipedia.org/w/api.php", {
                params: {
                    action: "query",
                    generator: "search",
                    gsrsearch: q,
                    gsrlimit: 3,
                    prop: "pageimages|extracts|info",
                    piprop: "original|thumbnail",
                    pithumbsize: 1600,
                    exintro: 1,
                    explaintext: 1,
                    exsentences: 2,
                    format: "json",
                },
                timeout: 12000,
                headers: { "User-Agent": USER_AGENT },
            });

            const pages = Object.values(resp.data?.query?.pages || {});
            for (const page of pages) {
                const imgUrl = page.original?.source || page.thumbnail?.source;
                if (!imgUrl || isSvg("", imgUrl)) continue;

                const text = `${page.title || ""} ${page.extract || ""}`;
                const match = calculateScore(text, spot);
                if (match.score < CONFIG.locationFallbackScore) continue;

                candidates.push({
                    source: "Wikipedia",
                    title: page.title,
                    url: imgUrl,
                    thumbnail: page.thumbnail?.source || imgUrl,
                    width: page.original?.width || 1200,
                    height: page.original?.height || 800,
                    mime: "image/jpeg",
                    sourcePage: `https://en.wikipedia.org/?curid=${page.pageid}`,
                    creator: "Wikipedia",
                    license: "CC BY-SA",
                    ...match,
                });
            }

            if (candidates.some((c) => c.score >= CONFIG.strongMatchScore)) {
                break;
            }
        } catch (err) {
            // non-fatal
        }
    }

    return candidates;
}

// ============================================================
// SEARCH OPENVERSE (PRIMARY REPOSITORY)
// ============================================================
async function searchOpenverse(spot) {
    if (openverseRateLimited) return [];

    const rawName = String(spot.name || "").trim();
    const cleanName = getCleanBaseName(rawName);
    const city = String(spot.city || "").trim();
    const state = String(spot.state || "").trim();
    const category = String(spot.category || "").trim();

    const queries = [];
    if (cleanName) queries.push(cleanName);
    if (cleanName && city) queries.push(`${cleanName} ${city}`);
    if (rawName && rawName !== cleanName) queries.push(rawName);
    if (cleanName && (category || state)) queries.push(`${cleanName} ${category} ${state}`.trim());

    const allCandidates = [];

    for (const q of queries) {
        try {
            const resp = await axios.get("https://api.openverse.org/v1/images/", {
                params: {
                    q: q.replace(/"/g, ""),
                    page_size: 15,
                    mature: false,
                },
                timeout: 12000,
                headers: { "User-Agent": USER_AGENT },
            });

            const items = resp.data?.results || [];
            for (const item of items) {
                if (!item.url || isSvg(item.mimetype, item.url)) continue;
                if (!openverseLicenseAllowed(item.license)) continue;

                const width = Number(item.width || 0);
                const height = Number(item.height || 0);
                if (width && height && (width < CONFIG.minWidth || height < CONFIG.minHeight)) {
                    continue;
                }

                const title = item.title || "Untitled";
                if (titleLooksUnsuitable(title)) continue;

                const text = [
                    title,
                    item.creator,
                    item.description,
                    Array.isArray(item.tags)
                        ? item.tags.map((t) => t?.name || t || "").join(" ")
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ");

                const match = calculateScore(text, spot);
                if (match.score < CONFIG.locationFallbackScore) continue;

                allCandidates.push({
                    source: "Openverse",
                    title,
                    url: item.url,
                    thumbnail: item.thumbnail || item.url,
                    width,
                    height,
                    mime: item.mimetype || "image/jpeg",
                    sourcePage: item.foreign_landing_url || item.detail_url || item.url,
                    creator: stripHtml(item.creator || ""),
                    license: stripHtml(item.license || ""),
                    ...match,
                });
            }

            const hasStrong = allCandidates.some((c) => c.score >= CONFIG.strongMatchScore);
            if (hasStrong) break;
        } catch (err) {
            if (err.response?.status === 429) {
                console.log("\n⚠️ Openverse anonymous daily rate limit reached (429). Switching permanently to Wikimedia Commons.");
                openverseRateLimited = true;
                break;
            }
        }
    }

    return allCandidates;
}

// ============================================================
// SEARCH WIKIMEDIA COMMONS (FALLBACK)
// ============================================================
async function searchWikimedia(spot) {
    const rawName = String(spot.name || "").trim();
    const cleanName = getCleanBaseName(rawName);
    const city = String(spot.city || "").trim();
    const state = String(spot.state || "").trim();

    const queries = [];
    if (cleanName && city && state) queries.push(`${cleanName} ${city} ${state}`);
    if (cleanName && city) queries.push(`${cleanName} ${city}`);
    if (cleanName) queries.push(cleanName);
    if (rawName && rawName !== cleanName) queries.push(rawName);

    const allCandidates = [];

    for (const q of queries) {
        try {
            const resp = await rateLimitedWikimediaGet(
                "https://commons.wikimedia.org/w/api.php",
                {
                    action: "query",
                    generator: "search",
                    gsrnamespace: 6,
                    gsrsearch: q,
                    gsrlimit: 15,
                    prop: "imageinfo",
                    iiprop: "url|extmetadata|size|mime",
                    iiurlwidth: 1600,
                    format: "json",
                    origin: "*",
                }
            );

            const pages = resp.data?.query?.pages || {};
            for (const page of Object.values(pages)) {
                const info = page.imageinfo?.[0];
                if (!info?.url) continue;

                const mime = String(info.mime || "").toLowerCase();
                if (!mime.startsWith("image/") || isSvg(mime, info.url)) continue;

                const width = Number(info.width || 0);
                const height = Number(info.height || 0);
                if (width && height && (width < CONFIG.minWidth || height < CONFIG.minHeight)) {
                    continue;
                }

                const title = page.title || "Untitled";
                if (titleLooksUnsuitable(title)) continue;

                const meta = info.extmetadata || {};
                const text = [
                    title,
                    meta.ImageDescription?.value,
                    meta.ObjectName?.value,
                    meta.Categories?.value,
                    meta.Depicts?.value,
                    meta.Keywords?.value,
                ]
                    .filter(Boolean)
                    .join(" ");

                const match = calculateScore(text, spot);
                if (match.score < CONFIG.locationFallbackScore) continue;

                allCandidates.push({
                    source: "Wikimedia Commons",
                    title,
                    url: info.url,
                    thumbnail: info.thumburl || info.url,
                    width,
                    height,
                    mime,
                    sourcePage: `https://commons.wikimedia.org/wiki/${encodeURIComponent(
                        String(title).replace(/ /g, "_")
                    )}`,
                    creator: stripHtml(meta.Artist?.value || meta.Credit?.value || ""),
                    license: stripHtml(meta.LicenseShortName?.value || meta.License?.value || ""),
                    ...match,
                });
            }

            const hasStrong = allCandidates.some((c) => c.score >= CONFIG.strongMatchScore);
            if (hasStrong) break;
        } catch (err) {
            // Handled
        }
    }

    return allCandidates;
}

// ============================================================
// IMAGE DOWNLOAD & PROCESSING
// ============================================================
async function downloadImageBuffer(url, retries = 2) {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const resp = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 25000,
                headers: {
                    "User-Agent": USER_AGENT,
                    Accept: "image/avif,image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8",
                },
                maxContentLength: CONFIG.maxImageSizeMB * 1024 * 1024,
            });

            const buf = Buffer.from(resp.data);
            if (buf.length < 1000) {
                throw new Error("Downloaded payload too small");
            }

            const meta = await sharp(buf).metadata();
            if (!meta.width || !meta.height || meta.format === "svg") {
                throw new Error(`Invalid format or dimensions: ${meta.format}`);
            }

            return buf;
        } catch (err) {
            if (attempt <= retries && (!err.response || err.response.status >= 500 || err.response.status === 429)) {
                await sleep(1500 * attempt);
                continue;
            }
            throw err;
        }
    }
}

async function processWithSharp(buf) {
    return sharp(buf)
        .rotate()
        .resize({
            width: CONFIG.maxWidth,
            height: CONFIG.maxHeight,
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({ quality: CONFIG.webpQuality })
        .toBuffer();
}

async function uploadToCloudinary(buffer, spot, candidate, retries = 2) {
    if (cloudinaryCreditLimitReached) {
        throw new Error("Cloudinary credit/resource limit reached");
    }

    const publicId = buildPublicId(spot);

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        public_id: publicId,
                        resource_type: "image",
                        overwrite: true,
                        use_filename: false,
                        unique_filename: false,
                        format: "webp",
                        context: {
                            spot: spot.name || "",
                            city: spot.city || "",
                            state: spot.state || "",
                            source: candidate.source || "",
                            source_url: candidate.sourcePage || candidate.url || "",
                            license: candidate.license || "",
                            author: candidate.creator || "",
                        },
                    },
                    (err, res) => {
                        if (err) reject(err);
                        else resolve(res);
                    }
                );
                stream.end(buffer);
            });
        } catch (err) {
            const msg = String(err.message || "");
            if (msg.includes("credit limit") || msg.includes("Resource limit exceeded") || err.http_code === 420) {
                cloudinaryCreditLimitReached = true;
                throw new Error("Cloudinary credit limit exceeded");
            }
            if (attempt <= retries) {
                await sleep(2000 * attempt);
                continue;
            }
            throw err;
        }
    }
}

// ============================================================
// ATOMIC & SAFE DATA PERSISTENCE
// ============================================================
function saveSpotsToFile(force = false) {
    if (!isDirty && !force) return;

    try {
        const tempPath = `${spotsPath}.tmp`;
        fs.writeFileSync(tempPath, JSON.stringify(spots, null, 2), "utf8");
        try {
            fs.renameSync(tempPath, spotsPath);
        } catch (renameErr) {
            fs.copyFileSync(tempPath, spotsPath);
            try { fs.unlinkSync(tempPath); } catch (_) {}
        }
        isDirty = false;
        lastSaveTime = Date.now();
        updatesSinceLastSave = 0;
    } catch (err) {
        console.error(`\n❌ Error saving spots.json: ${err.message}`);
    }
}

function saveReportToFile() {
    try {
        const report = {
            version: "8.1",
            generatedAt: new Date().toISOString(),
            ...reportData,
        };
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    } catch (err) {
        console.error(`\n❌ Error saving report: ${err.message}`);
    }
}

// Periodic auto-saver
setInterval(() => {
    if (isDirty && (Date.now() - lastSaveTime > CONFIG.saveIntervalMs || updatesSinceLastSave >= CONFIG.saveBatchCount)) {
        saveSpotsToFile();
        saveReportToFile();
    }
}, 2000).unref();

// ============================================================
// PROCESS A SINGLE SPOT
// ============================================================
async function processSingleSpot(spot, index) {
    reportData.totalSpotsProcessed++;

    const status = getSpotStatus(spot);

    if (status.action === "skip") {
        reportData.skippedValidOrProtected++;
        return { status: "skipped", reason: status.reason };
    }

    reportData.unsplashUrlsFound++;

    // 1. Search Wikipedia first (Authoritative lead images for real monuments/places)
    let candidates = await searchWikipedia(spot);

    // 2. Search Openverse if no strong Wikipedia candidate
    if (!candidates.some((c) => c.score >= CONFIG.strongMatchScore)) {
        const ovCandidates = await searchOpenverse(spot);
        candidates = [...candidates, ...ovCandidates];
    }

    // 3. Search Wikimedia Commons if no related candidate yet
    if (!candidates.some((c) => c.score >= CONFIG.relatedMatchScore)) {
        const wikiCandidates = await searchWikimedia(spot);
        candidates = [...candidates, ...wikiCandidates];
    }

    // 4. Authentic City / Area Fallback for synthetic spots that have no specific photo
    if (candidates.length === 0 && spot.city) {
        const citySpot = { name: spot.city, city: spot.city, state: spot.state || "", category: "City" };
        const cityCandidates = await searchWikipedia(citySpot);
        if (cityCandidates.length > 0) {
            cityCandidates[0].score = 60;
            candidates.push(cityCandidates[0]);
        }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length === 0 || candidates[0].score < CONFIG.locationFallbackScore) {
        reportData.failed++;
        reportData.failedSpots.push({
            name: spot.name,
            city: spot.city,
            state: spot.state,
            reason: "no_suitable_image_found",
        });
        return { status: "failed", reason: "no_suitable_image_found" };
    }

    // Try candidates until one downloads, processes, and uploads successfully
    for (const candidate of candidates.slice(0, 3)) {
        try {
            // Download original or thumbnail
            let rawBuffer = null;
            try {
                rawBuffer = await downloadImageBuffer(candidate.url);
            } catch (dErr) {
                if (candidate.thumbnail && candidate.thumbnail !== candidate.url) {
                    rawBuffer = await downloadImageBuffer(candidate.thumbnail);
                } else {
                    throw dErr;
                }
            }

            // Sharp resize to 1600px inside, webp quality 82, strip metadata
            const processedBuffer = await processWithSharp(rawBuffer);

            // Cloudinary upload
            const uploadRes = await uploadToCloudinary(processedBuffer, spot, candidate);

            // Update spot in memory
            const oldUrl = spot.image;
            spot.image = uploadRes.secure_url;

            if (!spot.imageSource) spot.imageSource = candidate.source;
            if (!spot.imageSourceUrl) spot.imageSourceUrl = candidate.sourcePage || candidate.url;
            if (!spot.imageLicense && candidate.license) spot.imageLicense = candidate.license;
            if (!spot.imageAuthor && candidate.creator) spot.imageAuthor = candidate.creator;

            isDirty = true;
            updatesSinceLastSave++;

            reportData.successfullyReplaced++;
            if (candidate.source === "Wikipedia") reportData.wikipediaUsed++;
            else if (candidate.source === "Openverse") reportData.openverseUsed++;
            else reportData.wikimediaCommonsUsed++;

            reportData.replacedSpots.push({
                name: spot.name,
                originalUrl: oldUrl,
                cloudinaryUrl: spot.image,
                imageSource: candidate.source,
                license: candidate.license || "N/A",
                author: candidate.creator || "N/A",
            });

            if (updatesSinceLastSave >= CONFIG.saveBatchCount) {
                saveSpotsToFile();
                saveReportToFile();
            }

            return {
                status: "success",
                source: candidate.source,
                score: candidate.score,
                url: spot.image,
            };
        } catch (uploadErr) {
            if (cloudinaryCreditLimitReached) {
                reportData.failed++;
                reportData.failedSpots.push({
                    name: spot.name,
                    city: spot.city,
                    state: spot.state,
                    reason: "cloudinary_limit_exceeded",
                });
                return { status: "failed", reason: "cloudinary_limit_exceeded" };
            }
            // Otherwise try next candidate
        }
    }

    reportData.failed++;
    reportData.failedSpots.push({
        name: spot.name,
        city: spot.city,
        state: spot.state,
        reason: "all_candidates_failed_download_or_upload",
    });
    return { status: "failed", reason: "download_or_upload_failed" };
}

// ============================================================
// MAIN EXECUTION
// ============================================================
async function main() {
    console.log("\n============================================================");
    console.log(" Explorely Ultra-Fast Image Importer v8.0");
    console.log("============================================================");

    if (!fs.existsSync(spotsPath)) {
        console.error(`spots.json not found at ${spotsPath}`);
        process.exit(1);
    }

    // Create backup if not already present
    if (!fs.existsSync(backupPath)) {
        console.log("Creating backup at public/data/spots.backup.json...");
        fs.copyFileSync(spotsPath, backupPath);
        console.log("Backup created.");
    }

    spots = JSON.parse(fs.readFileSync(spotsPath, "utf8"));
    if (!Array.isArray(spots)) {
        console.error("spots.json must contain an array.");
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const isTest = args.includes("--test");
    const limitArg = args.find((a, i) => args[i - 1] === "--limit");
    const startArg = args.find((a, i) => args[i - 1] === "--start");

    let startIndex = startArg ? parseInt(startArg, 10) : 0;
    let limit = limitArg ? parseInt(limitArg, 10) : (isTest ? 5 : spots.length);

    console.log(`Loaded ${spots.length} spots.`);
    console.log(`Run Configuration: start=${startIndex}, limit=${limit}, concurrency=${CONFIG.concurrency}`);

    const targetIndices = [];
    for (let i = startIndex; i < spots.length && targetIndices.length < limit; i++) {
        targetIndices.push(i);
    }

    console.log(`Processing ${targetIndices.length} spots...\n`);

    let activeWorkers = 0;
    let currentIndex = 0;
    let completedCount = 0;
    const startTime = Date.now();

    await new Promise((resolve) => {
        function launchWorker() {
            while (activeWorkers < CONFIG.concurrency && currentIndex < targetIndices.length) {
                const spotIndex = targetIndices[currentIndex++];
                const spot = spots[spotIndex];
                activeWorkers++;

                processSingleSpot(spot, spotIndex)
                    .then((result) => {
                        completedCount++;
                        if (result.status === "success") {
                            console.log(`[${completedCount}/${targetIndices.length}] ✅ #${spotIndex} "${spot.name}" -> ${result.source} (score: ${result.score})`);
                        } else if (result.status === "skipped") {
                            // Print periodically
                            if (completedCount % 500 === 0 || isTest) {
                                console.log(`[${completedCount}/${targetIndices.length}] ⏭️ #${spotIndex} Skipped (${result.reason})`);
                            }
                        } else {
                            if (isTest || completedCount % 100 === 0) {
                                console.log(`[${completedCount}/${targetIndices.length}] ⚠️ #${spotIndex} "${spot.name}" -> ${result.reason}`);
                            }
                        }
                    })
                    .catch((err) => {
                        completedCount++;
                        console.error(`[${completedCount}/${targetIndices.length}] ❌ Error on #${spotIndex}: ${err.message}`);
                    })
                    .finally(() => {
                        activeWorkers--;
                        if (cloudinaryCreditLimitReached) {
                            console.log("\n⚠️ Halting further uploads due to Cloudinary credit limit.");
                            resolve();
                            return;
                        }
                        if (currentIndex < targetIndices.length) {
                            launchWorker();
                        } else if (activeWorkers === 0) {
                            resolve();
                        }
                    });
            }

            if (targetIndices.length === 0 || (currentIndex >= targetIndices.length && activeWorkers === 0)) {
                resolve();
            }
        }

        launchWorker();
    });

    // Final save
    saveSpotsToFile(true);
    saveReportToFile();

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log("\n============================================================");
    console.log(`🏁 FINISHED IN ${elapsedSec}s`);
    console.log("============================================================");
    console.log(`Total processed: ${reportData.totalSpotsProcessed}`);
    console.log(`Unsplash found : ${reportData.unsplashUrlsFound}`);
    console.log(`Replaced       : ${reportData.successfullyReplaced} (Wikipedia: ${reportData.wikipediaUsed}, Openverse: ${reportData.openverseUsed}, Wikimedia: ${reportData.wikimediaCommonsUsed})`);
    console.log(`Skipped        : ${reportData.skippedValidOrProtected}`);
    console.log(`Failed         : ${reportData.failed}`);
    console.log(`Saved JSON     : ${spotsPath}`);
    console.log(`Report JSON    : ${reportPath}`);
}

process.on("SIGINT", () => {
    console.log("\nReceived SIGINT. Saving and shutting down cleanly...");
    saveSpotsToFile(true);
    saveReportToFile();
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\nReceived SIGTERM. Saving and shutting down cleanly...");
    saveSpotsToFile(true);
    saveReportToFile();
    process.exit(0);
});

main().catch((err) => {
    console.error("\n❌ Fatal error in main:", err.stack || err.message);
    saveSpotsToFile(true);
    saveReportToFile();
    process.exit(1);
});