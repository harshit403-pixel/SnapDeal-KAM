# Snapdeal Virtual KAM

A voice-first AI Virtual Key Account Manager built for Snapdeal's AI First Intern assignment.

Snapdeal Virtual KAM helps marketplace sellers investigate declining business performance through natural two-way voice conversations. It understands seller concerns, asks adaptive follow-up questions, considers operational constraints, and generates actionable recommendations with a structured post-call report.

<p align="center">
  <a href="https://snapdeal-kam.onrender.com/">Live Demo</a> ·
  <a href="https://github.com/harshit403-pixel/SnapDeal-KAM">Source Code</a>
</p>

## Overview

Instead of being a conventional chatbot, the Virtual KAM acts as a conversational business partner. It starts with seller performance metrics, investigates possible causes, and helps the seller agree on practical next steps.

### Key Features

- **Real-time voice interaction:** Two-way audio conversation powered by Gemini Live API.
- **Live transcription:** Displays both seller and AI responses during the conversation.
- **Seller performance context:** Uses the sample sales, orders, cancellation, ASP and inventory metrics.
- **Adaptive questioning:** Investigates inventory, cancellations, fulfilment, visibility and pricing based on the seller's responses.
- **Constraint-aware recommendations:** Considers practical limitations such as staff shortages, supplier delays and budget constraints.
- **Post-call intelligence:** Generates a structured report containing issues, seller constraints, recommendations and follow-up actions.
- **Dockerized application:** Client build and Express backend packaged together for deployment.

## Live Demo

https://snapdeal-kam.onrender.com/

Open the application in a modern browser, allow microphone access and start a voice conversation.

A working microphone, audio output and network connection are required for the live voice experience.

## Sample Seller Data

The prototype uses the sample seller metrics provided in the assignment brief.

| Metric | Previous Month | Current Month |
|---|---:|---:|
| Sales | ₹2,00,000 | ₹1,35,000 |
| Orders | 400 | 270 |
| Cancellation Rate | 8% | 14% |
| Average Selling Price | ₹500 | ₹500 |
| Out-of-Stock Products | 5 | 18 |

The sales decline is approximately 32.5%. These metrics are mock assessment data, not live Snapdeal seller data.

## Architecture

```text
                  React + Vite
                       |
              Seller Dashboard
              Voice Workspace
              Live Transcript
                       |
                       v
                 Express API
                       |
            Create Ephemeral Token
                       |
                       v
                Gemini Live API
                       |
             Real-time Audio Stream
                       |
             Audio + Transcription
                       |
                       v
                Post-call Flow
                       |
                 Express API
                       |
                  Gemini Flash
                       |
                       v
             Structured Call Report
```

### Voice Interaction Flow

1. The browser requests a new voice session from the Express backend.
2. The backend uses the permanent Gemini API key to create a short-lived, single-use ephemeral token.
3. The browser connects to Gemini Live using that token.
4. Microphone audio is captured using the browser MediaDevices and Web Audio APIs.
5. Audio is converted into PCM and streamed to Gemini Live.
6. Gemini returns generated audio and transcription events.
7. The browser plays the AI response and displays the conversation transcript.
8. Once the call ends, the transcript is sent to the backend for post-call summarization.

The permanent Gemini API key stays on the backend and is never sent to the browser.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS |
| Backend | Node.js, Express.js |
| AI Voice | Google Gemini Live API |
| AI Summarization | Gemini Flash |
| SDK | @google/genai |
| Browser Audio | Web Audio API, MediaDevices |
| Deployment | Docker, Render |

## Local Setup

### Prerequisites

- Node.js and npm
- Google AI API key with access to the configured Gemini models
- Modern browser with microphone support

### 1. Clone the repository

```bash
git clone https://github.com/harshit403-pixel/SnapDeal-KAM.git
cd SnapDeal-KAM
```

### 2. Configure the backend

```bash
cd Server
cp .env.example .env
npm install
```

Add the following configuration to `Server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
LIVE_MODEL=your_enabled_gemini_live_model
SUMMARY_MODEL=your_enabled_gemini_flash_model
PORT=8080
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Start the frontend

Open another terminal:

```bash
cd Client
npm install
npm run dev
```

Open the local Vite URL, normally:

```text
http://localhost:5173
```

## Docker Setup

Build the image from the repository root:

```bash
docker build -t snapdeal-virtual-kam .
```

Run the container:

```bash
docker run --rm -p 8080:8080 --env-file ./Server/.env snapdeal-virtual-kam
```

Open:

```text
http://localhost:8080
```

## Project Structure

```text
SnapDeal-KAM/
│
├── Client/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       │   ├── dashboard/
│       │   ├── seller/
│       │   └── voice/
│       └── styles/
│
├── Server/
│   └── src/
│       ├── config/
│       ├── data/
│       ├── middlewares/
│       ├── modules/
│       │   ├── seller/
│       │   └── voice/
│       ├── prompts/
│       └── routes/
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── TECHNICAL_NOTE.md
│
├── Dockerfile
└── README.md
```

## Scope and Limitations

- Uses the sample seller data supplied in the assignment.
- Does not connect to Snapdeal's internal seller systems or production APIs.
- Recommendations are generated for the seller to review; inventory and dispatch changes are not executed automatically.
- Follow-up is included in the generated report but is not automatically scheduled or sent.
- Live functionality depends on Gemini API availability, configured model access, browser microphone permissions and network connectivity.

## Future Scope

- Integration with authenticated seller data and product-level analytics.
- Automated low-stock alerts and inventory monitoring.
- Order and fulfilment integration for identifying dispatch bottlenecks.
- Action tracking and measurable follow-up reviews.
- Human account manager escalation for complex issues.

---

Built as a prototype for the Snapdeal AI First Intern assignment.