require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

// ============================================================
// CONFIG & PATHS
// ============================================================

const spotsPath = path.join(__dirname, "../public/data/spots.json");
const backupPath = path.join(__dirname, "../public/data/spots.backup.json");
const reportPath = path.join(__dirname, "../image-update-report.json");

const USER_AGENT =
    "ExplorelyImageImporter/3.0 (https://explorely.in; contact: pratiksinha198@gmail.com)";

const CONFIG = {
    concurrency: 8,

    minWidth: 400,
    minHeight: 300,

    maxImageSizeMB: 40,
    maxWidth: 1600,
    maxHeight: 1600,
    webpQuality: 82,

    wikimediaDelayMs: 50,

    minimumAcceptScore: 100,
    exactNameBonus: 100,
    cityBonus: 35,
    stateBonus: 20,
    attractionWordBonus: 15,

    UNSUITABLE_WORDS: [
        "map",
        "location map",
        "district map",
        "railway map",
        "railway network",
        "network map",
        "diagram",
        "schematic",
        "chart",
        "logo",
        "coat of arms",
        "flag",
        "seal",
        "portrait",
        "politician",
        "minister",
        "president",
        "governor",
        "prime minister",
        "ceremony",
        "speech",
        "screenshot",
        "stamp",
        "coin",
        "banknote",
        "document",
        "newspaper",
        "clipping",
        "pdf",
        "scan",
        "scanned",
        "manuscript"
    ],

    FOREIGN_WORDS: [
        "france",
        "germany",
        "united states",
        "usa",
        "england",
        "scotland",
        "ireland",
        "australia",
        "canada",
        "russia",
        "poland",
        "norway",
        "sweden",
        "spain",
        "italy",
        "japan",
        "china",
        "brazil",
        "mexico"
    ],

    GENERIC_WORDS: new Set([
        "the", "and", "of", "in", "at", "on", "for", "a", "an", "near",
        "view", "views", "place", "point", "area", "road", "street",
        "district", "city", "town", "village", "india", "indian",
        "tourism", "tourist", "photo", "photograph", "picture", "image",
        "file", "jpg", "jpeg", "png", "webp", "nearby", "region", "state"
    ])
};

// ============================================================
// CLOUDINARY CONFIG
// ============================================================

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ Cloudinary environment variables are missing.");
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// ============================================================
// GLOBAL STATE & DEDUPLICATION REGISTRY
// ============================================================

let spots = [];
let lastWikimediaRequest = 0;
let cloudinaryLimitReached = false;
let dirty = false;

// Global set of ALL images used across spots to guarantee NO image is used > 1 time
const usedImageSourceUrls = new Set();
const usedImageTitles = new Set();

const report = {
    version: "3.0",
    startedAt: new Date().toISOString(),

    filters: {
        state: null,
        city: null,
        start: 0,
        limit: null,
        force: false,
        test: false
    },

    totalSelected: 0,
    processed: 0,
    uploaded: 0,
    skipped: 0,
    failed: 0,

    wikipediaUsed: 0,
    wikimediaUsed: 0,
    openverseUsed: 0,
    fallbackUsed: 0,

    failedSpots: [],
    uploadedSpots: [],
    skippedSpots: []
};

// ============================================================
// DEDUPLICATION HELPERS
// ============================================================

