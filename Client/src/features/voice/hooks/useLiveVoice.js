
import { useRef, useState } from "react";
import { LiveVoiceClient } from "../services/liveVoiceClient.js";
import { API_BASE_URL } from "../../../app/config.js";

function appendTranscriptChunk(items, role, text) {
  if (!text?.trim()) return items;

  const lastMessage = items[items.length - 1];

  if (lastMessage && lastMessage.role === role) {
    const needsSpace =
      lastMessage.text.length > 0 &&
      !/\s$/.test(lastMessage.text) &&
      !/^[\s.,!?;:)\]]/.test(text);

    return [
      ...items.slice(0, -1),
      {
        ...lastMessage,
        text: lastMessage.text + (needsSpace ? " " : "") + text,
      },
    ];
  }

  return [
    ...items,
    {
      id: crypto.randomUUID(),
      role,
      text,
    },
  ];
}

export function useLiveVoice() {
  const clientRef = useRef(null);
  const transcriptRef = useRef([]);

  const [status, setStatus] = useState("disconnected");
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  function updateTranscript(role, text) {
    const updated = appendTranscriptChunk(
      transcriptRef.current,
      role,
      text
    );

    transcriptRef.current = updated;
    setTranscript(updated);
  }

  async function start() {
    setError("");
    setReport(null);

    transcriptRef.current = [];
    setTranscript([]);

    const client = new LiveVoiceClient({
      onStatus: setStatus,
      onError: setError,
      onTranscript: updateTranscript,
    });

    clientRef.current = client;

    try {
      await client.connect();
    } catch (err) {
      setError(err.message || "Unable to start the voice session.");
      setStatus("error");

      await client.disconnect().catch(() => {});
      clientRef.current = null;
    }
  }

  async function stop() {
    const client = clientRef.current;

    if (!client) return;

    // Stop the live call first.
    await client.disconnect();
    clientRef.current = null;

    const finalTranscript = transcriptRef.current;

    if (finalTranscript.length === 0) {
      setError("No conversation was captured. Please try again.");
      return;
    }

    // Generate the post-call report.
    setSummaryLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/voice/summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: finalTranscript,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.message ||
          payload.error ||
          "Unable to generate the call summary."
        );
      }

      setReport(payload.report);
    } catch (err) {
      setError(
        err.message || "Unable to generate the call summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  return {
    status,
    transcript,
    error,
    report,
    summaryLoading,
    start,
    stop,
  };
}
