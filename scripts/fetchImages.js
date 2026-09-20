require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const spotsPath = path.join(__dirname, "../public/data/spots.json");
const backupDir = path.join(__dirname, "../public/data/backups");
const reportDir = path.join(__dirname, "../image-import-reports");

const USER_AGENT =
    "ExplorelyImageImporter/7.1 (https://explorely.in; contact: pratiksinha@gmail.com)";

const CONFIG = {
    minWidth: 600,
    minHeight: 400,
    maxImageSizeMB: 50,

    resultsPerQuery: 20,
    maxQueries: 7,
    maxCandidatesPerSpot: 30,

    apiDelayMs: 900,
    uploadDelayMs: 700,

    apiRetries: 3,
    downloadRetries: 3,
    uploadRetries: 3,

    strongMatchScore: 100,
    relatedMatchScore: 50,
    locationFallbackScore: 35,

    maxWidth: 1600,
    maxHeight: 1600,

    webpQuality: 82,
    webpEffort: 5,

    overwrite: true,

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
    ],

    LOCATION_VISUAL_WORDS: [
        "lake",
        "jheel",
        "reservoir",
        "pond",
        "water",
        "river",
        "waterfall",
        "falls",
        "park",
        "forest",
        "wildlife",
        "sanctuary",
        "reserve",
        "hill",
        "hills",
        "mountain",
        "valley",
        "beach",
        "coast",
        "garden",
        "landscape",
        "nature",
        "view",
        "scenery",
        "temple",
        "fort",
        "palace",
        "monument",
        "museum",
        "cave",
        "bridge",
        "tower",
        "shrine",
        "mosque",
        "church",
        "gurudwara",
        "gurdwara",
        "monastery",
        "stupa",
    ],
};

const GENERIC_WORDS = new Set([
    "the",
    "and",
    "of",
    "in",
    "at",
    "on",
    "for",
    "a",
    "an",
    "near",
    "view",
    "views",
    "place",
    "point",
    "area",
    "road",
    "street",
    "district",
    "city",
    "town",
    "village",
    "india",
    "indian",
    "tourism",
    "tourist",
    "photo",
    "photograph",
    "picture",
    "image",
    "file",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "nearby",
    "region",
    "state",
]);

const LOCATION_WORDS = new Set([
    "india",
    "delhi",
    "mumbai",
    "bombay",
    "kolkata",
    "calcutta",
    "chennai",
    "madras",
    "bengaluru",
    "bangalore",
    "hyderabad",
    "pune",
    "agra",
    "jaipur",
    "lucknow",
    "patna",
    "varanasi",
    "goa",
]);

const ATTRACTION_GENERIC = new Set([
    "temple",
    "mosque",
    "church",
    "gurudwara",
    "gurdwara",
    "fort",
    "palace",
    "museum",
    "monument",
    "sanctuary",
    "shrine",
    "park",
    "garden",
    "lake",
    "waterfall",
    "waterfalls",
    "beach",
    "dam",
    "cave",
    "hill",
    "hills",
    "tower",
    "gate",
    "bridge",
    "station",
    "zoo",
    "reserve",
    "forest",
    "wildlife",
    "national",
    "memorial",
    "ashram",
    "stupa",
    "mahal",
    "nature",
    "valley",
    "river",
    "monastery",
    "falls",
    "reservoir",
    "pond",
    "jheel",
    "sarovar",
    "waterbody",
]);

const TYPE_ALIASES = {
    lake: [
        "lake",
        "jheel",
        "sarovar",
        "reservoir",
        "pond",
        "waterbody",
        "water",
    ],

    waterfall: [
        "waterfall",
        "waterfalls",
        "falls",
        "cascade",
    ],

    fort: [
        "fort",
        "qila",
        "kila",
        "citadel",
    ],

    temple: [
        "temple",
        "mandir",
        "shrine",
        "devasthan",
    ],

    mosque: [
        "mosque",
        "masjid",
    ],

    church: [
        "church",
        "cathedral",
        "chapel",
    ],

    palace: [
        "palace",
        "mahal",
    ],

    museum: [
        "museum",
    ],

    beach: [
        "beach",
        "coast",
        "shore",
    ],

    dam: [
        "dam",
        "barrage",
    ],

    cave: [
        "cave",
        "cavern",
    ],

    hill: [
        "hill",
        "hills",
        "mountain",
        "peak",
        "valley",
    ],

    park: [
        "park",
        "garden",
        "national park",
        "wildlife",
        "reserve",
        "sanctuary",
        "forest",
    ],

    monument: [
        "monument",
        "memorial",
        "tower",
        "gate",
        "stupa",
    ],
};

const args = process.argv.slice(2);

function getArg(name) {
    const index = args.indexOf(name);

    if (index === -1) {
        return null;
    }

    return args[index + 1] ?? null;
}

const indexValue = getArg("--index");
const limitValue = getArg("--limit");
const startValue = getArg("--start");

const indexArg =
    indexValue !== null ? Number(indexValue) : null;

const limitArg =
    limitValue !== null ? Number(limitValue) : null;

const startArg =
    startValue !== null ? Number(startValue) : 0;

const force = args.includes("--force");
const all = args.includes("--all");

const help =
    args.includes("--help") ||
    args.includes("-h");

let spots = [];

