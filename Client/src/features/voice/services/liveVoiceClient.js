import { GoogleGenAI, Modality } from "@google/genai";
import { API_BASE_URL } from "../../../app/config.js";

function encodePCM(float32) {
  const pcm = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32[i]));
    pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function decodePCM(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

export class LiveVoiceClient {
  constructor({ onStatus, onTranscript, onError }) {
    this.onStatus = onStatus;
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.session = null;
    this.stream = null;
    this.inputContext = null;
    this.outputContext = null;
    this.processor = null;
    this.source = null;
    this.nextPlayTime = 0;
    this.sources = new Set();
    this.closed = false;
  }

  async connect() {
    this.closed = false;
    this.onStatus("connecting");

    const response = await fetch(`${API_BASE_URL}/voice/session`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Unable to create voice session.");

    const ai = new GoogleGenAI({ apiKey: payload.token });
    this.session = await ai.live.connect({
      model: payload.model,
      config: { ...payload.config, responseModalities: [Modality.AUDIO] },
      callbacks: {
        onopen: () => this.onStatus("connected"),
        onmessage: (message) => this.handleMessage(message),
        onerror: (event) => this.onError(event?.message || "Voice connection error."),
        onclose: () => { if (!this.closed) this.onStatus("disconnected"); }
      }
    });

    this.outputContext = new AudioContext({ sampleRate: 24000 });
    await this.outputContext.resume();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });

    this.inputContext = new AudioContext({ sampleRate: 16000 });
    await this.inputContext.resume();
    this.source = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (event) => {
      if (this.closed || !this.session) return;
      this.session.sendRealtimeInput({
        audio: {
          data: encodePCM(event.inputBuffer.getChannelData(0)),
          mimeType: `audio/pcm;rate=${this.inputContext.sampleRate}`
        }
      });
    };
    this.source.connect(this.processor);
    this.processor.connect(this.inputContext.destination);

    this.session.sendRealtimeInput({ text: "Please begin the call now with your opening greeting as the seller's Virtual KAM." });
  }

  handleMessage(message) {
    const content = message?.serverContent;
    if (!content) return;

    if (content.inputTranscription?.text) this.onTranscript("seller", content.inputTranscription.text);
    if (content.outputTranscription?.text) this.onTranscript("kam", content.outputTranscription.text);
    if (content.interrupted) this.stopPlayback();

    for (const part of content.modelTurn?.parts || []) {
      if (part.inlineData?.data && part.inlineData.mimeType?.startsWith("audio/pcm")) {
        this.playAudio(part.inlineData.data);
      }
    }
  }

  playAudio(base64) {
    if (!this.outputContext || this.closed) return;
    const pcm = decodePCM(base64);
    const samples = Float32Array.from(pcm, (sample) => sample / 32768);
    const buffer = this.outputContext.createBuffer(1, samples.length, 24000);
    buffer.copyToChannel(samples, 0);
    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);
    this.nextPlayTime = Math.max(this.nextPlayTime, this.outputContext.currentTime + 0.02);
    source.start(this.nextPlayTime);
    this.nextPlayTime += buffer.duration;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  stopPlayback() {
    for (const source of this.sources) {
      try { source.stop(); } catch { /* Source may already be stopped. */ }
    }
    this.sources.clear();
    if (this.outputContext) this.nextPlayTime = this.outputContext.currentTime;
  }

  async disconnect() {
    this.closed = true;
    this.stopPlayback();
    this.processor?.disconnect();
    this.source?.disconnect();
    this.processor && (this.processor.onaudioprocess = null);
    this.stream?.getTracks().forEach((track) => track.stop());
    this.session?.close();
    await Promise.allSettled([this.inputContext?.close(), this.outputContext?.close()]);
    this.session = this.stream = this.inputContext = this.outputContext = this.processor = this.source = null;
    this.onStatus("disconnected");
  }
}
