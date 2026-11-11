
import {
  Headphones,
  Mic,
  Phone,
  PhoneOff,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  LoaderCircle,
  Download,
  Package,
  Users,
  Wallet,
  ClipboardCheck,
} from "lucide-react";
import { jsPDF } from "jspdf";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import ParticleMorphOrb from "../../../components/ui/ParticleMorphOrb.tsx";
import {
  Conversation,
  ConversationBubble,
  ConversationContent,
} from "../../../components/ui/conversation.tsx";
import { useLiveVoice } from "../hooks/useLiveVoice.js";

const VoiceWorkspace = forwardRef(function VoiceWorkspace({ onStatusChange }, ref) {
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

  const downloadReport = () => {
    if (!report) return;
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;

    const addWrappedText = (text, fontSize = 10, lineHeight = 5) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(String(text), contentWidth);
      lines.forEach((line) => {
        if (cursorY > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
        pdf.text(line, margin, cursorY);
        cursorY += lineHeight;
      });
    };

    const addSection = (heading, content) => {
      cursorY += 4;
      pdf.setFont("helvetica", "bold");
      addWrappedText(heading, 12, 6);
      pdf.setFont("helvetica", "normal");
      addWrappedText(content);
    };

    pdf.setFont("helvetica", "bold");
    addWrappedText("VIRTUAL KAM - SELLER ACTION PLAN", 16, 8);
    pdf.setFont("helvetica", "normal");
    addWrappedText(`Seller: ${report.sellerName || "Not provided"}`);
    addWrappedText(`Store: ${report.storeName || "Not provided"}`);

    addSection("SUMMARY", report.overallSummary || "Not available.");
    addSection(
      "IDENTIFIED ISSUES",
      report.issues?.length
        ? report.issues
          .map((issue, index) => `${index + 1}. ${issue.title} (${issue.status})\n${issue.evidence}`)
          .join("\n\n")
        : "No specific issues identified.",
    );
    addSection(
      "SELLER CONSTRAINTS",
      report.sellerConstraints?.length
        ? report.sellerConstraints.map((item) => `- ${item}`).join("\n")
        : "None discussed.",
    );
    addSection(
      "RECOMMENDED ACTIONS",
      report.recommendations?.length
        ? report.recommendations
          .map((item, index) => `${index + 1}. ${item.action} [${item.priority}]\n${item.reason}`)
          .join("\n\n")
        : "No recommendations available.",
    );
    addSection(
      "FOLLOW-UP",
      [
        `Timeframe: ${report.followUp?.timeframe || "Not agreed"}`,
        `Next step: ${report.followUp?.agreedNextStep || "Not discussed"}`,
        report.followUp?.metricsToReview?.length
          ? `Metrics to review:\n${report.followUp.metricsToReview.map((metric) => `- ${metric}`).join("\n")}`
          : "",
      ].filter(Boolean).join("\n"),
    );

    pdf.save("virtual-kam-seller-action-plan.pdf");
  };

  useImperativeHandle(ref, () => ({ stop }), [stop]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [transcript]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  return (
    <article className="panel call-panel">
      <div className="section-kicker">YOUR VIRTUAL KAM</div>

      <div className={`orb-wrap particle-morph-wrap ${live ? "active" : ""}`}>
        <ParticleMorphOrb
          className="particle-morph-orb"
          size={94}
          speed={live ? 1.12 : 0.72}
        />
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
          <Conversation className="conversation-feed">
            {transcript.map((item) => (
              <ConversationBubble
                key={item.id}
                align={item.role === "seller" ? "end" : "start"}
                variant={item.role === "seller" ? "default" : "muted"}
              >
                <ConversationContent>
                  <span>{item.text}</span>
                </ConversationContent>
              </ConversationBubble>
            ))}
          </Conversation>
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
            <div className="report-actions"><button className="download-report" onClick={downloadReport}><Download size={14}/> Download report</button><ClipboardCheck size={26} /></div>
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
});

export default VoiceWorkspace;
