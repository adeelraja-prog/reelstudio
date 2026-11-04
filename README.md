# ReelStudio — Adeel Raja

A single-brand, local-first social publishing dashboard scaffold.

## Included
- Responsive PWA shell (installable when hosted over HTTPS)
- Local queue and draft persistence (IndexedDB/localStorage fallback via browser localStorage)
- Multi-select video files, account targets, per-item schedule slots
- Optional browser-side AI frame captioning using Transformers.js and a free Hugging Face model
- Optional browser-side multilingual Whisper speech transcription (Urdu / English / auto)
- Transcript-based caption and keyword hashtag draft for manual review
- Brand kit with locally saved logo, position and size settings
- Queue editor: preview original video, edit caption/hashtags/destinations/time, reorder and remove items
- Local video files are stored in IndexedDB; queue metadata is stored in this browser
- GitHub Actions workflow to deploy the static PWA to GitHub Pages on every push to `main`

## Important platform limits
- Google sign-in authenticates users to *your app*. It does not automatically authorize Meta or YouTube publishing.
- Facebook/Instagram/YouTube publishing requires each platform's OAuth consent, app configuration, permissions, and in some cases platform review.
- Facebook personal-profile publishing is not generally available through the official publishing API. This starter targets Facebook Pages, Instagram Professional accounts, and authorized YouTube channels.
- This scaffold does not pretend to publish. Until provider adapters and credentials are configured, items stay in the local queue. AI suggestions are drafts and must be checked before use.

## Current app behavior
- The queue is device-local; it does not sync between devices yet. Clearing browser site data can remove locally saved media. AI frame captioning and Whisper transcription run on the user's device after model files are downloaded from Hugging Face; video frames and audio are not sent to an AI inference API. A first model download requires internet and can be large; later use may benefit from browser caching. Performance depends on the device. The frame model describes sampled still images, not the full motion or spoken story. Whisper transcription is limited to 15 minutes per clip and may need manual correction, especially for Urdu names and numbers.
- Queue editing and original-video preview work locally in the browser. The brand logo is saved locally but is not yet burned into exported videos.
- The Accounts screen is not an active OAuth connection flow yet. No social post is published by this version.

## Run locally
Open `index.html` in a browser for a UI demo. For installable PWA behavior, serve over HTTPS or localhost. GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`. One-time owner action required: open **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source, and save. The GitHub Actions integration used here cannot create the Pages site automatically; the deployment workflow will then publish each push to `main`.
The repository includes `supabase/config.toml` and a database migration under `supabase/migrations/`. A linked Supabase GitHub integration can use the repository migrations, but the live project still needs to be linked/deployed and its auth redirect settings configured. For production, add a server-side OAuth/token vault, private object storage, and provider adapters. Never place client secrets or refresh tokens in frontend code.

## Zero-cost target
GitHub Pages can host the static PWA at no cost, but static hosting cannot securely store OAuth tokens or run durable publishing jobs. A backend/worker on a free tier is needed; free quotas and availability can change.
