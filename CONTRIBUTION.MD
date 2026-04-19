# Contributing to RSS Yuki

Thank you for contributing. This repository runs a webhook-only RSS pipeline for Anime News Network feeds.

---

## How to Contribute

1. **Fork the repository** and clone it locally:

```bash
git clone https://github.com/mouryaabhay/rss-yuki.git
cd rss-yuki
````

2. **Install dependencies:**

```bash
npm install
```

3. **Create a branch** for your work:

```bash
git checkout -b feature/your-feature-name
```

4. **Make your changes**.

5. **Test your changes** locally.

6. **Submit a Pull Request** with a clear description of your changes.

---

## Guidelines

* Keep changes webhook-focused. Bot-mode runtime code is out of scope.
* Prefer small, well-scoped pull requests with clear behavior changes.
* Do not hardcode secrets; use GitHub Secrets/Variables or local `.env`.
* Preserve feed ordering and timestamp safety (oldest-first send, successful-send timestamp updates).
* Keep ANN request volume conservative to avoid `429` throttling.

---

## Environment Setup

Make sure your `.env` file is properly configured:

```env
RSS_RECENT_LOOKBACK_COUNT=10
RSS_IMAGE_FETCH_RETRIES=3
RSS_IMAGE_SUCCESS_TTL_HOURS=12
RSS_IMAGE_MISS_TTL_MINUTES=120
DISCORD_WEBHOOK_URL=
```

For GitHub Actions, prefer repository **Secret** `DISCORD_WEBHOOK_URL` and repository **Variables** for other RSS settings.
