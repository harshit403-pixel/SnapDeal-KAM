import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 8080),
  geminiApiKey: process.env.GEMINI_API_KEY,
  liveModel: process.env.LIVE_MODEL || "gemini-3.8-live",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
};

if (!env.geminiApiKey) {
  throw new Error("GEMINI_API_KEY is required. Add it to Server/.env.");
}