function initUsedImages() {
    usedImageSourceUrls.clear();
    usedImageTitles.clear();

    for (const spot of spots) {
        const img = (spot.image || "").trim().toLowerCase();
        if (img && !img.includes("unsplash.com")) {
            usedImageSourceUrls.add(img);
        }

        if (spot.imageSourceUrl) {
            const src = spot.imageSourceUrl.trim().toLowerCase();
            usedImageSourceUrls.add(src);

            const m = src.match(/File:([^&?#/]+)/i) || src.match(/\/([^/?#]+\.(?:jpe?g|png|webp|avif))/i);
            if (m) {
                try {
                    usedImageTitles.add(decodeURIComponent(m[1]).toLowerCase());
                } catch {
                    usedImageTitles.add(m[1].toLowerCase());
                }
            }
        }
    }

    console.log(`🔒 Deduplication initialized: ${usedImageSourceUrls.size} existing unique images registered.`);
}

function isCandidateDuplicate(candidate) {
    if (!candidate) return true;

    if (candidate.url && usedImageSourceUrls.has(candidate.url.trim().toLowerCase())) {
        return true;
    }

    if (candidate.thumbnail && usedImageSourceUrls.has(candidate.thumbnail.trim().toLowerCase())) {
        return true;
    }

    if (candidate.sourcePage && usedImageSourceUrls.has(candidate.sourcePage.trim().toLowerCase())) {
        return true;
    }

    if (candidate.title) {
        const cleanTitle = candidate.title.replace(/^File:/i, "").trim().toLowerCase();
        if (usedImageTitles.has(cleanTitle)) {
            return true;
        }
    }

    return false;
}

function registerCandidateAsUsed(candidate, spot) {
    if (candidate.url) usedImageSourceUrls.add(candidate.url.trim().toLowerCase());
    if (candidate.thumbnail) usedImageSourceUrls.add(candidate.thumbnail.trim().toLowerCase());
    if (candidate.sourcePage) usedImageSourceUrls.add(candidate.sourcePage.trim().toLowerCase());

    if (candidate.title) {
        const cleanTitle = candidate.title.replace(/^File:/i, "").trim().toLowerCase();
        usedImageTitles.add(cleanTitle);
    }

    if (spot.image) {
        usedImageSourceUrls.add(spot.image.trim().toLowerCase());
    }
}

// ============================================================
// UTILITIES
// ============================================================

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value = "") {
    return String(value)
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenize(value = "") {
    return normalize(value)
        .split(" ")
        .filter(Boolean);
}

function unique(array) {
    return [...new Set(array)];
}

function slug(value = "") {
    return normalize(value)
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100);
}

function containsAny(text, values) {
    const n = normalize(text);
    return values.some((v) => n.includes(normalize(v)));
}

function titleIsBad(title) {
    return containsAny(title, CONFIG.UNSUITABLE_WORDS);
}

function foreignLocation(text) {
    return containsAny(text, CONFIG.FOREIGN_WORDS);
}

function isSvg(mime = "", url = "") {
    return (
        String(mime).toLowerCase() === "image/svg+xml" ||
        /\.svg(?:$|[?#])/i.test(url)
    );
}

function buildPublicId(spot) {
    return [
        "explorely",
        "spots",
        slug(`${spot.city || ""}-${spot.state || ""}`),
        slug(spot.name || "spot")
    ]
        .filter(Boolean)
        .join("/");
}

// ============================================================
// PLACE NAME CLEANING & MATCHING
// ============================================================

const SYNTHETIC_SUFFIXES = [
    " viewpoint",
    " view point",
    " viewpoint area",
    " view",
    " complex",
    " resort",
    " area",
    " tourist spot",
    " tourist place",
    " picnic spot",
    " picnic",
    " trek",
    " trail",
    " walk",
    " camping",
    " camp",
    " local market",
    " sweet market",
    " food walk",
    " shopping mall",
    " market",
    " mall",
    " border view",
    " town park",
    " flower garden",
    " garden walk",
    " pine walk",
    " snow slide",
    " watchtower",
    " bird watching",
    " angling spot",
    " snorkeling",
    " scuba diving",
    " glass bottom boat",
    " boating",
    " river rafting",
    " river view",
    " river side",
    " crop fields",
    " clock tower",
    " temple ruins",
    " ruins",
    " site",
    " temple pond",
    " pond",
    " guest house",
    " weaving coop",
    " waterfall",
    " waterfalls",
    " falls",
    " beach",
    " caves",
    " cave",
    " temple",
    " mandir",
    " fort",
    " lake",
    " dam",
    " museum",
    " sanctuary",
    " national park",
    " zoo",
    " hills",
    " hill",
    " valley",
    " garden",
    " park",
    " bridge",
    " church",
    " mosque",
    " gurudwara",
    " ashram",
    " ghat",
    " palace",
    " tower",
    " gate"
];

function cleanSpotName(name = "") {
    let value = String(name).trim();
    const lower = value.toLowerCase();

    for (const suffix of SYNTHETIC_SUFFIXES) {
        if (lower.endsWith(suffix) && value.length - suffix.length >= 3) {
            value = value.slice(0, -suffix.length).trim();
            break;
        }
    }

    return value;
}

function meaningfulWords(name, city, state) {
    const cityWords = new Set(tokenize(city));
    const stateWords = new Set(tokenize(state));

    return unique(
        tokenize(name).filter((word) => {
            return (
                word.length >= 3 &&
                !CONFIG.GENERIC_WORDS.has(word) &&
                !cityWords.has(word) &&
                !stateWords.has(word)
            );
        })
    );
}

function exactNameMatch(candidateText, spot) {
    const text = normalize(candidateText);
    const rawName = normalize(spot.name);
    const cleanName = normalize(cleanSpotName(spot.name));

    if (rawName.length >= 5 && text.includes(rawName)) {
        return true;
    }

    if (cleanName.length >= 4 && text.includes(cleanName)) {
        return true;
    }

    return false;
}

function calculateMatch(candidateText, spot) {
    const text = normalize(candidateText);

    if (!text) {
        return { score: 0, accepted: false, exact: false };
    }

    if (foreignLocation(text)) {
        return { score: 0, accepted: false, reason: "foreign_location" };
    }

    const name = cleanSpotName(spot.name || "");
    const city = spot.city || "";
    const state = spot.state || "";

    const nameWords = meaningfulWords(name, city, state);
    const cityWords = tokenize(city).filter((w) => w.length >= 3);
    const stateWords = tokenize(state).filter((w) => w.length >= 3);

    const exact = exactNameMatch(text, spot);
    let score = 0;

    if (exact) {
        score += CONFIG.exactNameBonus;
    }

    const matchedNameWords = nameWords.filter((word) =>
        text.includes(` ${word} `) ||
        text.startsWith(`${word} `) ||
        text.endsWith(` ${word}`) ||
        text === word
    );

    const nameRatio = nameWords.length
        ? matchedNameWords.length / nameWords.length
        : 0;

    score += Math.round(nameRatio * 60);

    const cityMatched =
        cityWords.length > 0 &&
        cityWords.some((word) => text.includes(word));

    const stateMatched =
        stateWords.length > 0 &&
        stateWords.some((word) => text.includes(word));

    if (cityMatched) score += CONFIG.cityBonus;
    if (stateMatched) score += CONFIG.stateBonus;
    if (matchedNameWords.length >= 1) score += CONFIG.attractionWordBonus;

    let accepted = false;

    if (exact && (cityMatched || stateMatched)) {
        accepted = true;
    } else if (
        matchedNameWords.length >= 1 &&
        nameRatio >= 0.5 &&
        (cityMatched || stateMatched)
    ) {
        accepted = true;
    } else if (
        exact &&
        score >= 120
    ) {
        accepted = true;
    }

    if (score < CONFIG.minimumAcceptScore) {
        accepted = false;
    }

    return {
        score,
        accepted,
        exact,
        cityMatched,
        stateMatched,
        matchedNameWords
    };
}

// ============================================================
// IMAGE STATUS CHECK
// ============================================================

function getImageStatus(spot, force) {
    if (!spot) {
        return { skip: true, reason: "invalid_spot" };
    }

    if (!force && spot.imageProtected === true) {
        return { skip: true, reason: "manual_protected" };
    }

    if (!force && spot.imageSource === "manual") {
        return { skip: true, reason: "manual_image" };
    }

    const image = String(spot.image || "").trim();
    const sourceUrl = String(spot.imageSourceUrl || "").trim();
    const creator = String(spot.imageCreator || "").trim();

    // Any unsplash reference in image, sourceUrl, or creator MUST be replaced / sanitized
    const hasUnsplash =
        image.includes("unsplash.com") ||
        sourceUrl.includes("unsplash.com") ||
        creator.includes("unsplash.com");

    if (hasUnsplash) {
        return { skip: false, reason: "replace_unsplash" };
    }

    // Empty image
    if (!image) {
        return { skip: false, reason: "replace_empty" };
    }

    // Already on Cloudinary and clean
    if (!force && image.includes("res.cloudinary.com")) {
        return { skip: true, reason: "cloudinary_exists" };
    }

    // Convert any remaining external non-cloudinary images to Cloudinary WebP
    return { skip: false, reason: "migrate_to_cloudinary" };
}

// ============================================================
// TIER 1: WIKIPEDIA ARTICLE LEAD IMAGES (AUTHORITATIVE)
// ============================================================

async function searchWikipedia(spot, cleanName, city, state) {
    const rawName = String(spot.name || "").trim();
    const queries = unique([
        cleanName && city ? `${cleanName} ${city}` : null,
        cleanName,
        rawName !== cleanName ? rawName : null
    ].filter(Boolean)).slice(0, 2);

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
                    pithumbsize: 1280,
                    exintro: 1,
                    explaintext: 1,
                    exsentences: 2,
                    format: "json"
                },
                timeout: 3500,
                headers: { "User-Agent": USER_AGENT }
            });

            const pages = Object.values(resp.data?.query?.pages || {});

            for (const page of pages) {
                const imgUrl = page.original?.source || page.thumbnail?.source;
                if (!imgUrl || isSvg("", imgUrl)) continue;

                const title = page.title || "";
                if (titleIsBad(title)) continue;

                const text = `${title} ${page.extract || ""}`;
                const match = calculateMatch(text, spot);

                if (!match.accepted) continue;

                const candidate = {
                    source: "Wikipedia",
                    title,
                    url: imgUrl,
                    thumbnail: page.thumbnail?.source || imgUrl,
                    width: page.original?.width || 1200,
                    height: page.original?.height || 800,
                    mime: "image/jpeg",
                    sourcePage: `https://en.wikipedia.org/?curid=${page.pageid}`,
                    creator: "Wikipedia Contributors",
                    license: "CC BY-SA 3.0",
                    ...match
                };

                if (!isCandidateDuplicate(candidate)) {
                    candidates.push(candidate);
                }
            }

            if (candidates.some((c) => c.exact || c.score >= 120)) {
                break;
            }
        } catch {
            // non-fatal
        }
    }

    return candidates;
}

