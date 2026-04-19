import "dotenv/config";
import rssUrls from "./rssURLConfig.json" with { type: "json" };

export default {
  RSS_FEED: {
    FETCH_INTERVAL: (parseInt(process.env.RSS_FETCH_INTERVAL_MINUTES, 10) || 10) * 60 * 1000,
    MAX_FEED_COUNT: parseInt(process.env.RSS_MAX_FEED_COUNT, 10) || 4,
    FEED_URLS: rssUrls.rssUrls,
  },
};
