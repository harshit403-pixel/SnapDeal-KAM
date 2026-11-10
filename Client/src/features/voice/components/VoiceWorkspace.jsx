
import {
  AudioLines,
  Headphones,
  Mic,
  Phone,
  PhoneOff,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  LoaderCircle,
  Package,
  Users,
  Wallet,
  ClipboardCheck,
} from "lucide-react";

import { useEffect, useRef } from "react";
import { useLiveVoice } from "../hooks/useLiveVoice.js";

export default function VoiceWorkspace() {
  const {
    status,
    transcript,
    error,
    report,
    summaryLoading,
    start,
    stop,
  } = useLiveVoice();

  const endRef = useRef(null);

  const live =
    status === "connected" || status === "connecting";

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [transcript]);

  return (
    <article className="panel call-panel">
      <div className="section-kicker">YOUR VIRTUAL KAM</div>

      <div className={`orb-wrap ${live ? "active" : ""}`}>
        <div className="orb">
          <AudioLines size={36} />
        </div>
      </div>

      <h2>
        {status === "connected"
          ? "I'm listening"
          : status === "connecting"
          ? "Connecting your call..."
          : summaryLoading
          ? "Preparing your KAM report..."
          : "Let's solve this together"}
      </h2>

      <p>
        Start a live conversation to understand what's
        affecting your sales.
      </p>

      {status === "connected" ? (
        <button className="button-surface call-button end" onClick={stop}>
          <PhoneOff size={17} />
          End conversation
        </button>
      ) : (
        <button
          className="button-surface call-button"
          onClick={start}
          disabled={status === "connecting" || summaryLoading}
        >
          <Phone size={17} />
          Start conversation
        </button>
      )}

      <div className="mic-note">
        <Mic size={13} />
        Microphone required · Live voice responses
      </div>

      {/* Conversation */}
      <div className="conversation">
        <div className="conversation-heading">
          <Headphones size={15} />
          LIVE CONVERSATION
        </div>

        {transcript.length === 0 ? (
          <div className="empty-state">
            Your conversation transcript will appear here.
          </div>
        ) : (
          transcript.map((item) => (
            <div
              className={`message ${item.role}`}
              key={item.id}
            >
              <div className="message-role">
                {item.role === "seller" ? "YOU" : "VIRTUAL KAM"}
              </div>
              <p>{item.text}</p>
            </div>
          ))
        )}

        <div ref={endRef} />
      </div>

      {/* Summary loading */}
      {summaryLoading && (
        <div className="summary-loading">
          <LoaderCircle size={20} className="spin" />
          <div>
            <strong>Generating your KAM report</strong>
            <p>
              Analyzing the conversation and preparing
              recommended actions...
            </p>
          </div>
        </div>
      )}

      {/* Post-call report */}
      {report && (
        <section className="kam-report">
          <div className="report-header">
            <div>
              <div className="section-kicker">
                POST-CALL INTELLIGENCE
              </div>
              <h2>Seller Action Plan</h2>
              <p>
                {report.sellerName} · {report.storeName}
              </p>
            </div>
            <ClipboardCheck size={26} />
          </div>

          <div className="report-summary">
            {report.overallSummary}
          </div>

          <div className="report-section">
            <h3>
              <AlertCircle size={17} />
              Identified issues
            </h3>

            {report.issues?.length ? (
              report.issues.map((issue, index) => (
                <div className="report-item" key={index}>
                  <div className="report-item-heading">
                    <strong>{issue.title}</strong>
                    <span className={`issue-status ${issue.status}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p>{issue.evidence}</p>
                </div>
              ))
            ) : (
              <p>No specific issues identified.</p>
            )}
          </div>

          <div className="report-section">
            <h3>
              <Wallet size={17} />
              Seller constraints
            </h3>

            {report.sellerConstraints?.length ? (
              report.sellerConstraints.map((item, index) => (
                <div className="report-list-item" key={index}>
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p>No constraints discussed.</p>
            )}
          </div>

          <div className="report-section">
            <h3>
              <CheckCircle2 size={17} />
              Recommended actions
            </h3>

            {report.recommendations?.map((item, index) => (
              <div className="recommendation-item" key={index}>
                <div className="recommendation-top">
                  <strong>{index + 1}. {item.action}</strong>
                  <span className={`priority ${item.priority}`}>
                    {item.priority}
                  </span>
                </div>
                <p>{item.reason}</p>
              </div>
            ))}
          </div>

          <div className="report-section follow-up-section">
            <h3>
              <CalendarCheck size={17} />
              Follow-up checkpoint
            </h3>

            <strong>{report.followUp?.timeframe || "Not agreed"}</strong>

            <p>
              {report.followUp?.agreedNextStep || "Not discussed"}
            </p>

            {report.followUp?.metricsToReview?.length > 0 && (
              <ul>
                {report.followUp.metricsToReview.map(
                  (metric, index) => (
                    <li key={index}>{metric}</li>
                  )
                )}
              </ul>
            )}
          </div>
        </section>
      )}

      {error && (
        <div className="error-banner">{error}</div>
      )}
    </article>
  );
}