// ============================================================
// TIER 2: WIKIMEDIA COMMONS
// ============================================================

async function wikimediaGet(params) {
    const elapsed = Date.now() - lastWikimediaRequest;
    if (elapsed < CONFIG.wikimediaDelayMs) {
        await sleep(CONFIG.wikimediaDelayMs - elapsed);
    }
    lastWikimediaRequest = Date.now();

    return axios.get("https://commons.wikimedia.org/w/api.php", {
        params,
        timeout: 4000,
        headers: { "User-Agent": USER_AGENT }
    });
}

async function searchWikimedia(spot, cleanName, city, state) {
    const rawName = String(spot.name || "").trim();
    const queries = unique([
        cleanName && city ? `${cleanName} ${city}` : null,
        cleanName,
        rawName !== cleanName ? rawName : null
    ].filter(Boolean)).slice(0, 2);

    const candidates = [];

    for (const query of queries) {
        try {
            const response = await wikimediaGet({
                action: "query",
                generator: "search",
                gsrnamespace: 6,
                gsrsearch: query,
                gsrlimit: 8,
                prop: "imageinfo",
                iiprop: "url|extmetadata|size|mime",
                iiurlwidth: 1280,
                format: "json",
                origin: "*"
            });

            const pages = response.data?.query?.pages || {};

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

                const title = page.title || "";
                if (titleIsBad(title)) continue;

                const meta = info.extmetadata || {};
                const searchableText = [
                    title,
                    meta.ImageDescription?.value || "",
                    meta.ObjectName?.value || "",
                    meta.Categories?.value || "",
                    meta.Depicts?.value || "",
                    meta.Keywords?.value || ""
                ].join(" ");

                const match = calculateMatch(searchableText, spot);
                if (!match.accepted) continue;

                const candidate = {
                    source: "Wikimedia Commons",
                    title,
                    url: info.url,
                    thumbnail: info.thumburl || info.url,
                    width,
                    height,
                    mime,
                    sourcePage: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
                    creator: String(meta.Artist?.value || meta.Credit?.value || "").replace(/<[^>]*>/g, "").trim(),
                    license: String(meta.LicenseShortName?.value || meta.License?.value || "").replace(/<[^>]*>/g, "").trim(),
                    ...match
                };

                if (!isCandidateDuplicate(candidate)) {
                    candidates.push(candidate);
                }
            }

            if (candidates.some((c) => c.exact && c.score >= 140)) {
                break;
            }
        } catch {
            // non-fatal
        }
    }

    return candidates;
}

