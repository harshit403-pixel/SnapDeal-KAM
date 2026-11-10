
import {
  createLiveSessionToken,
  generateCallSummary
} from "./voice.service.js";

export async function createVoiceSession(_req, res, next) {
  try {
    res.json(await createLiveSessionToken());
  } catch (error) {
    next(error);
  }
}

export async function createPostCallSummary(req, res, next) {
  try {
    const { transcript } = req.body;

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Conversation transcript is required."
      });
    }

    if (transcript.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Conversation is too long to summarize."
      });
    }

    const report = await generateCallSummary(transcript);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
}