function printHelp() {
    console.log(`
============================================================
 Explorely Image Importer v7.1
============================================================

TEST ONE:
  node scripts/fetchImages.js --index 4922

FIRST 10:
  node scripts/fetchImages.js --limit 10

START + LIMIT:
  node scripts/fetchImages.js --start 100 --limit 10

ALL:
  node scripts/fetchImages.js --all

ALL + FORCE:
  node scripts/fetchImages.js --all --force

============================================================
 MANUAL IMAGE PROTECTION
============================================================

For a manually selected image:

  "imageProtected": true

OR:

  "imageSource": "manual"

Protected manual images are NEVER replaced,
even when --force is used.

Normal mode also preserves any existing working image URL.

============================================================
 FALLBACK ORDER
============================================================

1. Strong exact / highly relevant candidate
2. Related candidate
3. Wikimedia location fallback
4. Keep existing image if everything fails

============================================================
 PIPELINE
============================================================

Wikimedia/Openverse
        ↓
Original URL
        ↓
Thumbnail fallback
        ↓
Sharp validation
        ↓
Resize max 1600px
        ↓
WebP quality 82
        ↓
Cloudinary
        ↓
spots.json

============================================================
`);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    return String(text).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

function includesWord(text, word) {
    if (!text || !word) {
        return false;
    }

    return new RegExp(
        `\\b${escapeRegExp(word)}\\b`,
        "i"
    ).test(text);
}

function containsAnyPhrase(text, phrases) {
    const value = normalize(text);

    return phrases.some(
        (phrase) =>
            value.includes(normalize(phrase))
    );
}

function compactText(...values) {
    return values
        .filter(Boolean)
        .join(" ");
}

function inferTypeWords(spot) {
    const name = normalize(spot.name || "");
    const found = new Set();

    for (const [type, aliases] of Object.entries(
        TYPE_ALIASES
    )) {
        if (
            aliases.some((alias) =>
                name.includes(normalize(alias))
            )
        ) {
            found.add(type);
        }
    }

    return [...found];
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
        (word) =>
            word.length >= 4 &&
            ATTRACTION_GENERIC.has(word)
    );

    return {
        nameWords: [
            ...new Set(
                name.filter((word) => word.length >= 3)
            ),
        ],

        attractionWords: [
            ...new Set(attractionWords),
        ],

        typeWords: [
            ...new Set(typeWords),
        ],

        cityWords: [
            ...new Set(
                city.filter((word) => word.length >= 3)
            ),
        ],

        stateWords: [
            ...new Set(
                state.filter((word) => word.length >= 3)
            ),
        ],
    };
}

function titleLooksUnsuitable(title) {
    return containsAnyPhrase(
        title,
        CONFIG.UNSUITABLE_TITLE_WORDS
    );
}

