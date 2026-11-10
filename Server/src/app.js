import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_req, res) => res.json({ status: "ok", service: "virtual-kam-api" }));
  app.use("/api/v1", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
