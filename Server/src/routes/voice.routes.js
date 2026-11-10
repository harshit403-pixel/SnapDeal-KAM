
import { Router } from "express";
import {
  createVoiceSession,
  createPostCallSummary
} from "../modules/voice/voice.controller.js";

const router = Router();

router.post("/session", createVoiceSession);
router.post("/summary", createPostCallSummary);

export default router;
