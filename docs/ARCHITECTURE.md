# Architecture and design decisions

## Responsibilities

### Client
- `app/` contains app bootstrap and shared configuration.
- `components/` contains reusable UI primitives and layout.
- `features/seller/` owns seller profile and metric presentation.
- `features/voice/` owns the realtime conversation experience.
- `hooks/` contains reusable client hooks.
- `lib/` contains API and formatting helpers.

### Server
- `config/` loads and validates environment configuration.
- `data/` contains the mock seller fixture.
- `modules/seller/` owns seller read operations.
- `modules/voice/` owns Live API session-token creation.
- `prompts/` contains the Virtual KAM operating instructions.
- `middlewares/` handles errors and request concerns.
- `routes/` mounts versioned API routes.
- `utils/` contains shared helpers.

## Realtime voice flow

1. Client requests a short-lived voice session token from the API.
2. Server uses the permanent Gemini API key to create an ephemeral token.
3. Client connects to Gemini Live using the ephemeral token.
4. Microphone audio is streamed to Gemini; generated audio is played in the browser.
5. Transcription events are rendered in the conversation panel.

## Business reasoning

The sample data establishes:
- Sales declined 32.5%.
- Orders declined 32.5%.
- Cancellation rate increased by 6 percentage points.
- Out-of-stock product count increased from 5 to 18.
- Average selling price remained ₹500.

These are investigation signals, not proof of causation. The agent must ask follow-up questions before attributing the decline to a specific cause.
