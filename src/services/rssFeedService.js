import Parser from "rss-parser";
import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import config from "../configs/config.js";
const { RSS_FEED } = config;
import { getArticleImage } from "../utils/rssUtils/functions/getArticleImage.js";
import { sendEmbedWithImage } from "../utils/rssUtils/functions/sendEmbedWithImage.js";
import { loadTimestamps, saveTimestamps } from "../utils/rssUtils/logging/rssFeedTimestampsLogger.js";
import { sendSysErrorMessage } from "../utils/sysErrorEmbed.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// Rate limiting helpers
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Retries transient operations (network/API) with exponential backoff.
 */
const retryWithBackoff = async (fn, maxRetries = 3, initialDelayMs = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.warn(`[WARN] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }
};

class rssFeedService {
  constructor() {
    this.parser = new Parser(); // Initialize RSS parser
    this.feedTimestamps = new Map(); // Map to store last sent timestamps
    this.timestampsReady = this.initTimestamps(); // Load saved timestamps
  }

  async initTimestamps() {
    this.feedTimestamps = await loadTimestamps();
  }

  async fetchAndProcessFeeds(channel, rssUrls) {
    await this.timestampsReady;

    if (!rssUrls || rssUrls.length === 0) {
      console.warn("[WARN] No RSS feed URLs provided");
      return channel.send("No RSS feed URLs provided.");
    }

    let anyNewFeedSent = false;

    const enabledUrls = rssUrls.filter((feed) => feed.enabled);

    for (const { articleType, url, color } of enabledUrls) {
      if (!url) continue;

      try {
        const lastSentTimestamp = this.feedTimestamps.get(url) || new Date(0);

        // Retry RSS fetch with exponential backoff
        const feed = await retryWithBackoff(
          () => this.parser.parseURL(url),
          3,
          1000
        );

        const sortedFeedItems = this.sortFeedItemsByPubDate(feed.items);
        this.detectPotentialMissedFeeds(
          sortedFeedItems,
          lastSentTimestamp,
          articleType,
          url
        );

        const newFeedItems = this.filterNewFeedItems(sortedFeedItems, lastSentTimestamp);
        // Send oldest first so timestamp progression is safe if later sends fail.
        const sendQueue = [...newFeedItems].sort(
          (a, b) => new Date(a.pubDate) - new Date(b.pubDate)
        );

        // Resolve images in parallel, then send messages in order to keep timestamps consistent.
        const itemsWithImages = await Promise.all(
          sendQueue.map((item) =>
            this.fetchImageForItem(item)
          )
        );

        for (const itemWithImage of itemsWithImages) {
          const wasSent = await this.processAndSendFeedItem(
            channel,
            itemWithImage.item,
            itemWithImage.image,
            url,
            articleType,
            color
          );
          if (wasSent) {
            anyNewFeedSent = true;
          }
          // Throttle Discord sends to ~1 per 300ms to respect rate limits
          await sleep(300);
        }

        this.logFeedFetchStatus(newFeedItems, articleType);
      } catch (error) {
        this.logFeedFetchError(articleType, url, error);
      }

      // Throttle between feeds to ~1 feed per 500ms (rate limit safety)
      await sleep(500);
    }

    if (anyNewFeedSent) {
      await saveTimestamps(this.feedTimestamps);
    }
  }

  async fetchImageForItem(item) {
    try {
      const image = await getArticleImage(item.link);
      return { item, image };
    } catch (error) {
      console.warn(`[WARN] Image fetch failed for ${item.link}, continuing without image`);
      return { item, image: null };
    }
  }

  /**
   * Feed items are sorted newest first for missed-window checks.
   */
  sortFeedItemsByPubDate(items) {
    return [...items].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }

  filterNewFeedItems(items, lastSentTimestamp) {
    return items
      .filter((item) => new Date(item.pubDate) > new Date(lastSentTimestamp));
  }

  /**
   * Alerts when last sent timestamp is outside the latest lookback window.
   * This indicates potential skipped items between runs.
   */
  detectPotentialMissedFeeds(sortedFeedItems, lastSentTimestamp, articleType, url) {
    const lastSentTimeMs = new Date(lastSentTimestamp).getTime();
    if (!Number.isFinite(lastSentTimeMs) || lastSentTimeMs <= 0) {
      return;
    }

    const lookbackItems = sortedFeedItems.slice(0, RSS_FEED.RECENT_LOOKBACK_COUNT);
    if (lookbackItems.length === 0) {
      return;
    }

    const newestTimeMs = new Date(lookbackItems[0].pubDate).getTime();
    if (!Number.isFinite(newestTimeMs) || newestTimeMs <= lastSentTimeMs) {
      return;
    }

    const isLastSentInLookback = lookbackItems.some(
      (item) => new Date(item.pubDate).getTime() === lastSentTimeMs
    );

    if (!isLastSentInLookback) {
      const msg =
        `Potential missed feed window detected:\n` +
        `- Article Type: ${articleType}\n` +
        `- RSS URL: ${url}\n` +
        `- Last Sent Timestamp: ${new Date(lastSentTimeMs).toISOString()}\n` +
        `- Lookback Count: ${RSS_FEED.RECENT_LOOKBACK_COUNT}`;

      console.warn(`[WARN] ${msg}`);
      sendSysErrorMessage(__filename, msg);
    }
  }

  async processAndSendFeedItem(channel, item, ogImage, url, articleType, color) {
    try {
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(item.title)
        .setURL(item.link)
        .setDescription(item.contentSnippet ? `> ${item.contentSnippet}` : "> No description available.")
        .addFields(
          {
            name: "Article Type",
            value: `> ${articleType}`,
            inline: true,
          },
          {
            name: "Categories",
            value: item.categories?.length
              ? `> ${item.categories.join(", ")}`
              : "No categories available",
            inline: true,
          }
        )
        .setTimestamp(new Date(item.pubDate));

      // Button linking to the article
      const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Read Article")
        .setURL(item.link);

      const actionRow = new ActionRowBuilder().addComponents(button);

      // Send with image if available, otherwise just the embed
      await sendEmbedWithImage(channel, embed, ogImage, actionRow);

      this.feedTimestamps.set(url, item.pubDate);
      console.info(`[INFO] New ${articleType} feed sent: ${item.title}`);
      return true;
    } catch (error) {
      console.error(`[ERROR] Failed to process feed item: ${item.link}`, error);
      sendSysErrorMessage(__filename, `- Failed to process feed item: ${item.link}`);
      return false;
    }
  }

  /**
   * Emits info log when no new items are found for a feed category.
   */
  logFeedFetchStatus(newFeedItems, articleType) {
    if (newFeedItems.length === 0) {
      console.log(`[INFO] No new feeds found for ${articleType} Article.`);
    }
  }

  /**
   * Emits an error message with feed metadata to aid troubleshooting.
   */
  logFeedFetchError(articleType, url, error) {
    console.error(`[ERROR] Failed to fetch RSS feed:\n RSS URL: ${url}\n`, error);
    sendSysErrorMessage(
      __filename,
      `There was an error fetching the RSS feed:\n- Article Type: ${articleType}\n- RSS URL: ${url}\n`
    );
  }
}

export default new rssFeedService();
