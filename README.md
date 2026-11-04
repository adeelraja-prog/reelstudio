# Social Command Center — PWA starter

A single-brand, local-first social publishing dashboard scaffold.

## Included
- Responsive PWA shell (installable when hosted over HTTPS)
- Local queue and draft persistence (IndexedDB/localStorage fallback via browser localStorage)
- Multi-select video files, account targets, per-item schedule slots
- Local-only caption/hashtag/keyword drafting (template-based; no paid AI API)
- Watermark settings and publishing status UI
- GitHub Actions example for scheduled worker heartbeat

## Important platform limits
- Google sign-in authenticates users to *your app*. It does not automatically authorize Meta or YouTube publishing.
- Facebook/Instagram/YouTube publishing requires each platform's OAuth consent, app configuration, permissions, and in some cases platform review.
- Facebook personal-profile publishing is not generally available through the official publishing API. This starter targets Facebook Pages, Instagram Professional accounts, and authorized YouTube channels.
- This scaffold does not pretend to publish. Until provider adapters and credentials are configured, items stay in the local queue.

## Run locally
Open `index.html` in a browser for a UI demo. For installable PWA behavior, serve over HTTPS or localhost.
For a production backend, add a server-side OAuth/token vault, database, object storage, and provider adapters. Never place client secrets or refresh tokens in frontend code.

## Zero-cost target
GitHub Pages can host the static PWA at no cost, but static hosting cannot securely store OAuth tokens or run durable publishing jobs. A backend/worker on a free tier is needed; free quotas and availability can change.