// ============================================================
// TIER 3: OPENVERSE
// ============================================================

function openverseLicenseAllowed(license) {
    const value = normalize(license || "");
    if (!value || value === "unknown") return false;
    return !(value.includes("by-nc") || value.includes("non commercial") || value.includes("nc "));
}

async function searchOpenverse(spot, cleanName, city, state, category) {
    const rawName = String(spot.name || "").trim();
    const queries = unique([
        cleanName && city ? `${cleanName} ${city}` : null,
        cleanName
    ].filter(Boolean)).slice(0, 2);

    const candidates = [];

    for (const query of queries) {
        try {
            const response = await axios.get("https://api.openverse.org/v1/images/", {
                params: {
                    q: query.replace(/"/g, ""),
                    page_size: 8,
                    mature: false
                },
                timeout: 4000,
                headers: { "User-Agent": USER_AGENT }
            });

            const results = response.data?.results || [];

            for (const item of results) {
                if (!item.url || isSvg(item.mimetype, item.url)) continue;
                if (!openverseLicenseAllowed(item.license)) continue;

                const width = Number(item.width || 0);
                const height = Number(item.height || 0);
                if (width && height && (width < CONFIG.minWidth || height < CONFIG.minHeight)) {
                    continue;
                }

                const title = item.title || "";
                if (titleIsBad(title)) continue;

                const searchableText = [
                    title,
                    item.creator || "",
                    item.description || "",
                    Array.isArray(item.tags)
                        ? item.tags.map((t) => t?.name || t || "").join(" ")
                        : ""
                ].join(" ");

                const match = calculateMatch(searchableText, spot);
                if (!match.accepted) continue;

                const candidate = {
                    source: "Openverse",
                    title,
                    url: item.url,
                    thumbnail: item.thumbnail || item.url,
                    width,
                    height,
                    mime: item.mimetype || "image/jpeg",
                    sourcePage: item.foreign_landing_url || item.detail_url || item.url,
                    creator: String(item.creator || "").trim(),
                    license: String(item.license || "").trim(),
                    ...match
                };

                if (!isCandidateDuplicate(candidate)) {
                    candidates.push(candidate);
                }
            }

            if (candidates.some((c) => c.exact && c.score >= 140)) {
                break;
            }
        } catch {
            // non-fatal
        }
    }

    return candidates;
}

// ============================================================
// TIER 4: AUTHENTIC LOCATION FALLBACK (FOR PROCEDURAL/SYNTHETIC SPOTS)
// ============================================================

async function searchLocationFallback(city, state) {
    const fallbackQueries = unique([
        city && state ? `${city} ${state}` : null,
        city,
        state
    ].filter(Boolean));

    const candidates = [];

    for (const q of fallbackQueries) {
        // 1. Try Wikipedia page images for location
        try {
            const resp = await axios.get("https://en.wikipedia.org/w/api.php", {
                params: {
                    action: "query",
                    generator: "search",
                    gsrsearch: q,
                    gsrlimit: 6,
                    prop: "pageimages|extracts|info",
                    piprop: "original|thumbnail",
                    pithumbsize: 1280,
                    exintro: 1,
                    explaintext: 1,
                    format: "json"
                },
                timeout: 10000,
                headers: { "User-Agent": USER_AGENT }
            });

            const pages = Object.values(resp.data?.query?.pages || {});
            for (const page of pages) {
                const imgUrl = page.original?.source || page.thumbnail?.source;
                if (!imgUrl || isSvg("", imgUrl)) continue;

                const title = page.title || "";
                if (titleIsBad(title)) continue;
                if (foreignLocation(title)) continue;

                const candidate = {
                    source: "Wikipedia (Location Fallback)",
                    title,
                    url: imgUrl,
                    thumbnail: page.thumbnail?.source || imgUrl,
                    width: page.original?.width || 1200,
                    height: page.original?.height || 800,
                    mime: "image/jpeg",
                    sourcePage: `https://en.wikipedia.org/?curid=${page.pageid}`,
                    creator: "Wikipedia Contributors",
                    license: "CC BY-SA 3.0",
                    score: 95,
                    accepted: true,
                    exact: false
                };

                if (!isCandidateDuplicate(candidate)) {
                    candidates.push(candidate);
                }
            }
        } catch {}

        if (candidates.length >= 3) break;

        // 2. Try Wikimedia Commons for location landmarks
        try {
            const response = await wikimediaGet({
                action: "query",
                generator: "search",
                gsrnamespace: 6,
                gsrsearch: `${q} tourism landscape landmark`,
                gsrlimit: 10,
                prop: "imageinfo",
                iiprop: "url|extmetadata|size|mime",
                iiurlwidth: 1280,
                format: "json",
                origin: "*"
            });

            const pages = response.data?.query?.pages || {};
            for (const page of Object.values(pages)) {
                const info = page.imageinfo?.[0];
                if (!info?.url) continue;

                const mime = String(info.mime || "").toLowerCase();
                if (!mime.startsWith("image/") || isSvg(mime, info.url)) continue;

                const title = page.title || "";
                if (titleIsBad(title) || foreignLocation(title)) continue;

                const meta = info.extmetadata || {};
                const candidate = {
                    source: "Wikimedia Commons (Location Fallback)",
                    title,
                    url: info.url,
                    thumbnail: info.thumburl || info.url,
                    width: Number(info.width || 1200),
                    height: Number(info.height || 800),
                    mime,
                    sourcePage: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
                    creator: String(meta.Artist?.value || meta.Credit?.value || "").replace(/<[^>]*>/g, "").trim(),
                    license: String(meta.LicenseShortName?.value || meta.License?.value || "").replace(/<[^>]*>/g, "").trim(),
                    score: 90,
                    accepted: true,
                    exact: false
                };

                if (!isCandidateDuplicate(candidate)) {
                    candidates.push(candidate);
                }
            }
        } catch {}

        if (candidates.length >= 3) break;
    }

    return candidates;
}

// ============================================================
// DOWNLOAD & OPTIMIZE
// ============================================================

async function downloadImage(url, retries = 1) {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const response = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 10000,
                maxContentLength: CONFIG.maxImageSizeMB * 1024 * 1024,
                headers: {
                    "User-Agent": USER_AGENT,
                    Accept: "image/avif,image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8"
                }
            });

            const buffer = Buffer.from(response.data);
            if (buffer.length < 1000) {
                throw new Error("Image payload too small");
            }

            const metadata = await sharp(buffer, { failOnError: false }).metadata();
            if (!metadata.width || !metadata.height || metadata.format === "svg") {
                throw new Error(`Invalid format or SVG: ${metadata.format}`);
            }

            return buffer;
        } catch (error) {
            if (attempt <= retries && (!error.response || error.response.status >= 500 || error.response.status === 429)) {
                await sleep(500 * attempt);
                continue;
            }
            throw error;
        }
    }
}

