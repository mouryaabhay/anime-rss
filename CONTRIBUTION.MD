# Contributing to Aven

Thank you for considering contributing! This project is open-source and contributions to improve the code, fix bugs, or add features are very welcome.

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

* Keep the code modular and maintainable.
* Use consistent naming conventions and formatting.
* Ensure RSS fetch intervals remain reasonable to avoid overloading servers.
* Avoid hardcoding tokens or sensitive data. Use `.env` for configuration.
* Contributions to improve code quality, readability, or efficiency are encouraged.

---

## Environment Setup

Make sure your `.env` file is properly configured:

```env
APP_TOKEN=your_bot_token_here
GUILD_IDS=
DEV_GUILD_IDS=
DEVELOPER_IDS=
INTERACTION_LOG_CHANNEL_ID=
ERROR_LOG_CHANNEL_ID=
RSS_CHANNEL_ID=
RSS_FETCH_INTERVAL_MINUTES=10
RSS_MAX_FEED_COUNT=4
```

**Note:** Keep the `RSS_FETCH_INTERVAL_MINUTES` above 10 and `RSS_MAX_FEED_COUNT` between 2–6 to prevent spam and rate limits.