function candidateIsSvg(candidate) {
    return (
        String(candidate.mime || "").toLowerCase() ===
        "image/svg+xml" ||
        /\.svg(?:$|[?#])/i.test(
            candidate.url || ""
        )
    );
}

function calculateScore(candidateText, spot) {
    const title = normalize(candidateText);

    if (!title) {
        return {
            score: 0,
            nameRatio: 0,
            attractionRatio: 0,
            matchedNameWords: [],
            matchedAttractionWords: [],
            cityMatched: false,
            stateMatched: false,
            exact: false,
            typeMatched: false,
            typeMatches: [],
            locationVisualMatched: false,
        };
    }

    const placeName = normalize(
        spot.name || ""
    );

    const city = normalize(
        spot.city || ""
    );

    const state = normalize(
        spot.state || ""
    );

    const {
        nameWords,
        attractionWords,
        typeWords,
    } = cleanNameParts(spot);

    const inferredTypes =
        inferTypeWords(spot);

    let score = 0;

    const exact =
        placeName.length >= 5 &&
        title.includes(placeName);

    if (exact) {
        score += 180;
    }

    const matchedNameWords =
        nameWords.filter((word) =>
            includesWord(title, word)
        );

    const matchedAttractionWords =
        attractionWords.filter((word) =>
            includesWord(title, word)
        );

    const nameRatio = nameWords.length
        ? matchedNameWords.length /
        nameWords.length
        : 0;

    const attractionRatio =
        attractionWords.length
            ? matchedAttractionWords.length /
            attractionWords.length
            : 0;

    score += Math.round(nameRatio * 80);
    score += Math.round(attractionRatio * 90);

    const typeMatches = [
        ...new Set(
            inferredTypes.filter((type) =>
                TYPE_ALIASES[type].some((alias) =>
                    title.includes(normalize(alias))
                )
            )
        ),
    ];

    const typeMatched =
        typeMatches.length > 0 ||
        typeWords.some((word) =>
            includesWord(title, word)
        );

    if (typeMatched) {
        score += 30;
    }

    const cityMatched =
        city.length > 2 &&
        includesWord(title, city);

    if (cityMatched) {
        score += 25;
    }

    const stateMatched =
        state.length > 2 &&
        includesWord(title, state);

    if (stateMatched) {
        score += 10;
    }

    if (
        matchedAttractionWords.length >= 2
    ) {
        score += 30;
    }

    if (
        matchedNameWords.length >= 2
    ) {
        score += 10;
    }

    if (
        exact &&
        (cityMatched || stateMatched)
    ) {
        score += 25;
    }

    const locationVisualMatched =
        CONFIG.LOCATION_VISUAL_WORDS.some(
            (word) =>
                title.includes(normalize(word))
        );

    if (locationVisualMatched) {
        score += 5;
    }

    return {
        score: Math.max(0, score),
        nameRatio,
        attractionRatio,
        matchedNameWords,
        matchedAttractionWords,
        cityMatched,
        stateMatched,
        exact,
        typeMatched,
        typeMatches,
        locationVisualMatched,
    };
}

function buildQueries(spot) {
    const name =
        String(spot.name || "").trim();

    const city =
        String(spot.city || "").trim();

    const state =
        String(spot.state || "").trim();

    const {
        attractionWords,
        typeWords,
    } = cleanNameParts(spot);

    const queries = [];

    function add(query) {
        if (!query) {
            return;
        }

        const normalized =
            normalize(query);

        if (!normalized) {
            return;
        }

        if (
            !queries.some(
                (existing) =>
                    normalize(existing) ===
                    normalized
            )
        ) {
            queries.push(query);
        }
    }

    add(`"${name}" "${city}"`);
    add(`"${name}"`);
    add(`${name} ${city}`);

    if (attractionWords.length > 0) {
        add(
            `${attractionWords
                .slice(0, 5)
                .join(" ")} ${city} ${state}`
        );

        add(
            `${attractionWords
                .slice(0, 4)
                .join(" ")} ${city}`
        );
    }

    if (
        typeWords.length > 0 &&
        attractionWords.length > 0
    ) {
        add(
            `${attractionWords
                .slice(0, 4)
                .join(" ")} ${typeWords[0]} ${city}`
        );
    }

    add(`${city} ${state}`);

    return queries.slice(
        0,
        CONFIG.maxQueries
    );
}

function isRetryable(error) {
    const status =
        error.response?.status;

    return (
        !status ||
        status === 408 ||
        status === 425 ||
        status === 429 ||
        status >= 500
    );
}

async function axiosGet(
    url,
    options = {},
    attempt = 1
) {
    try {
        return await axios.get(
            url,
            {
                ...options,

                timeout:
                    options.timeout || 30000,

                headers: {
                    "User-Agent": USER_AGENT,
                    ...(options.headers || {}),
                },
            }
        );
    } catch (error) {
        if (
            attempt < CONFIG.apiRetries &&
            isRetryable(error)
        ) {
            const wait =
                2000 * attempt;

            console.log(
                `      ↻ API retry ${attempt}/${CONFIG.apiRetries - 1} in ${wait}ms...`
            );

            await sleep(wait);

            return axiosGet(
                url,
                options,
                attempt + 1
            );
        }

        throw error;
    }
}

function openverseLicenseAllowed(
    license
) {
    const value =
        normalize(license || "");

    if (
        !value ||
        value === "unknown"
    ) {
        return false;
    }

    return !(
        value.includes("by-nc") ||
        value.includes(" nc ") ||
        value.endsWith(" nc") ||
        value.includes("non commercial")
    );
}

async function searchWikimedia(spot) {
    const results = [];

    console.log(
        "\n🟣 WIKIMEDIA COMMONS"
    );

    const queries =
        buildQueries(spot);

    for (const query of queries) {
        console.log(
            `   🔎 ${query}`
        );

        try {
            const response =
                await axiosGet(
                    "https://commons.wikimedia.org/w/api.php",
                    {
                        params: {
                            action: "query",
                            generator: "search",
                            gsrnamespace: 6,
                            gsrsearch: query,
                            gsrlimit:
                                CONFIG.resultsPerQuery,
                            prop: "imageinfo",
                            iiprop:
                                "url|extmetadata|size|mime",
                            iiurlwidth: 1600,
                            format: "json",
                            origin: "*",
                        },
                    }
                );

            const pages =
                response.data?.query?.pages ||
                {};

            console.log(
                `      ✓ ${Object.keys(pages).length} result(s)`
            );

            for (const page of Object.values(
                pages
            )) {
                const info =
                    page.imageinfo?.[0];

                if (!info?.url) {
                    continue;
                }

                const mime =
                    String(
                        info.mime || ""
                    ).toLowerCase();

                const width =
                    Number(info.width || 0);

                const height =
                    Number(info.height || 0);

                if (
                    !mime.startsWith("image/")
                ) {
                    continue;
                }

                if (
                    width < CONFIG.minWidth ||
                    height < CONFIG.minHeight
                ) {
                    continue;
                }

                const metadata =
                    info.extmetadata || {};

                const text =
                    compactText(
                        page.title,
                        metadata
                            .ImageDescription?.value,
                        metadata
                            .ObjectName?.value,
                        metadata
                            .Categories?.value,
                        metadata
                            .Depicts?.value,
                        metadata
                            .Keywords?.value
                    );

                const match =
                    calculateScore(
                        text,
                        spot
                    );

                const title =
                    page.title ||
                    "Untitled";

                results.push({
                    source:
                        "Wikimedia Commons",

                    title,

                    url: info.url,

                    thumbnail:
                        info.thumburl ||
                        info.url,

                    width,
                    height,
                    mime,

                    ...match,

                    sourcePage:
                        `https://commons.wikimedia.org/wiki/${encodeURIComponent(
                            String(title).replace(
                                / /g,
                                "_"
                            )
                        )}`,

                    creator:
                        metadata.Artist?.value ||
                        metadata.Credit?.value ||
                        "",

                    license:
                        metadata
                            .LicenseShortName
                            ?.value || "",

                    licenseUrl:
                        metadata
                            .LicenseUrl
                            ?.value || "",

                    licenseVersion:
                        metadata
                            .LicenseVersion
                            ?.value || "",

                    description:
                        metadata
                            .ImageDescription
                            ?.value || "",
                });
            }
        } catch (error) {
            console.log(
                `      ⚠️ Wikimedia error: ${error.response?.status ||
                error.message
                }`
            );
        }

        await sleep(
            CONFIG.apiDelayMs
        );
    }

    return uniqueCandidates(results);
}

async function searchOpenverse(spot) {
    const results = [];

    console.log(
        "\n🟢 OPENVERSE"
    );

    const queries =
        buildQueries(spot);

    for (const query of queries) {
        console.log(
            `   🔎 ${query}`
        );

        try {
            const response =
                await axiosGet(
                    "https://api.openverse.org/v1/images/",
                    {
                        params: {
                            q: query.replace(
                                /"/g,
                                ""
                            ),

                            page_size:
                                CONFIG.resultsPerQuery,

                            mature: false,
                        },
                    }
                );

            const items =
                response.data?.results ||
                [];

            console.log(
                `      ✓ ${items.length} result(s)`
            );

            for (const item of items) {
                if (!item.url) {
                    continue;
                }

                if (
                    !openverseLicenseAllowed(
                        item.license
                    )
                ) {
                    continue;
                }

                const width =
                    Number(item.width || 0);

                const height =
                    Number(item.height || 0);

                if (
                    width &&
                    height &&
                    (
                        width < CONFIG.minWidth ||
                        height < CONFIG.minHeight
                    )
                ) {
                    continue;
                }

                const text =
                    compactText(
                        item.title,
                        item.creator,
                        item.description,

                        Array.isArray(
                            item.tags
                        )
                            ? item.tags
                                .map(
                                    (tag) =>
                                        tag?.name ||
                                        tag ||
                                        ""
                                )
                                .join(" ")
                            : ""
                    );

                const match =
                    calculateScore(
                        text,
                        spot
                    );

                results.push({
                    source:
                        "Openverse",

                    title:
                        item.title ||
                        "Untitled",

                    url:
                        item.url,

                    thumbnail:
                        item.thumbnail ||
                        item.url,

                    width,
                    height,

                    mime:
                        item.mimetype ||
                        "image/*",

                    ...match,

                    sourcePage:
                        item.foreign_landing_url ||
                        item.detail_url ||
                        "",

                    creator:
                        item.creator ||
                        "",

                    license:
                        item.license ||
                        "",

                    licenseVersion:
                        item.license_version ||
                        "",

                    licenseUrl:
                        item.license_url ||
                        "",

                    description:
                        item.description ||
                        "",
                });
            }
        } catch (error) {
            console.log(
                `      ⚠️ Openverse error: ${error.response?.status ||
                error.message
                }`
            );
        }

        await sleep(
            CONFIG.apiDelayMs
        );
    }

    return uniqueCandidates(results);
}

function uniqueCandidates(
    candidates
) {
    const map = new Map();

    for (const candidate of candidates) {
        const key =
            String(
                candidate.url || ""
            )
                .split("?")[0]
                .toLowerCase();

        if (!key) {
            continue;
        }

        const existing =
            map.get(key);

        if (
            !existing ||
            candidate.score >
            existing.score
        ) {
            map.set(
                key,
                candidate
            );
        }
    }

    return [
        ...map.values(),
    ].sort(
        (a, b) => {
            if (
                b.score !== a.score
            ) {
                return (
                    b.score -
                    a.score
                );
            }

            const areaA =
                (a.width || 0) *
                (a.height || 0);

            const areaB =
                (b.width || 0) *
                (b.height || 0);

            return (
                areaB -
                areaA
            );
        }
    );
}

function isStrongCandidate(
    candidate
) {
    if (
        candidate.score <
        CONFIG.strongMatchScore
    ) {
        return false;
    }

    if (
        titleLooksUnsuitable(
            candidate.title
        )
    ) {
        return false;
    }

    if (
        candidateIsSvg(candidate)
    ) {
        return false;
    }

    return (
        candidate.exact ||
        candidate.typeMatched ||
        (
            candidate
                .matchedAttractionWords
                ?.length > 0
        )
    );
}

function isRelatedCandidate(
    candidate,
    spot
) {
    if (
        candidate.score <
        CONFIG.relatedMatchScore
    ) {
        return false;
    }

    if (
        titleLooksUnsuitable(
            candidate.title
        )
    ) {
        return false;
    }

    if (
        candidateIsSvg(candidate)
    ) {
        return false;
    }

    const nameEvidence =
        (
            candidate
                .matchedNameWords
                ?.length || 0
        ) > 0;

    const attractionEvidence =
        (
            candidate
                .matchedAttractionWords
                ?.length || 0
        ) > 0;

    const typeEvidence =
        candidate.typeMatched ||
        (
            candidate
                .typeMatches
                ?.length || 0
        ) > 0;

    const locationEvidence =
        candidate.cityMatched ||
        candidate.stateMatched;

    if (
        !nameEvidence &&
        !attractionEvidence &&
        !typeEvidence
    ) {
        return false;
    }

    const inferredTypes =
        inferTypeWords(spot);

    if (
        inferredTypes.length &&
        candidate.typeMatches?.length
    ) {
        const compatible =
            inferredTypes.some(
                (type) =>
                    candidate
                        .typeMatches
                        .includes(type)
            );

        if (
            !compatible &&
            !attractionEvidence &&
            !candidate.exact
        ) {
            return false;
        }
    }

    return (
        locationEvidence ||
        attractionEvidence ||
        typeEvidence ||
        candidate.exact
    );
}

function isLocationFallback(
    candidate,
    spot
) {
    if (
        candidate.source !==
        "Wikimedia Commons"
    ) {
        return false;
    }

    if (
        candidate.score <
        CONFIG.locationFallbackScore
    ) {
        return false;
    }

    if (
        titleLooksUnsuitable(
            candidate.title
        )
    ) {
        return false;
    }

    if (
        candidateIsSvg(candidate)
    ) {
        return false;
    }

    const city =
        normalize(
            spot.city || ""
        );

    const state =
        normalize(
            spot.state || ""
        );

    const title =
        normalize(
            candidate.title || ""
        );

    const cityMatched =
        city.length > 2 &&
        includesWord(
            title,
            city
        );

    const stateMatched =
        state.length > 2 &&
        includesWord(
            title,
            state
        );

    if (
        !cityMatched &&
        !stateMatched
    ) {
        return false;
    }

    const nameEvidence =
        (
            candidate
                .matchedNameWords
                ?.length || 0
        ) > 0;

    const visualEvidence =
        candidate.locationVisualMatched;

    const bothLocation =
        cityMatched &&
        stateMatched;

    return (
        nameEvidence ||
        visualEvidence ||
        bothLocation
    );
}

function categorizeCandidates(
    candidates,
    spot
) {
    const strong =
        candidates.filter(
            (candidate) =>
                isStrongCandidate(
                    candidate
                )
        );

    const strongUrls =
        new Set(
            strong.map(
                (candidate) =>
                    candidate.url
            )
        );

    const related =
        candidates.filter(
            (candidate) =>
                !strongUrls.has(
                    candidate.url
                ) &&
                isRelatedCandidate(
                    candidate,
                    spot
                )
        );

    const relatedUrls =
        new Set(
            related.map(
                (candidate) =>
                    candidate.url
            )
        );

    const location =
        candidates.filter(
            (candidate) =>
                !strongUrls.has(
                    candidate.url
                ) &&
                !relatedUrls.has(
                    candidate.url
                ) &&
                isLocationFallback(
                    candidate,
                    spot
                )
        );

    return {
        strong,
        related,
        location,

        ordered: [
            ...strong,
            ...related,
            ...location,
        ],
    };
}

function safeSlug(text) {
    return normalize(text)
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 120);
}

