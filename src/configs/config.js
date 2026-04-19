import "dotenv/config";
import rssUrls from "./rssURLConfig.json" with { type: "json" };

/**
 * Central runtime configuration for webhook mode.
 * Values are loaded from environment variables (GitHub Actions Variables/Secrets or local .env).
 */
export default {
  RSS_FEED: {
    RECENT_LOOKBACK_COUNT: parseInt(process.env.RSS_RECENT_LOOKBACK_COUNT, 10) || 10,
    IMAGE_FETCH_RETRIES: parseInt(process.env.RSS_IMAGE_FETCH_RETRIES, 10) || 3,
    IMAGE_SUCCESS_TTL_HOURS: parseInt(process.env.RSS_IMAGE_SUCCESS_TTL_HOURS, 10) || 12,
    IMAGE_MISS_TTL_MINUTES: parseInt(process.env.RSS_IMAGE_MISS_TTL_MINUTES, 10) || 120,
    FEED_URLS: rssUrls.rssUrls,
  },
};
