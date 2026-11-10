import { Router } from "express";
import sellerRoutes from "./seller.routes.js";
import voiceRoutes from "./voice.routes.js";

const router = Router();
router.use("/seller", sellerRoutes);
router.use("/voice", voiceRoutes);
export default router;
