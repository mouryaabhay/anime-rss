import "dotenv/config";
import rssUrls from "./rssURLConfig.json" with { type: "json" };

/**
 * Central runtime configuration for webhook mode.
 * Values are loaded from environment variables (GitHub Actions Variables/Secrets or local .env).
 */
export default {
  RSS_FEED: {
    RECENT_LOOKBACK_COUNT: parseInt(process.env.RSS_RECENT_LOOKBACK_COUNT, 10) || 32,
    IMAGE_FETCH_RETRIES: parseInt(process.env.RSS_IMAGE_FETCH_RETRIES, 10) || 5,
    IMAGE_SUCCESS_TTL_HOURS: parseInt(process.env.RSS_IMAGE_SUCCESS_TTL_HOURS, 10) || 24,
    IMAGE_MISS_TTL_MINUTES: parseInt(process.env.RSS_IMAGE_MISS_TTL_MINUTES, 10) || 180,
    FEED_URLS: rssUrls.rssUrls,
  },
};