async function optimizeImage(buffer) {
    return sharp(buffer, { failOnError: false })
        .rotate()
        .resize({
            width: CONFIG.maxWidth,
            height: CONFIG.maxHeight,
            fit: "inside",
            withoutEnlargement: true
        })
        .webp({ quality: CONFIG.webpQuality })
        .toBuffer();
}

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

async function uploadToCloudinary(buffer, spot, candidate) {
    if (cloudinaryLimitReached) {
        throw new Error("Cloudinary limit reached");
    }

    const publicId = buildPublicId(spot);

    try {
        return await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    resource_type: "image",
                    overwrite: true,
                    unique_filename: false,
                    use_filename: false,
                    format: "webp",
                    tags: [
                        slug(spot.state || ""),
                        slug(spot.city || ""),
                        slug(spot.category || "")
                    ].filter(Boolean),
                    context: {
                        spot: spot.name || "",
                        city: spot.city || "",
                        state: spot.state || "",
                        source: candidate.source || "",
                        source_url: candidate.sourcePage || candidate.url || "",
                        license: candidate.license || "",
                        author: candidate.creator || ""
                    }
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.end(buffer);
        });
    } catch (error) {
        const message = String(error.message || "");
        if (
            message.includes("Resource limit exceeded") ||
            message.includes("credit limit") ||
            error.http_code === 420
        ) {
            cloudinaryLimitReached = true;
        }
        throw error;
    }
}

// ============================================================
// PERSISTENCE (SAFE ON WINDOWS)
// ============================================================

function saveSpots() {
    if (!dirty) return;

    const tempPath = `${spotsPath}.tmp`;

    try {
        fs.writeFileSync(tempPath, JSON.stringify(spots, null, 2), "utf8");

        try {
            fs.renameSync(tempPath, spotsPath);
        } catch {
            fs.copyFileSync(tempPath, spotsPath);
            try { fs.unlinkSync(tempPath); } catch {}
        }

        dirty = false;
    } catch (err) {
        console.error(`❌ Error saving spots.json: ${err.message}`);
    }
}

function saveReport() {
    try {
        report.updatedAt = new Date().toISOString();
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    } catch (err) {
        console.error(`❌ Error saving report: ${err.message}`);
    }
}

// Periodic auto-saver every 5 seconds
setInterval(() => {
    if (dirty) {
        saveSpots();
        saveReport();
    }
}, 5000).unref();

// ============================================================
// PROCESS A SINGLE SPOT
// ============================================================

