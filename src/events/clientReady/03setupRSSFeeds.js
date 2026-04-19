import rssFeedService from "../../services/rssFeedService.js";
import config from "../../configs/config.js";
const { CHANNEL_ID, FEED_URLS, FETCH_INTERVAL } = config.RSS_FEED;

export default async (client) => {
  // Retrieve the RSS feed channel from the client's cached channels
  const RSS_FEED_CHANNEL = client.channels.cache.get(CHANNEL_ID);

  // Check if the RSS feed channel exists
  if (RSS_FEED_CHANNEL) {
    // Set up an interval to fetch and process RSS feeds
    setInterval(() => {
      rssFeedService.fetchAndProcessFeeds(
        RSS_FEED_CHANNEL, // Channel where the feeds will be sent
        FEED_URLS // RSS feed URLs to fetch
      );
    }, FETCH_INTERVAL);

    console.info("[INFO]   RSS feed setup complete.", FETCH_INTERVAL);
  } else {
    console.warn("[WARN]   RSS Feed channel not found!");
  }
};
