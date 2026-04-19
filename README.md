# RSS Yuki

A GitHub Actions RSS runner built by @mouryaabhay to fetch RSS feeds from Anime News Network and post formatted Discord messages through a webhook. The project is open-source under the MIT License and is intended for private, non-commercial use.

---

## Features

- Fetches RSS feeds from Anime News Network.
- Sends formatted feed updates through a Discord webhook.
- Easy-to-read embeds with Open Graph images.
- Modular, lightweight, and designed for learning and experimentation.

---

## Setup

1. **Clone the repository:**

```bash
git clone https://github.com/mouryaabhay/rss-yuki.git
cd rss-yuki
````

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file** in the root directory with the following structure:

```env
# Keep it above 10 to reduce load on RSS servers
RSS_FETCH_INTERVAL_MINUTES=10

# Keep it between 2–6 to avoid spam and rate limits on Discord
RSS_MAX_FEED_COUNT=4
DISCORD_WEBHOOK_URL=
```

4. **Run the webhook runner:**

```bash
npm run start
```

---

## Configuration

* `RSS_FETCH_INTERVAL_MINUTES` – how often the bot fetches feeds (minimum 10 recommended).
* `RSS_MAX_FEED_COUNT` – max feeds sent per fetch (2–6 recommended).
* `DISCORD_WEBHOOK_URL` – Discord webhook URL used by the GitHub Actions runner.

## GitHub Actions Webhook Mode

If you want GitHub Actions to fetch feeds and post them through a Discord webhook, add `DISCORD_WEBHOOK_URL` as a repository secret and use the workflow in [`.github/workflows/rss-webhook.yml`](.github/workflows/rss-webhook.yml).

The workflow runs on a schedule, posts new feed items to the webhook, and commits the updated [data/rssFeedTimestamps.json](data/rssFeedTimestamps.json) file back to the repository so repeated runs do not repost the same items.