function buildPublicId(spot) {
    const location =
        safeSlug(
            `${spot.city || ""}-${spot.state || ""}`
        );

    const name =
        safeSlug(
            spot.name || "spot"
        );

    return [
        "explorely",
        "spots",
        location,
        name,
    ]
        .filter(Boolean)
        .join("/");
}

async function validateBufferAsImage(
    buffer,
    allowSmall = false
) {
    const metadata =
        await sharp(buffer)
            .metadata();

    const width =
        Number(
            metadata.width || 0
        );

    const height =
        Number(
            metadata.height || 0
        );

    const format =
        String(
            metadata.format || ""
        ).toLowerCase();

    if (!width || !height) {
        throw new Error(
            "Image has no valid dimensions."
        );
    }

    if (
        !format ||
        format === "svg" ||
        format === "svg+xml"
    ) {
        throw new Error(
            `Unsupported image format: ${format || "unknown"
            }`
        );
    }

    if (
        !allowSmall &&
        (
            width < CONFIG.minWidth ||
            height < CONFIG.minHeight
        )
    ) {
        throw new Error(
            `Image too small: ${width}x${height}`
        );
    }

    return metadata;
}

async function downloadImage(
    url,
    attempt = 1
) {
    const cleanUrl =
        String(url || "").trim();

    if (!cleanUrl) {
        throw new Error(
            "Image URL is empty."
        );
    }

    try {
        const response =
            await axios.get(
                cleanUrl,
                {
                    responseType:
                        "arraybuffer",

                    timeout: 60000,

                    headers: {
                        "User-Agent":
                            USER_AGENT,

                        Accept:
                            "image/avif,image/webp,image/apng,image/jpeg,image/png,image/gif,image/*,*/*;q=0.8",
                    },

                    maxContentLength:
                        CONFIG.maxImageSizeMB *
                        1024 *
                        1024,

                    maxBodyLength:
                        CONFIG.maxImageSizeMB *
                        1024 *
                        1024,

                    validateStatus:
                        (status) =>
                            status >= 200 &&
                            status < 300,
                }
            );

        const contentType =
            String(
                response.headers[
                "content-type"
                ] || ""
            ).toLowerCase();

        if (
            contentType &&
            !contentType.startsWith(
                "image/"
            )
        ) {
            throw new Error(
                `Not an image response: ${contentType}`
            );
        }

        const buffer =
            Buffer.from(
                response.data
            );

        if (
            buffer.length < 1000
        ) {
            throw new Error(
                "Downloaded payload is too small."
            );
        }

        await validateBufferAsImage(
            buffer
        );

        return buffer;
    } catch (error) {
        if (
            attempt <
            CONFIG.downloadRetries &&
            isRetryable(error)
        ) {
            const wait =
                3000 * attempt;

            console.log(
                `      ↻ Download retry ${attempt}/${CONFIG.downloadRetries - 1} in ${wait}ms...`
            );

            await sleep(wait);

            return downloadImage(
                cleanUrl,
                attempt + 1
            );
        }

        throw error;
    }
}

