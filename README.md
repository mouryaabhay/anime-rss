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
# ---------- Repository Secrets ---------- #

# Required for GitHub Actions webhook mode
DISCORD_WEBHOOK_URL=


# ---------- Repository Variables ---------- #

# Number of latest feed items to compare against last sent timestamp for missed-feed detection
RSS_RECENT_LOOKBACK_COUNT=10

# Image extraction behavior
RSS_IMAGE_FETCH_RETRIES=3
RSS_IMAGE_SUCCESS_TTL_HOURS=12
RSS_IMAGE_MISS_TTL_MINUTES=120
```

4. **Run the webhook runner:**

```bash
npm run start
```

---

## Configuration

* `RSS_RECENT_LOOKBACK_COUNT` – number of most recent feed items used to detect potential missed windows (default 10).
* `RSS_IMAGE_FETCH_RETRIES` – number of retries to resolve an image before sending without one (default 3).
* `RSS_IMAGE_SUCCESS_TTL_HOURS` – cache TTL for successful image resolution (min 6, max 24, default 12).
* `RSS_IMAGE_MISS_TTL_MINUTES` – cache TTL for misses before retrying image resolution (default 120).
* `DISCORD_WEBHOOK_URL` – Discord webhook URL used by the GitHub Actions runner.

## GitHub Actions Webhook Mode

If you want GitHub Actions to fetch feeds and post them through a Discord webhook, add `DISCORD_WEBHOOK_URL` as a repository secret and use the workflow in [`.github/workflows/rss-webhook.yml`](.github/workflows/rss-webhook.yml).

The workflow runs on a schedule, posts new feed items to the webhook, and commits the updated [data/rssFeedTimestamps.json](data/rssFeedTimestamps.json) file back to the repository so repeated runs do not repost the same items.

### Configure Through GitHub Repo Settings

1. Go to your repository on GitHub.
2. Open **Settings** -> **Secrets and variables** -> **Actions**.
3. In **Secrets**, create:
	- `DISCORD_WEBHOOK_URL` = your Discord webhook URL
4. In **Variables**, create (optional overrides, defaults are in code):
	- `RSS_RECENT_LOOKBACK_COUNT` = `10`
	- `RSS_IMAGE_FETCH_RETRIES` = `3`
	- `RSS_IMAGE_SUCCESS_TTL_HOURS` = `12` (allowed range in code: 6 to 24)
	- `RSS_IMAGE_MISS_TTL_MINUTES` = `120`
5. Go to **Settings** -> **Actions** -> **General**.
6. Ensure **Workflow permissions** is set to **Read and write permissions** (required to commit `data/rssFeedTimestamps.json`).
7. Go to the **Actions** tab, open **RSS Feed Webhook**, and click **Run workflow** once to verify setup.

### Notes

- The schedule (`cron`) is configured in [`.github/workflows/rss-webhook.yml`](.github/workflows/rss-webhook.yml) and cannot be changed from repo Variables.
- If a Variable is not set, the code-level defaults from [src/configs/config.js](src/configs/config.js) are used.