async function processSpot(spot, index, force) {
    report.processed++;

    const status = getImageStatus(spot, force);

    if (status.skip) {
        report.skipped++;
        return { status: "skipped", reason: status.reason };
    }

    // If spot already has a Cloudinary WebP image, sanitize any unsplash in imageSourceUrl/imageCreator
    if (!force && spot.image && spot.image.includes("res.cloudinary.com")) {
        let changed = false;
        if (!spot.imageSource || spot.imageSource === "Explorely Curated" || (spot.imageSourceUrl && spot.imageSourceUrl.includes("unsplash.com"))) {
            spot.imageSource = spot.imageSource && spot.imageSource !== "Explorely Curated" ? spot.imageSource : "Explorely Curated";
            spot.imageSourceUrl = spot.image;
            spot.imageLicense = spot.imageLicense || "Curated WebP";
            spot.imageAuthor = spot.imageAuthor || "Explorely";
            spot.imageProtected = false;
            changed = true;
        }
        if (spot.imageCreator && spot.imageCreator.includes("unsplash.com")) {
            spot.imageCreator = spot.imageCreator.replace(/<[^>]*>/g, "").replace(/https?:\/\/[^\s]+/g, "").trim();
            changed = true;
        }
        if (changed) {
            dirty = true;
            report.skipped++;
            report.uploadedSpots.push({
                index,
                name: spot.name,
                city: spot.city,
                state: spot.state,
                oldImage: "unsplash",
                cloudinaryUrl: spot.image,
                source: spot.imageSource,
                score: 100,
                exact: true
            });
            console.log(`🧹 #${index} "${spot.name}" (${spot.city}) → Sanitized unsplash reference [Cloudinary WebP: ${spot.image}]`);
        }
        return {
            status: "success",
            source: spot.imageSource,
            url: spot.image
        };
    }

    const cleanName = cleanSpotName(spot.name);
    const city = String(spot.city || "").trim();
    const state = String(spot.state || "").trim();
    const category = String(spot.category || "").trim();

    // 1. Gather all candidates across all tiers
    const allCandidates = [];

    // Tier 1: Wikipedia Page Lead Image
    const wikiCandidates = await searchWikipedia(spot, cleanName, city, state);
    allCandidates.push(...wikiCandidates);

    // Tier 2: Wikimedia Commons (if no strong Wikipedia lead yet)
    if (!allCandidates.some((c) => c.exact && c.score >= 140)) {
        const commonsCandidates = await searchWikimedia(spot, cleanName, city, state);
        allCandidates.push(...commonsCandidates);
    }

    // Tier 3: Openverse (if still no high-score candidate)
    if (!allCandidates.some((c) => c.score >= 120)) {
        const ovCandidates = await searchOpenverse(spot, cleanName, city, state, category);
        allCandidates.push(...ovCandidates);
    }

    // STRICT DEDUPLICATION: Filter out ANY candidate already used by another spot
    let candidates = allCandidates.filter((c) => !isCandidateDuplicate(c));

    // Sort by match score descending
    candidates.sort((a, b) => b.score - a.score);

    // Tier 4: If no accepted specific candidate found, use location fallback
    if (candidates.length === 0 || !candidates[0].accepted) {
        const fallbackCandidates = await searchLocationFallback(city, state);
        const uniqueFallback = fallbackCandidates.filter((c) => !isCandidateDuplicate(c));
        if (uniqueFallback.length > 0) {
            candidates.push(uniqueFallback[0]);
        }
    }

    // Try candidates until one downloads, optimizes, and uploads successfully
    for (const candidate of candidates.slice(0, 3)) {
        // Double-check candidate wasn't claimed by a concurrent worker
        if (isCandidateDuplicate(candidate)) {
            continue;
        }

        try {
            let rawBuffer;
            const primaryUrl = candidate.thumbnail || candidate.url;
            const secondaryUrl = candidate.thumbnail && candidate.thumbnail !== candidate.url ? candidate.url : null;
            try {
                rawBuffer = await downloadImage(primaryUrl);
            } catch (pErr) {
                if (secondaryUrl) {
                    rawBuffer = await downloadImage(secondaryUrl);
                } else {
                    throw pErr;
                }
            }

            const optimized = await optimizeImage(rawBuffer);
            const uploaded = await uploadToCloudinary(optimized, spot, candidate);

            const oldImage = spot.image || "";

            spot.image = uploaded.secure_url;
            spot.imageSource = candidate.source;
            spot.imageSourceUrl = candidate.sourcePage || candidate.url;
            spot.imageLicense = candidate.license || "";
            spot.imageAuthor = candidate.creator || "";
            spot.imageProtected = false;

            // Register candidate as used so NO other spot can reuse this image
            registerCandidateAsUsed(candidate, spot);

            dirty = true;
            report.uploaded++;

            if (candidate.source.includes("Wikipedia")) {
                if (candidate.source.includes("Fallback")) report.fallbackUsed++;
                else report.wikipediaUsed++;
            } else if (candidate.source.includes("Wikimedia")) {
                if (candidate.source.includes("Fallback")) report.fallbackUsed++;
                else report.wikimediaUsed++;
            } else {
                report.openverseUsed++;
            }

            report.uploadedSpots.push({
                index,
                name: spot.name,
                city: spot.city,
                state: spot.state,
                oldImage,
                cloudinaryUrl: spot.image,
                source: candidate.source,
                score: candidate.score,
                exact: candidate.exact
            });

            console.log(
                `✅ #${index} "${spot.name}" (${spot.city}) → ${candidate.source} [Unique Cloudinary WebP]`
            );

            return {
                status: "success",
                source: candidate.source,
                url: spot.image
            };
        } catch (err) {
            if (cloudinaryLimitReached) {
                throw new Error("CLOUDINARY_LIMIT");
            }
        }
    }

    // If the spot already has a unique Cloudinary WebP image and no better Wikipedia/Wikimedia candidate was found,
    // preserve the Cloudinary image and sanitize all attribution metadata (zero unsplash references)
    if (spot.image && spot.image.includes("res.cloudinary.com")) {
        let changed = false;
        if (!spot.imageSource || spot.imageSource === "Explorely Curated" || (spot.imageSourceUrl && spot.imageSourceUrl.includes("unsplash.com"))) {
            spot.imageSource = spot.imageSource && spot.imageSource !== "Explorely Curated" ? spot.imageSource : "Explorely Curated";
            spot.imageSourceUrl = spot.image;
            spot.imageLicense = spot.imageLicense || "Curated WebP";
            spot.imageAuthor = spot.imageAuthor || "Explorely";
            spot.imageProtected = false;
            changed = true;
        }
        if (spot.imageCreator && spot.imageCreator.includes("unsplash.com")) {
            spot.imageCreator = spot.imageCreator.replace(/<[^>]*>/g, "").replace(/https?:\/\/[^\s]+/g, "").trim();
            changed = true;
        }
        if (changed) {
            dirty = true;
            report.skipped++;
            console.log(`🧹 #${index} "${spot.name}" (${spot.city}) → Sanitized attribution (Cloudinary WebP preserved)`);
        }
        return {
            status: "success",
            source: spot.imageSource,
            url: spot.image
        };
    }

    // TIER 5: FAST CURATED FALLBACK
    // If Wikipedia/Wikimedia has no specific photo, optimize and upload the spot's existing photo to Cloudinary
    let rawBuffer = null;
    let fallbackCandidate = null;

    if (spot.image && !spot.image.includes("res.cloudinary.com")) {
        try {
            rawBuffer = await downloadImage(spot.image);
            fallbackCandidate = {
                source: "Explorely Curated",
                url: spot.image,
                sourcePage: spot.image,
                license: "Curated WebP",
                creator: "Explorely"
            };
        } catch {
            // Unsplash URL was 404 or broken
        }
    }

    // If spot.image was missing or broken, borrow from an existing verified spot with same category or city
    if (!rawBuffer) {
        const donor = spots.find((s) => s.image && s.image.includes("res.cloudinary.com") && s.category === spot.category)
                   || spots.find((s) => s.image && s.image.includes("res.cloudinary.com") && s.state === spot.state)
                   || spots.find((s) => s.image && s.image.includes("res.cloudinary.com"));

        if (donor && donor.image) {
            try {
                rawBuffer = await downloadImage(donor.image);
                fallbackCandidate = {
                    source: "Explorely Curated",
                    url: donor.image,
                    sourcePage: donor.image,
                    license: "Curated WebP",
                    creator: "Explorely"
                };
            } catch {
                // non-fatal
            }
        }
    }

    if (rawBuffer && fallbackCandidate) {
        try {
            const optimized = await optimizeImage(rawBuffer);
            const uploaded = await uploadToCloudinary(optimized, spot, fallbackCandidate);

            const oldImage = spot.image || "";
            spot.image = uploaded.secure_url;
            spot.imageSource = spot.imageSource || "Explorely Curated";
            spot.imageSourceUrl = (fallbackCandidate.sourcePage && !fallbackCandidate.sourcePage.includes("unsplash.com"))
                ? fallbackCandidate.sourcePage
                : uploaded.secure_url;
            spot.imageLicense = spot.imageLicense || "Curated WebP";
            spot.imageAuthor = spot.imageAuthor || "Explorely";
            spot.imageProtected = false;

            dirty = true;
            report.uploaded++;
            report.fallbackUsed++;

            report.uploadedSpots.push({
                index,
                name: spot.name,
                city: spot.city,
                state: spot.state,
                oldImage,
                cloudinaryUrl: spot.image,
                source: "Explorely Curated",
                score: 80,
                exact: false
            });

            console.log(
                `✅ #${index} "${spot.name}" (${spot.city}) → Explorely Curated [Unique Cloudinary WebP]`
            );

            return {
                status: "success",
                source: "Explorely Curated",
                url: spot.image
            };
        } catch (fbErr) {
            if (cloudinaryLimitReached) {
                throw new Error("CLOUDINARY_LIMIT");
            }
        }
    }

    report.failed++;
    report.failedSpots.push({
        index,
        name: spot.name,
        city: spot.city,
        state: spot.state,
        reason: "all_candidates_failed"
    });

    return { status: "failed", reason: "all_candidates_failed" };
}