async function getCandidateBuffer(
    candidate
) {
    console.log(
        `\n   ⬇️ Candidate: ${candidate.title}`
    );

    try {
        console.log(
            "   → Trying original URL"
        );

        const buffer =
            await downloadImage(
                candidate.url
            );

        console.log(
            `   ✅ Original downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
        );

        return {
            buffer,
            method: "original",
        };
    } catch (error) {
        console.log(
            `   ⚠️ Original failed: ${error.response?.status ||
            error.message
            }`
        );
    }

    if (
        candidate.thumbnail &&
        candidate.thumbnail !==
        candidate.url
    ) {
        try {
            console.log(
                "   → Trying thumbnail URL"
            );

            const buffer =
                await downloadImage(
                    candidate.thumbnail
                );

            console.log(
                `   ✅ Thumbnail downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
            );

            return {
                buffer,
                method: "thumbnail",
            };
        } catch (error) {
            console.log(
                `   ⚠️ Thumbnail failed: ${error.response?.status ||
                error.message
                }`
            );
        }
    }

    return null;
}

async function compressImage(
    originalBuffer
) {
    console.log(
        "   🗜️ Compressing with Sharp..."
    );

    const originalSize =
        originalBuffer.length;

    const compressedBuffer =
        await sharp(
            originalBuffer
        )
            .rotate()
            .resize({
                width:
                    CONFIG.maxWidth,

                height:
                    CONFIG.maxHeight,

                fit: "inside",

                withoutEnlargement:
                    true,
            })
            .webp({
                quality:
                    CONFIG.webpQuality,

                effort:
                    CONFIG.webpEffort,
            })
            .toBuffer();

    await validateBufferAsImage(
        compressedBuffer,
        true
    );

    const reduced =
        (
            1 -
            compressedBuffer.length /
            originalSize
        ) *
        100;

    console.log(
        `   📦 Before: ${(originalSize / 1024 / 1024).toFixed(2)} MB`
    );

    console.log(
        `   📦 After : ${(compressedBuffer.length / 1024).toFixed(0)} KB`
    );

    console.log(
        `   📉 Reduced: ${reduced.toFixed(1)}%`
    );

    return compressedBuffer;
}

function isCloudinaryRetryable(
    error
) {
    const status =
        Number(
            error?.http_code ||
            error?.status ||
            error?.response?.status ||
            0
        );

    return (
        !status ||
        status === 408 ||
        status === 425 ||
        status === 429 ||
        status >= 500
    );
}

async function uploadBufferToCloudinary(
    buffer,
    candidate,
    spot,
    attempt = 1
) {
    const publicId =
        buildPublicId(
            spot
        );

    console.log(
        `   ☁️ Uploading WebP → ${publicId}`
    );

    try {
        return await new Promise(
            (resolve, reject) => {
                const uploadStream =
                    cloudinary.uploader.upload_stream(
                        {
                            public_id:
                                publicId,

                            resource_type:
                                "image",

                            overwrite:
                                CONFIG.overwrite,

                            use_filename:
                                false,

                            unique_filename:
                                false,

                            format:
                                "webp",

                            context: {
                                spot:
                                    spot.name || "",

                                city:
                                    spot.city || "",

                                state:
                                    spot.state || "",

                                source:
                                    candidate.source ||
                                    "",

                                source_page:
                                    candidate.sourcePage ||
                                    "",

                                creator:
                                    candidate.creator ||
                                    "",

                                license:
                                    candidate.license ||
                                    "",

                                license_url:
                                    candidate.licenseUrl ||
                                    "",
                            },
                        },

                        (
                            error,
                            result
                        ) => {
                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve(result);
                        }
                    );

                uploadStream.end(
                    buffer
                );
            }
        );
    } catch (error) {
        if (
            attempt <
            CONFIG.uploadRetries &&
            isCloudinaryRetryable(error)
        ) {
            const wait =
                3000 * attempt;

            console.log(
                `      ↻ Upload retry ${attempt}/${CONFIG.uploadRetries - 1} in ${wait}ms...`
            );

            await sleep(wait);

            return uploadBufferToCloudinary(
                buffer,
                candidate,
                spot,
                attempt + 1
            );
        }

        throw error;
    }
}

