# Snapdeal Virtual KAM — Technical Note

**Live Demo:** https://snapdeal-kam.onrender.com/  
**GitHub:** https://github.com/harshit403-pixel/SnapDeal-KAM

### 1. Project Overview

Snapdeal Virtual KAM is a voice-first AI assistant designed to help marketplace sellers understand declining business performance. It conducts a natural two-way voice conversation, investigates potential causes using seller metrics and conversational context, and generates a structured post-call report with actionable recommendations.

### 2. Technology and AI Models

- **Frontend:** React.js and Vite for the seller dashboard, voice workspace, transcript and report interface.
- **Backend:** Node.js and Express.js for API endpoints, seller context, secure session-token generation and post-call processing.
- **Real-time AI:** Google Gemini Live API, integrated using the `@google/genai` SDK.
- **Post-call AI:** Gemini Flash for generating structured summaries from the conversation transcript.
- **Voice processing:** Browser MediaDevices and Web Audio API for microphone capture, PCM audio encoding, streaming and audio playback.
- **Deployment:** Docker and Render.

### 3. Voice Interaction Workflow

The frontend requests a voice session from the Express backend. The backend uses its permanent Gemini API key to generate a short-lived, single-use ephemeral token. The permanent key is never exposed to the browser.

The browser uses the ephemeral token to establish a Gemini Live session. Microphone audio is captured, converted into PCM and streamed to the model. Gemini returns generated audio and transcription events, which are played and displayed in the interface.

### 4. Business Reasoning

The assistant receives the sample seller metrics provided in the assignment:

| Metric | Previous | Current |
|---|---:|---:|
| Sales | ₹2,00,000 | ₹1,35,000 |
| Orders | 400 | 270 |
| Cancellation Rate | 8% | 14% |
| ASP | ₹500 | ₹500 |
| Out-of-Stock Products | 5 | 18 |

A structured system prompt guides the assistant to investigate inventory, cancellations, fulfilment, visibility and pricing. It asks one question at a time, adapts to seller responses, distinguishes observed metrics from confirmed causes, and considers operational constraints before recommending actions.

### 5. Post-Call Intelligence

After the conversation, the transcript is sent to the backend. Gemini Flash generates a structured JSON report containing the overall summary, identified issues, seller constraints, prioritized recommendations, follow-up metrics and agreed next steps.

### 6. Scope and Future Scope

The current prototype uses mock seller data and does not access Snapdeal's internal systems or execute operational changes. Recommendations are presented for the seller to review.

A future version could integrate verified seller APIs, monitor inventory and fulfilment metrics, track agreed actions and evaluate business performance during subsequent follow-ups.