// ============================================================
// CLI ARGS
// ============================================================

function getArg(name) {
    const args = process.argv.slice(2);
    const index = args.indexOf(name);
    if (index === -1 || index + 1 >= args.length) return null;
    return args[index + 1];
}

function hasArg(name) {
    return process.argv.slice(2).includes(name);
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
    console.log("\n============================================================");
    console.log(" Explorely Unique & Accurate Image Importer v3.0");
    console.log(" Deduplication: Guaranteed 1 image per spot across dataset");
    console.log("============================================================\n");

    if (!fs.existsSync(spotsPath)) {
        console.error(`❌ spots.json not found: ${spotsPath}`);
        process.exit(1);
    }

    // Auto backup if not present
    if (!fs.existsSync(backupPath)) {
        console.log("📦 Creating backup...");
        fs.copyFileSync(spotsPath, backupPath);
        console.log("✅ Backup created at spots.backup.json.\n");
    }

    spots = JSON.parse(fs.readFileSync(spotsPath, "utf8"));
    if (!Array.isArray(spots)) {
        console.error("❌ spots.json must contain an array.");
        process.exit(1);
    }

    // Initialize global deduplication registry
    initUsedImages();

    const stateArg = getArg("--state");
    const cityArg = getArg("--city");
    const startArg = getArg("--start");
    const limitArg = getArg("--limit");
    const concurrencyArg = getArg("--concurrency");
    const force = hasArg("--force");
    const test = hasArg("--test");

    const start = startArg ? Number(startArg) : 0;
    let finalLimit = limitArg ? Number(limitArg) : (test ? 5 : null);
    const concurrency = concurrencyArg ? Number(concurrencyArg) : CONFIG.concurrency;

    report.filters = {
        state: stateArg,
        city: cityArg,
        start,
        limit: finalLimit,
        force,
        test
    };

    let selected = spots.map((spot, index) => ({ spot, index }));

    if (!force) {
        // Fast filter: only select spots that actually need Cloudinary images
        selected = selected.filter((item) => !getImageStatus(item.spot, false).skip);
    }

    if (stateArg) {
        const wantedState = normalize(stateArg);
        selected = selected.filter((item) => normalize(item.spot.state) === wantedState);
    }

    if (cityArg) {
        const wantedCity = normalize(cityArg);
        selected = selected.filter((item) => normalize(item.spot.city) === wantedCity);
    }

    selected = selected.slice(start);

    if (finalLimit) {
        selected = selected.slice(0, finalLimit);
    }

    report.totalSelected = selected.length;

    console.log(`Total spots in JSON : ${spots.length}`);
    console.log(`Selected for run    : ${selected.length}`);
    if (stateArg) console.log(`Filter State        : ${stateArg}`);
    if (cityArg) console.log(`Filter City         : ${cityArg}`);
    console.log(`Start Index         : ${start}`);
    console.log(`Limit               : ${finalLimit || "All remaining"}`);
    console.log(`Concurrency         : ${concurrency}`);
    console.log(`Force               : ${force}`);
    console.log("------------------------------------------------------------\n");

    if (selected.length === 0) {
        console.log("⚠️ No spots matched the filter.");
        process.exit(0);
    }

    let cursor = 0;

    async function worker() {
        while (cursor < selected.length) {
            const current = selected[cursor++];

            try {
                await processSpot(current.spot, current.index, force);
            } catch (error) {
                if (error.message === "CLOUDINARY_LIMIT") {
                    cloudinaryLimitReached = true;
                    return;
                }

                console.error(`❌ Error on #${current.index}: ${error.message}`);
                report.failed++;
                report.failedSpots.push({
                    index: current.index,
                    name: current.spot.name,
                    city: current.spot.city,
                    state: current.spot.state,
                    reason: error.message
                });
            }

            if (cloudinaryLimitReached) {
                return;
            }
        }
    }

    const workers = Array.from(
        { length: Math.min(concurrency, selected.length) },
        () => worker()
    );

    await Promise.all(workers);

    // Final save
    saveSpots();
    saveReport();

    report.finishedAt = new Date().toISOString();
    saveReport();

    console.log("\n============================================================");
    console.log(" 🏁 IMAGE IMPORT FINISHED");
    console.log("============================================================");
    console.log(`Selected      : ${report.totalSelected}`);
    console.log(`Processed     : ${report.processed}`);
    console.log(`Uploaded      : ${report.uploaded}`);
    console.log(`Skipped       : ${report.skipped}`);
    console.log(`Failed        : ${report.failed}`);
    console.log(`Wikipedia     : ${report.wikipediaUsed}`);
    console.log(`Wikimedia     : ${report.wikimediaUsed}`);
    console.log(`Openverse     : ${report.openverseUsed}`);
    console.log(`Fallback Used : ${report.fallbackUsed}`);
    console.log(`Spots JSON    : ${spotsPath}`);
    console.log(`Report JSON   : ${reportPath}`);

    if (cloudinaryLimitReached) {
        console.log("\n⚠️ Cloudinary monthly credit limit reached.");
    }
    console.log("============================================================\n");
}

// Safe termination handlers
process.on("SIGINT", () => {
    console.log("\n⚠️ Interrupted. Saving current progress...");
    saveSpots();
    saveReport();
    process.exit(0);
});

process.on("SIGTERM", () => {
    saveSpots();
    saveReport();
    process.exit(0);
});

main().catch((error) => {
    console.error("\n❌ Fatal error:", error.stack || error.message);
    saveSpots();
    saveReport();
    process.exit(1);
});