async function tryCandidate(
    candidate,
    spot
) {
    const downloaded =
        await getCandidateBuffer(
            candidate
        );

    if (!downloaded) {
        return null;
    }

    let compressedBuffer;

    try {
        compressedBuffer =
            await compressImage(
                downloaded.buffer
            );
    } catch (error) {
        console.log(
            `   ❌ Compression failed: ${error.message}`
        );

        return null;
    }

    try {
        const uploaded =
            await uploadBufferToCloudinary(
                compressedBuffer,
                candidate,
                spot
            );

        await sleep(
            CONFIG.uploadDelayMs
        );

        return {
            uploaded,

            downloadMethod:
                downloaded.method,

            compressedBytes:
                compressedBuffer.length,
        };
    } catch (error) {
        console.log(
            `   ❌ Cloudinary upload failed: ${error.message}`
        );

        return null;
    }
}

function ensureDirectories() {
    fs.mkdirSync(
        backupDir,
        {
            recursive: true,
        }
    );

    fs.mkdirSync(
        reportDir,
        {
            recursive: true,
        }
    );
}

function createBackup() {
    ensureDirectories();

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );

    const backupPath =
        path.join(
            backupDir,
            `spots-${timestamp}.json`
        );

    fs.copyFileSync(
        spotsPath,
        backupPath
    );

    return backupPath;
}

function saveSpots(data) {
    const tempPath =
        `${spotsPath}.tmp`;

    fs.writeFileSync(
        tempPath,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );

    fs.renameSync(
        tempPath,
        spotsPath
    );
}

function saveReport(
    report
) {
    ensureDirectories();

    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );

    const reportPath =
        path.join(
            reportDir,
            `image-import-${timestamp}.json`
        );

    fs.writeFileSync(
        reportPath,
        JSON.stringify(
            report,
            null,
            2
        ),
        "utf8"
    );

    return reportPath;
}

// ============================================================
// EXISTING IMAGE PROTECTION
// ============================================================

function isProtectedManualImage(
    spot
) {
    const source =
        normalize(
            spot.imageSource || ""
        );

    return (
        spot.imageProtected === true ||
        source === "manual" ||
        source.includes(
            "manual selected"
        ) ||
        source.includes(
            "manually selected"
        )
    );
}

function isCloudinaryImage(
    spot
) {
    return (
        !!spot.image &&
        String(
            spot.image
        ).includes(
            "res.cloudinary.com"
        )
    );
}

function isExplorelyImportedImage(
    spot
) {
    const source =
        normalize(
            spot.imageSource || ""
        );

    return (
        source ===
        "explorely image importer" ||
        source ===
        "explorely image importer v7" ||
        source ===
        "explorely image importer v7 1"
    );
}

function hasExistingImage(
    spot
) {
    return (
        !!spot.image &&
        /^https?:\/\//i.test(
            String(
                spot.image
            ).trim()
        )
    );
}

async function existingImageIsWorking(
    spot
) {
    if (
        !hasExistingImage(spot)
    ) {
        return false;
    }

    try {
        console.log(
            "   🔍 Checking existing image URL..."
        );

        const buffer =
            await downloadImage(
                spot.image
            );

        await validateBufferAsImage(
            buffer
        );

        console.log(
            "   ✅ Existing image URL works. Preserving it."
        );

        return true;
    } catch (error) {
        console.log(
            `   ⚠️ Existing image is unavailable/invalid: ${error.response?.status ||
            error.message
            }`
        );

        return false;
    }
}

async function shouldSkipSpot(
    spot
) {
    // Explicit manual protection ALWAYS wins.
    if (
        isProtectedManualImage(
            spot
        )
    ) {
        return {
            skip: true,
            reason:
                "manual_protected",
        };
    }

    // No image → needs importing.
    if (!spot.image) {
        return {
            skip: false,
            reason:
                "missing_image",
        };
    }

    // Existing Cloudinary/imported image.
    if (
        !force &&
        (
            isCloudinaryImage(
                spot
            ) ||
            isExplorelyImportedImage(
                spot
            )
        )
    ) {
        return {
            skip: true,
            reason:
                "already_imported",
        };
    }

    // Any other existing URL:
    // check if the URL actually contains a usable image.
    //
    // Working image → preserve.
    // Broken image → replace.
    if (
        !force &&
        hasExistingImage(spot)
    ) {
        const working =
            await existingImageIsWorking(
                spot
            );

        if (working) {
            return {
                skip: true,
                reason:
                    "existing_working_url",
            };
        }
    }

    return {
        skip: false,
        reason:
            "needs_import",
    };
}

// ============================================================
// PROCESS ONE SPOT
// ============================================================

