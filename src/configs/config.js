import "dotenv/config";
import rssUrls from "./rssURLConfig.json" with { type: "json" };

export default {
  GUILD_IDS: process.env.GUILD_IDS?.split(","),
  DEV_GUILD_IDS: process.env.DEV_GUILD_IDS?.split(","),
  DEVELOPER_IDS: process.env.DEVELOPER_IDS?.split(","),

  LOGGING_CHANNEL: {
    INTERACTION_LOG: process.env.INTERACTION_LOG_CHANNEL_ID,
    ERROR_LOG: process.env.ERROR_LOG_CHANNEL_ID,
  },

  // Embed color configuration for different use cases
  EMBED_COLORS: {
    INFORMATION: "#33b5e5",
    PRIMARY: "#edcdc2",
    SUCCESS: "#00c851",
    WARNING: "#ffbb33",
    ERROR: "#ff4444"
  },

  RSS_FEED: {
    CHANNEL_ID: process.env.RSS_CHANNEL_ID,
    FETCH_INTERVAL: (parseInt(process.env.RSS_FETCH_INTERVAL_MINUTES, 10) || 10) * 60 * 1000,
    MAX_FEED_COUNT: parseInt(process.env.RSS_MAX_FEED_COUNT, 10) || 4,
    FEED_URLS: rssUrls.rssUrls,
  },
};
