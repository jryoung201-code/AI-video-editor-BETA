# AI Video Generator

A prompt-to-video web app scaffold with a visual creator workspace, a backend generation-job API, and optional TinyFish-powered research for source-backed scripts and storyboards.

## Current status

This repository started empty, so this build creates the initial application. The UI and project-job API are implemented. The default video provider is intentionally a mock/starter adapter: an actual MP4 renderer requires implementing a provider adapter for a text-to-video API.

TinyFish provides web search/fetch/automation capabilities. It can help gather reference material and verify facts for a video, but it is not itself a video renderer.

## Stack

- Next.js App Router + TypeScript
- React
- Tailwind CSS
- Server-side generation API
- Optional TinyFish research proxy endpoint

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add configuration values as needed.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Environment

- `VIDEO_PROVIDER=mock`: default starter mode. To render clips, implement a provider adapter in `src/lib/video-provider.ts`.
- `VIDEO_PROVIDER_API_KEY`: server-side API key for your selected text-to-video provider.
- `TINYFISH_API_KEY`: optional server-side TinyFish key.
- `TINYFISH_SEARCH_API_URL`: optional HTTPS endpoint for the TinyFish Search API or your server-side TinyFish gateway. Set this to the endpoint for your TinyFish account and the request/response contract it supports.

The research proxy sends `POST { "query": "..." }` to the configured endpoint using a Bearer token. It never sends credentials to browser code. It normalizes common `results` / `organic_results` result arrays where possible.

## Before production

- Add a real video provider adapter with submission, status polling, and asset download support.
- Persist jobs in a database and add user authentication/quotas.
- Set request rate limits and file-size limits.
- Configure TinyFish's current Search API endpoint/schema based on your account's docs.
- Keep all API keys in environment variables; never commit secrets.

