import axios from "axios";
import * as cheerio from "cheerio";
import { sendSysErrorMessage } from "../../sysErrorEmbed.js";
import { fileURLToPath } from "url";
import path from "path";

const TIMEOUT = 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function getArticleImage(url) {
  try {
    const html = await fetchPageHTML(url);
    if (!html) return null;

    const $ = cheerio.load(html);
    const base = new URL(url);

    // Helper to normalize URLs
    const normalizeUrl = (src) => {
      if (!src) return null;
      src = src.trim();
      if (src.startsWith("//")) return "https:" + src;
      if (src.startsWith("/")) return base.origin + src;
      return src;
    };

    // Helper to get candidate src attributes, skipping spacers
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

      // Handle srcset like "image1.jpg 1x, image2.jpg 2x"
      if (src.includes(",")) {
        const parts = src.split(",").map((p) => p.trim().split(" ")[0]);
        src = parts[parts.length - 1]; // pick largest
      }

      return normalizeUrl(src);
    };

    // 🔹 Step 1: Try image inside <figure>
    const figureImg = $("figure img").first();
    const figureSrc = extractImageSrc(figureImg);
    if (figureSrc) return figureSrc;

    // 🔹 Step 2: Otherwise, find largest image in page
    const images = $("img")
      .map((_, el) => {
        const src = extractImageSrc(el);
        if (!src) return null;

        const width = parseInt($(el).attr("width") || 0);
        const height = parseInt($(el).attr("height") || 0);
        const area = width && height ? width * height : 0;
        return { url: src, area };
      })
      .get()
      .filter(Boolean);

    images.sort((a, b) => b.area - a.area);
    const largestImage = images.length > 0 ? images[0].url : null;

    if (largestImage) return largestImage;

    // 🔹 Step 3: Fallback — OG or Twitter image
    const ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[property="og:image:secure_url"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;

    return ogImage ? normalizeUrl(ogImage) : null;
  } catch (error) {
    console.error(`[ERROR] getArticleImage failed for: ${url}\n`, error.message);
    sendSysErrorMessage(__filename, `- getArticleImage failed for: ${url}`);
    return null;
  }
}
