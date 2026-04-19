# RSS Yuki

A Discord bot built by @mouryaabhay to fetch RSS feeds from Anime News Network directly into your server. The bot is open-source under the MIT License and is intended for private, non-commercial use.

---

## Features

- Fetches RSS feeds from Anime News Network.
- Sends feed updates directly to Discord channels.
- Supports multiple guilds with configurable channels.
- Easy-to-read embeds with Open Graph images.
- Modular, scalable, and designed for learning and experimentation.

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
APP_TOKEN=your_bot_token_here

# ✅ Guilds
GUILD_IDS=
DEV_GUILD_IDS=

# ✅ Developers
DEVELOPER_IDS=

# ✅ Logging Channels
INTERACTION_LOG_CHANNEL_ID=
ERROR_LOG_CHANNEL_ID=

# ✅ RSS Feed Config
RSS_CHANNEL_ID=

# Keep it above 10 to reduce load on RSS servers
RSS_FETCH_INTERVAL_MINUTES=10

# Keep it between 2–6 to avoid spam and rate limits on Discord
RSS_MAX_FEED_COUNT=4

# Optional: use a Discord webhook instead of the bot runtime
DISCORD_WEBHOOK_URL=
```

4. **Run the bot:**

```bash
node ./src/index.js
```

---

## Configuration

* `GUILD_IDS` – comma-separated IDs of servers where the bot will be active.
* `DEV_GUILD_IDS` – comma-separated IDs of dev/test servers.
* `DEVELOPER_IDS` – comma-separated IDs of developers allowed to use dev-only commands.
* `INTERACTION_LOG_CHANNEL_ID` – channel ID for logging command usage.
* `ERROR_LOG_CHANNEL_ID` – channel ID for logging errors.
* `RSS_CHANNEL_ID` – channel ID where RSS feeds will be posted.
* `RSS_FETCH_INTERVAL_MINUTES` – how often the bot fetches feeds (minimum 10 recommended).
* `RSS_MAX_FEED_COUNT` – max feeds sent per fetch (2–6 recommended).

## GitHub Actions Webhook Mode

If you want GitHub Actions to fetch feeds and post them through a Discord webhook, add `DISCORD_WEBHOOK_URL` as a repository secret and use the workflow in [`.github/workflows/rss-webhook.yml`](.github/workflows/rss-webhook.yml).

The workflow runs on a schedule, posts new feed items to the webhook, and commits the updated [data/rssFeedTimestamps.json](data/rssFeedTimestamps.json) file back to the repository so repeated runs do not repost the same items.
