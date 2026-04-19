import "dotenv/config";
import { WebhookClient } from "discord.js";
import config from "./configs/config.js";
import rssFeedService from "./services/rssFeedService.js";

const { FEED_URLS } = config.RSS_FEED;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

/**
 * One-shot webhook runner used by GitHub Actions schedule and workflow_dispatch.
 */
async function run() {
  if (!webhookUrl) {
    console.error("[ERROR] DISCORD_WEBHOOK_URL is not set.");
    process.exit(1);
  }

  const webhookClient = new WebhookClient({ url: webhookUrl });

  try {
    await rssFeedService.fetchAndProcessFeeds(webhookClient, FEED_URLS);
    console.info("[INFO] RSS webhook run completed.");
  } catch (error) {
    console.error("[ERROR] RSS webhook run failed:", error);
    process.exitCode = 1;
  } finally {
    webhookClient.destroy();
  }
}

await run();
