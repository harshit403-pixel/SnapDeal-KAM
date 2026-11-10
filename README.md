# Snapdeal Virtual KAM

A voice-first AI account manager demo for the Snapdeal AI First Intern assignment.

## Project structure

- `Client/` — React + Vite application, organized by feature.
- `Server/` — Express API, seller data, Gemini Live token service, prompts and business logic.
- `docs/` — architecture and implementation notes.

## Architecture

The browser captures microphone audio and connects to Gemini Live using a short-lived ephemeral token. The permanent Gemini API key remains on the Express server.

```text
Client (React)
  ├── Seller dashboard and metrics
  ├── Voice session UI and transcript
  ├── Microphone capture / audio playback
  └── Gemini Live WebSocket connection
             │
             ├──────── Express API
             │            ├── GET /api/v1/seller
             │            └── POST /api/v1/voice/session
             │                         │
             │                    Gemini Live API
             │
             └──────── Gemini Live (audio stream)
```

## Local setup

### Server

```bash
cd Server
cp .env.example .env
# Set GEMINI_API_KEY in .env
npm install
npm run dev
```

### Client

```bash
cd Client
npm install
npm run dev
```

Client runs on `http://localhost:5173`; API defaults to `http://localhost:8080`.

## Important

- Uses mock seller data only.
- Do not commit `.env` or expose the permanent API key in the browser.
- The model identifier and Gemini Live API capabilities should be checked against the models enabled for your Google AI project before the demo.
- This is an assignment prototype, not a production seller-support system.