async function processSpot(
    spot,
    index
) {
    console.log(
        `\n${"=".repeat(76)}`
    );

    console.log(
        `📍 Spot ${index + 1}`
    );

    console.log(
        `${"=".repeat(76)}`
    );

    console.log(
        `Name : ${spot.name || "-"}`
    );

    console.log(
        `City : ${spot.city || "-"}`
    );

    console.log(
        `State: ${spot.state || "-"}`
    );

    console.log(
        `Old  : ${spot.image || "-"}`
    );

    // ----------------------------------------------------------
    // EXISTING IMAGE HANDLING
    // ----------------------------------------------------------

    const decision =
        await shouldSkipSpot(
            spot
        );

    if (decision.skip) {
        let message =
            "⏭️ Existing image preserved.";

        if (
            decision.reason ===
            "manual_protected"
        ) {
            message =
                "🔒 Manual image is protected. Skipping permanently.";
        } else if (
            decision.reason ===
            "existing_working_url"
        ) {
            message =
                "⏭️ Existing working image URL. Skipping.";
        } else if (
            decision.reason ===
            "already_imported"
        ) {
            message =
                "⏭️ Existing Cloudinary/imported image. Skipping.";
        }

        console.log(
            `\n${message}`
        );

        return {
            status:
                "skipped_existing",

            reason:
                decision.reason,

            index,

            name:
                spot.name,
        };
    }

    // ----------------------------------------------------------
    // WIKIMEDIA
    // ----------------------------------------------------------

    let wikimedia = [];

    try {
        wikimedia =
            await searchWikimedia(
                spot
            );
    } catch (error) {
        console.log(
            `⚠️ Wikimedia stage crashed: ${error.message}`
        );
    }

    // ----------------------------------------------------------
    // OPENVERSE
    // ----------------------------------------------------------

    let openverse = [];

    try {
        openverse =
            await searchOpenverse(
                spot
            );
    } catch (error) {
        console.log(
            `⚠️ Openverse stage crashed: ${error.message}`
        );
    }

    // ----------------------------------------------------------
    // MERGE RESULTS
    // ----------------------------------------------------------

    const candidates =
        uniqueCandidates([
            ...wikimedia,
            ...openverse,
        ]).slice(
            0,
            CONFIG.maxCandidatesPerSpot
        );

    if (
        candidates.length === 0
    ) {
        console.log(
            "\n❌ NO USABLE SEARCH CANDIDATES"
        );

        console.log(
            "   Existing image will be kept."
        );

        return {
            status:
                "not_found",

            index,

            name:
                spot.name,
        };
    }

    // ----------------------------------------------------------
    // CATEGORIZE
    // ----------------------------------------------------------

    const groups =
        categorizeCandidates(
            candidates,
            spot
        );

    console.log(
        "\n🖼️ CANDIDATE SUMMARY"
    );

    console.log(
        `   Strong   : ${groups.strong.length}`
    );

    console.log(
        `   Related  : ${groups.related.length}`
    );

    console.log(
        `   Location : ${groups.location.length}`
    );

    // ----------------------------------------------------------
    // PREVIEW
    // ----------------------------------------------------------

    groups.ordered
        .slice(0, 12)
        .forEach(
            (
                candidate,
                i
            ) => {
                let tier =
                    "LOCATION";

                if (
                    groups.strong.includes(
                        candidate
                    )
                ) {
                    tier =
                        "STRONG";
                } else if (
                    groups.related.includes(
                        candidate
                    )
                ) {
                    tier =
                        "RELATED";
                }

                console.log(
                    `\n   ${i + 1}. [${tier}] score=${candidate.score}`
                );

                console.log(
                    `      ${candidate.source} — ${candidate.title}`
                );

                console.log(
                    `      city=${candidate.cityMatched
                        ? "YES"
                        : "NO"
                    } state=${candidate.stateMatched
                        ? "YES"
                        : "NO"
                    }`
                );

                console.log(
                    `      matched=${candidate.matchedNameWords?.join(
                        ", "
                    ) || "none"
                    }`
                );

                console.log(
                    `      type=${candidate.typeMatches?.join(
                        ", "
                    ) || "none"
                    }`
                );
            }
        );

    if (
        groups.ordered.length === 0
    ) {
        console.log(
            "\n⚠️ No candidate passed relevance filters."
        );

        console.log(
            "   Existing image will be kept."
        );

        return {
            status:
                "no_relevant_candidate",

            index,

            name:
                spot.name,
        };
    }

    // ----------------------------------------------------------
    // TRY ALL CANDIDATES
    // ----------------------------------------------------------

    for (
        let i = 0;
        i < groups.ordered.length;
        i++
    ) {
        const candidate =
            groups.ordered[i];

        let tier =
            "LOCATION FALLBACK";

        if (
            groups.strong.includes(
                candidate
            )
        ) {
            tier =
                "STRONG";
        } else if (
            groups.related.includes(
                candidate
            )
        ) {
            tier =
                "RELATED";
        }

        console.log(
            `\n🚀 TRYING ${i + 1}/${groups.ordered.length} [${tier}]`
        );

        console.log(
            `   ${candidate.source}: ${candidate.title}`
        );

        console.log(
            `   Score: ${candidate.score}`
        );

        const result =
            await tryCandidate(
                candidate,
                spot
            );

        if (!result) {
            console.log(
                "   ↪ Candidate failed. Moving to next candidate..."
            );

            continue;
        }

        // --------------------------------------------------------
        // SUCCESS
        // --------------------------------------------------------

        const oldImage =
            spot.image || "";

        spot.image =
            result.uploaded
                .secure_url;

        spot.imageSource =
            "Explorely Image Importer v7.1";

        spot.imageSourceUrl =
            candidate.sourcePage ||
            candidate.url ||
            "";

        spot.imageCreator =
            candidate.creator ||
            "";

        spot.imageLicense =
            candidate.license ||
            "";

        spot.imageLicenseUrl =
            candidate.licenseUrl ||
            "";

        spot.imageImportedAt =
            new Date().toISOString();

        // Automatically mark imported images
        // as not manually protected.
        spot.imageProtected =
            false;

        // Save immediately.
        saveSpots(
            spots
        );

        console.log(
            "\n✅ SUCCESS"
        );

        console.log(
            `   Cloudinary: ${spot.image}`
        );

        console.log(
            `   Source    : ${candidate.source}`
        );

        console.log(
            `   Tier      : ${tier}`
        );

        console.log(
            `   Download  : ${result.downloadMethod}`
        );

        console.log(
            "   Saved     : spots.json"
        );

        return {
            status:
                "updated",

            index,

            name:
                spot.name,

            city:
                spot.city,

            state:
                spot.state,

            oldImage,

            newImage:
                spot.image,

            source:
                candidate.source,

            title:
                candidate.title,

            tier,

            score:
                candidate.score,

            downloadMethod:
                result.downloadMethod,

            creator:
                candidate.creator,

            license:
                candidate.license,

            licenseUrl:
                candidate.licenseUrl,
        };
    }

    // ----------------------------------------------------------
    // EVERYTHING FAILED
    // ----------------------------------------------------------

    console.log(
        "\n❌ ALL RELEVANT CANDIDATES FAILED"
    );

    console.log(
        "   Existing image will be kept."
    );

    return {
        status:
            "all_candidates_failed",

        index,

        name:
            spot.name,

        tried:
            groups.ordered.length,
    };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
    if (help) {
        printHelp();
        return;
    }

    // ----------------------------------------------------------
    // ENV CHECK
    // ----------------------------------------------------------

    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        throw new Error(
            "Cloudinary environment variables are missing. Check your .env file."
        );
    }

    // ----------------------------------------------------------
    // FILE CHECK
    // ----------------------------------------------------------

    if (
        !fs.existsSync(
            spotsPath
        )
    ) {
        throw new Error(
            `spots.json not found at:\n${spotsPath}`
        );
    }

    // ----------------------------------------------------------
    // READ DATA
    // ----------------------------------------------------------

    spots =
        JSON.parse(
            fs.readFileSync(
                spotsPath,
                "utf8"
            )
        );

    if (
        !Array.isArray(spots)
    ) {
        throw new Error(
            "spots.json must contain a JSON array."
        );
    }

    ensureDirectories();

    // ----------------------------------------------------------
    // BACKUP
    // ----------------------------------------------------------

    const backupPath =
        createBackup();

    // ----------------------------------------------------------
    // BUILD INDICES
    // ----------------------------------------------------------

    let indices = [];

    // ----------------------------------------------------------
    // --index
    // ----------------------------------------------------------

    if (
        indexArg !== null
    ) {
        if (
            !Number.isInteger(
                indexArg
            ) ||
            indexArg < 0 ||
            indexArg >=
            spots.length
        ) {
            throw new Error(
                `--index must be an integer from 0 to ${spots.length - 1
                }.`
            );
        }

        indices = [
            indexArg,
        ];
    }

    // ----------------------------------------------------------
    // --start / --limit
    // ----------------------------------------------------------

    else if (
        limitArg !== null ||
        args.includes(
            "--start"
        )
    ) {
        if (
            !Number.isInteger(
                startArg
            ) ||
            startArg < 0 ||
            startArg >=
            spots.length
        ) {
            throw new Error(
                `--start must be an integer from 0 to ${spots.length - 1
                }.`
            );
        }

        if (
            limitArg === null
        ) {
            indices =
                Array.from(
                    {
                        length:
                            spots.length -
                            startArg,
                    },
                    (
                        _,
                        i
                    ) =>
                        startArg + i
                );
        } else {
            if (
                !Number.isInteger(
                    limitArg
                ) ||
                limitArg <= 0
            ) {
                throw new Error(
                    "--limit must be a positive integer."
                );
            }

            const count =
                Math.min(
                    limitArg,
                    spots.length -
                    startArg
                );

            indices =
                Array.from(
                    {
                        length:
                            count,
                    },
                    (
                        _,
                        i
                    ) =>
                        startArg + i
                );
        }
    }

    // ----------------------------------------------------------
    // --all
    // ----------------------------------------------------------

    else if (all) {
        indices =
            Array.from(
                {
                    length:
                        spots.length,
                },
                (
                    _,
                    i
                ) => i
            );
    }

    // ----------------------------------------------------------
    // NOTHING
    // ----------------------------------------------------------

    else {
        printHelp();
        return;
    }

    // ----------------------------------------------------------
    // RUN INFO
    // ----------------------------------------------------------

    console.log(
        `\n🚀 Explorely Image Importer v7.1`
    );

    console.log(
        `   Total spots : ${spots.length}`
    );

    console.log(
        "   Sources    : Wikimedia Commons + Openverse"
    );

    console.log(
        "   Pipeline   : download → validate → Sharp → WebP → Cloudinary → JSON"
    );

    console.log(
        "   Fallback   : strong → related → Wikimedia location"
    );

    console.log(
        "   Protection : manual + existing working URLs"
    );

    console.log(
        `   Backup     : ${backupPath}`
    );

    console.log(
        `\n🎯 This run will process ${indices.length} spot(s).`
    );

    console.log(
        force
            ? "⚠️ FORCE mode: non-protected existing images may be replaced."
            : "✅ Normal mode: working existing URLs and imported images are preserved."
    );

    // ----------------------------------------------------------
    // REPORT
    // ----------------------------------------------------------

    const report = {
        version: "7.1",

        startedAt:
            new Date().toISOString(),

        totalDataset:
            spots.length,

        requested:
            indices.length,

        backupPath,

        results: [],
    };

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    // ----------------------------------------------------------
    // SEQUENTIAL PROCESSING
    // ----------------------------------------------------------

    for (
        let runIndex = 0;
        runIndex <
        indices.length;
        runIndex++
    ) {
        const index =
            indices[runIndex];

        console.log(
            `\n📊 PROGRESS ${runIndex + 1}/${indices.length}`
        );

        try {
            const result =
                await processSpot(
                    spots[index],
                    index
                );

            report.results.push(
                result
            );

            if (
                result.status ===
                "updated"
            ) {
                updated++;
            } else if (
                result.status ===
                "skipped_existing"
            ) {
                skipped++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(
                "\n💥 Spot crashed safely:"
            );

            console.log(
                error.stack ||
                error.message
            );

            report.results.push({
                status:
                    "spot_exception",

                index,

                name:
                    spots[index]?.name,

                error:
                    error.message,
            });

            failed++;
        }
    }

    // ----------------------------------------------------------
    // FINISH REPORT
    // ----------------------------------------------------------

    report.finishedAt =
        new Date().toISOString();

    report.summary = {
        updated,
        skipped,
        failed,
    };

    const reportPath =
        saveReport(
            report
        );

    console.log(
        `\n${"=".repeat(76)}`
    );

    console.log(
        "🏁 RUN FINISHED"
    );

    console.log(
        `${"=".repeat(76)}`
    );

    console.log(
        `✅ Updated : ${updated}`
    );

    console.log(
        `⏭️ Skipped : ${skipped}`
    );

    console.log(
        `⚠️ Failed  : ${failed}`
    );

    console.log(
        `💾 Backup  : ${backupPath}`
    );

    console.log(
        `📄 Report  : ${reportPath}`
    );
}

process.on(
    "unhandledRejection",
    (error) => {
        console.error(
            "\n❌ Unhandled rejection:"
        );

        console.error(
            error
        );
    }
);

main().catch(
    (error) => {
        console.error(
            "\n❌ FATAL ERROR:"
        );

        console.error(
            error.stack ||
            error.message
        );

        process.exitCode = 1;
    }
);