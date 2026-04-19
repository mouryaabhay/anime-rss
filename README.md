# Anime RSS

[![RSS Feed Webhook](https://github.com/mouryaabhay/anime-rss/actions/workflows/rss-webhook.yml/badge.svg?branch=main)](https://github.com/mouryaabhay/anime-rss/actions/workflows/rss-webhook.yml?query=branch%3Amain)

If the badge shows `no status`, trigger the workflow once from the Actions tab using **Run workflow**.

A GitHub Actions RSS runner built to fetch RSS feeds from Anime News Network and post formatted Discord messages through a webhook. The project is open-source under the MIT License and is intended for private, non-commercial use.

---

## Features

- Fetches RSS feeds from Anime News Network.
- Sends formatted feed updates through a Discord webhook.
- Easy-to-read embeds with intelligent image extraction:
  1. First: `<img>` inside `<figure>` tags (hero images).
  2. Then: Largest `<img>` on the page (by width × height area).
  3. Fallback: `og:image` or `twitter:image` meta tags.
- Persistent caching to avoid redundant image fetches.
- Modular, lightweight, and designed for learning and experimentation.

---

## GitHub Actions Setup

1. **Clone the repository:**

```bash
git clone https://github.com/mouryaabhay/anime-rss.git
cd anime-rss
````

2. **Install dependencies:**

```bash
npm install
```

3. **Configure GitHub repo settings** (this is the primary runtime configuration path).

If you want GitHub Actions to fetch feeds and post them through a Discord webhook, add `DISCORD_WEBHOOK_URL` as a repository secret and use the workflow in [`.github/workflows/rss-webhook.yml`](.github/workflows/rss-webhook.yml).

The workflow runs on a schedule, posts new feed items to the webhook, and commits the updated [data/rssFeedTimestamps.json](data/rssFeedTimestamps.json) file back to the repository so repeated runs do not repost the same items.

### Configure Through GitHub Repo Settings

1. Go to your repository on GitHub.
2. Open **Settings** -> **Secrets and variables** -> **Actions**.
3. In **Secrets**, create:
	- `DISCORD_WEBHOOK_URL` = your Discord webhook URL
4. In **Variables**, create (optional overrides, defaults are in code):
	- `RSS_RECENT_LOOKBACK_COUNT` = `32`
	- `RSS_IMAGE_FETCH_RETRIES` = `5`
	- `RSS_IMAGE_SUCCESS_TTL_HOURS` = `24` (allowed range in code: 6 to 24)
	- `RSS_IMAGE_MISS_TTL_MINUTES` = `180`
5. Go to **Settings** -> **Actions** -> **General**.
6. Ensure **Workflow permissions** is set to **Read and write permissions** (required to commit `data/rssFeedTimestamps.json`).
7. Go to the **Actions** tab, open **RSS Feed Webhook**, and click **Run workflow** once to verify setup.

### Notes

- The schedule (`cron`) is configured in [`.github/workflows/rss-webhook.yml`](.github/workflows/rss-webhook.yml) and cannot be changed from repo Variables.
- If a Variable is not set, the code-level defaults from [src/configs/config.js](src/configs/config.js) are used.

### Check Workflow Status on GitHub Web

1. Open your repository on GitHub and go to the **Actions** tab.
2. Click **RSS Feed Webhook**.
3. Check the latest run status:
	- **In progress** (yellow dot)
	- **Queued** (gray)
	- **Success** (green)
	- **Failed** (red)
4. Click a run to view live logs and step-by-step progress.

---

## Optional Local Test

Local execution is optional and intended for debugging only.

1. Create a `.env` file:

```env
DISCORD_WEBHOOK_URL=
RSS_RECENT_LOOKBACK_COUNT=32
RSS_IMAGE_FETCH_RETRIES=5
RSS_IMAGE_SUCCESS_TTL_HOURS=24
RSS_IMAGE_MISS_TTL_MINUTES=180
```

2. Run:

```bash
npm run start
```
