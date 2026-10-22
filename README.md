# AI Video Generator

A prompt-to-video web app scaffold with a clean browser UI, a generation job API, and optional TinyFish-assisted research for source-backed scripts and storyboards.

## Current status

This repository started empty. The first commit establishes the app scaffold. TinyFish is a web research/automation service, not itself a video renderer; connect a text-to-video provider for rendered clips.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Server-side generation API adapter
- Optional TinyFish Search API for research (keep credentials on the server)

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add your video provider credentials.
4. Run `npm run dev`.

The UI can create project prompts and storyboards immediately. Rendering requires configuring a compatible provider in `src/lib/video-provider.ts`.

## Environment

- `VIDEO_PROVIDER`: currently `mock` by default; configure a provider adapter before production rendering.
- `VIDEO_PROVIDER_API_KEY`: secret key for your selected video generation provider.
- `TINYFISH_API_KEY`: optional; used only for research functionality.

Never expose API keys in client-side code or commit them to GitHub.