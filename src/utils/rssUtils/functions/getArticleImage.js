import axios from "axios";
import * as cheerio from "cheerio";
import { sendSysErrorMessage } from "../../sysErrorEmbed.js";
import { fileURLToPath } from "url";
import path from "path";
import { promises as fsPromises } from "fs";
import config from "../../../configs/config.js";

const TIMEOUT = 5000; // Reduced to 5s to prevent image fetches from blocking workflow
const { RSS_FEED } = config;
const IMAGE_FETCH_RETRIES = Math.max(1, RSS_FEED.IMAGE_FETCH_RETRIES || 3);
const IMAGE_SUCCESS_TTL_MS = Math.max(6, Math.min(24, RSS_FEED.IMAGE_SUCCESS_TTL_HOURS || 12)) * 60 * 60 * 1000;
const IMAGE_MISS_TTL_MS = Math.max(30, RSS_FEED.IMAGE_MISS_TTL_MINUTES || 120) * 60 * 1000;

const __filename = fileURLToPath(import.meta.url);
const CACHE_FILE_PATH = path.join(path.dirname(__filename), "..", "..", "..", "..", "data", "articleImageCache.json");

let cacheLoaded = false;
let cacheLoadPromise = null;
let cacheWritePromise = Promise.resolve();
const imageCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads persisted image cache from disk once per process.
 */
async function loadImageCache() {
  if (cacheLoaded) return;
  if (cacheLoadPromise) return cacheLoadPromise;

  cacheLoadPromise = (async () => {
    try {
      const raw = await fsPromises.readFile(CACHE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      for (const [articleUrl, entry] of Object.entries(parsed)) {
        if (entry && typeof entry === "object") {
          imageCache.set(articleUrl, entry);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn("[WARN] Failed to load image cache; starting with empty cache.", error.message);
      }
    }
    cacheLoaded = true;
  })();

  return cacheLoadPromise;
}

/**
 * Cache entry is valid while expiry timestamp is in the future.
 */
function isCacheEntryValid(entry) {
  if (!entry || !entry.expiresAt) return false;
  const expiresAtMs = new Date(entry.expiresAt).getTime();
  return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();
}

/**
 * Serializes cache writes to avoid concurrent file corruption.
 */
async function persistImageCache() {
  cacheWritePromise = cacheWritePromise.then(async () => {
    await fsPromises.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
    await fsPromises.writeFile(
      CACHE_FILE_PATH,
      JSON.stringify(Object.fromEntries(imageCache), null, 2),
      "utf-8"
    );
  }).catch((error) => {
    console.error("[ERROR] Failed to write image cache.", error.message);
  });

  return cacheWritePromise;
}

async function setCacheHit(articleUrl, imageUrl) {
  imageCache.set(articleUrl, {
    status: "hit",
    imageUrl,
    checkedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + IMAGE_SUCCESS_TTL_MS).toISOString(),
  });
  await persistImageCache();
}

async function setCacheMiss(articleUrl) {
  imageCache.set(articleUrl, {
    status: "miss",
    imageUrl: null,
    checkedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + IMAGE_MISS_TTL_MS).toISOString(),
  });
  await persistImageCache();
}

async function fetchPageHTML(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      },
    });
    return data;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch page HTML for: ${url}\n`, error.message);
    sendSysErrorMessage(__filename, `- Failed to fetch page HTML for: ${url}`);
    return null;
  }
}

/**
 * Extracts the most relevant article image from page HTML.
 * Priority order: figure img -> largest img on page -> og:image / twitter:image meta tags.
 */
function extractImageFromHTML(html, url) {
  const $ = cheerio.load(html);
  const base = new URL(url);

  const normalizeUrl = (src) => {
    if (!src) return null;
    src = src.trim();
    if (src.startsWith("//")) return "https:" + src;
    if (src.startsWith("/")) return base.origin + src;
    return src;
  };

  const extractImageSrc = (el) => {
    const srcCandidates = [
      $(el).attr("data-src"),
      $(el).attr("data-original"),
      $(el).attr("data-lazy-src"),
      $(el).attr("srcset"),
      $(el).attr("src"),
    ].filter(Boolean);

    let src = srcCandidates.find(
      (s) =>
        s &&
        !s.includes("spacer") &&
        !s.endsWith(".gif") &&
        !s.startsWith("data:")
    );
    if (!src) return null;

    if (src.includes(",")) {
      const parts = src.split(",").map((p) => p.trim().split(" ")[0]);
      src = parts[parts.length - 1];
    }

    return normalizeUrl(src);
  };

  // Priority 1: First <img> inside a <figure> tag (hero image).
  const figureImg = $("figure img").first();
  const figureSrc = extractImageSrc(figureImg);
  if (figureSrc) return figureSrc;

  // Priority 2: The <img> with the largest width×height area on the page.
  const images = $("img")
    .map((_, el) => {
      const src = extractImageSrc(el);
      if (!src) return null;

      const width = parseInt($(el).attr("width") || 0, 10);
      const height = parseInt($(el).attr("height") || 0, 10);
      const area = width && height ? width * height : 0;
      return { url: src, area };
    })
    .get()
    .filter(Boolean);

  images.sort((a, b) => b.area - a.area);
  if (images.length > 0) return images[0].url;

  // Priority 3: Fallback to og:image / twitter:image meta tags.
  const ogImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null;
  const normalizedOg = ogImage ? normalizeUrl(ogImage) : null;
  if (normalizedOg) return normalizedOg;

  return null;
}

/**
 * Resolves article image with URL-keyed cache and retry policy.
 * Cache hit/miss entries are scoped to the article URL to prevent cross-article image mixups.
 */
export async function getArticleImage(url) {
  try {
    await loadImageCache();

    const cached = imageCache.get(url);
    if (isCacheEntryValid(cached)) {
      return cached.status === "hit" ? cached.imageUrl : null;
    }

    for (let attempt = 1; attempt <= IMAGE_FETCH_RETRIES; attempt++) {
      const html = await fetchPageHTML(url);
      if (html) {
        const imageUrl = extractImageFromHTML(html, url);
        if (imageUrl) {
          await setCacheHit(url, imageUrl);
          return imageUrl;
        }
      }

      if (attempt < IMAGE_FETCH_RETRIES) {
        await sleep(attempt * 500);
      }
    }

    await setCacheMiss(url);
    return null;
  } catch (error) {
    console.error(`[ERROR] getArticleImage failed for: ${url}\n`, error.message);
    sendSysErrorMessage(__filename, `- getArticleImage failed for: ${url}`);
    return null;
  }
}
