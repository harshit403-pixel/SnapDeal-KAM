import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, PhoneOff, X } from "lucide-react";
import VoiceWorkspace from "../../voice/components/VoiceWorkspace.jsx";
import ParticleMorphOrb from "../../../components/ui/ParticleMorphOrb.tsx";
import { getSeller } from "../../seller/services/sellerApi.js";
import { formatINR } from "../../../lib/formatters.js";

const nav = ["Home", "Agent"];

export default function DashboardPage() {
  const [seller, setSeller] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => { getSeller().then(setSeller).catch((error) => setLoadError(error.message)); }, []);
  const openVoice = () => { setVoiceOpen(true); setMobileNav(false); };
  return <main className="landing-page">
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Snapdeal Virtual KAM home"><span className="wordmark-mark">S</span><span>snapdeal</span><em>virtual kam</em></a>
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X /> : <Menu />}</button>
      <nav className={mobileNav ? "site-nav open" : "site-nav"}>{nav.map((item) => item === "Home" ? <a key={item} href="#home" onClick={() => setMobileNav(false)}>{item}</a> : <button key={item} onClick={openVoice}>{item}</button>)}</nav>
      <button className="button-surface dashboard-link" onClick={openVoice}>OPEN VIRTUAL KAM <ArrowRight size={19} /></button>
    </header>
    <section className="hero" id="home">
      <div className="hero-copy"><h1>Your business deserves<br />a smarter account manager.</h1><p className="hero-description">Talk to your AI-powered Virtual KAM, understand what’s affecting your sales, and discover actionable ways to grow your business.</p><button className="button-surface hero-cta" onClick={openVoice}>START A CONVERSATION <span><ArrowRight size={20} /></span></button></div>
      <div className="desert-art" aria-hidden="true" />
      <ProductPreview seller={seller} onOpenVoice={openVoice} />
    </section>
    {loadError && <div className="error-banner landing-error">{loadError}</div>}
    <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
  </main>;
}

function ProductPreview({ seller, onOpenVoice }) {
  const current = seller?.metrics?.thisMonth;
  const previous = seller?.metrics?.lastMonth;
  return <section className="product-preview" aria-label="Seller dashboard preview">
    <aside className="preview-sidebar"><div className="preview-logo"><span className="wordmark-mark">S</span> snapdeal</div><div className="preview-seller-id">{seller?.sellerId || "Loading seller data…"}</div></aside>
    <div className="preview-main">
      <div className="preview-top"><span className="preview-context">SELLER OVERVIEW</span><button className="button-surface preview-action" onClick={onOpenVoice}>Talk to Virtual KAM <ArrowRight size={15}/></button></div>
      <div className="preview-body"><p className="preview-date">{seller?.category || "Seller category"}</p><div className="preview-greeting"><div><h2>{seller?.storeName || "Seller overview"}</h2><p>{seller?.sellerName ? `Account manager for ${seller.sellerName}` : "Performance summary"}</p></div></div>
        <div className="preview-kpis">
          <Kpi label="Sales" value={current ? formatINR(current.sales) : "—"} previous={previous ? formatINR(previous.sales) : null}/>
          <Kpi label="Orders" value={current?.orders ?? "—"} previous={previous?.orders ?? null}/>
          <Kpi label="Cancellation rate" value={current ? `${current.cancellationRate}%` : "—"} previous={previous ? `${previous.cancellationRate}%` : null}/>
          <Kpi label="Out of stock" value={current?.outOfStockProducts ?? "—"} previous={previous?.outOfStockProducts ?? null}/>
          <Kpi label="Average selling price" value={current ? formatINR(current.averageSellingPrice) : "—"} previous={previous ? formatINR(previous.averageSellingPrice) : null}/>
        </div>
        {current && previous && <div className="comparison-panel"><div className="comparison-heading"><div><span>MONTHLY COMPARISON</span><h3>Current month and last month</h3></div><span className="comparison-currency">{seller?.currency || "INR"}</span></div><div className="comparison-grid">{[["Sales", "sales", formatINR], ["Orders", "orders", (v) => v], ["Cancellation rate", "cancellationRate", (v) => `${v}%`], ["Out of stock", "outOfStockProducts", (v) => v], ["Average selling price", "averageSellingPrice", formatINR]].map(([label, key, formatter]) => <div className="comparison-row" key={key}><span>{label}</span><div className="comparison-values"><div><small>Last month</small><strong>{formatter(previous[key])}</strong></div><div><small>This month</small><strong>{formatter(current[key])}</strong></div></div></div>)}</div></div>}
      </div>
    </div>
  </section>;
}
function Kpi({ label, value, previous }) { return <div className="preview-kpi"><span>{label}</span><strong>{value}</strong>{previous !== null && <small>Last month: {previous}</small>}</div>; }

function VoiceModal({ open, onClose }) {
  const [position, setPosition] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [status, setStatus] = useState("disconnected");
  const dialogRef = useRef(null);
  const dragRef = useRef(null);
  const workspaceRef = useRef(null);
  const statusText = status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : status === "error" ? "Connection issue" : "Ready";
  const callActive = status === "connected" || status === "connecting";
  const minimize = useCallback(() => { setMaximized(false); setPosition(null); setMinimized(true); }, []);
  const restore = useCallback(() => setMinimized(false), []);
  const requestClose = useCallback(() => { if (callActive) minimize(); else onClose(); }, [callActive, minimize, onClose]);

  useEffect(() => {
    if (open) { setMinimized(false); setMaximized(false); setPosition(null); }
  }, [open]);

  useEffect(() => {
    if (!open || minimized) return undefined;
    const minimizeOnOutsidePress = (event) => {
      if (!dialogRef.current?.contains(event.target)) minimize();
    };
    document.addEventListener("pointerdown", minimizeOnOutsidePress, true);
    return () => document.removeEventListener("pointerdown", minimizeOnOutsidePress, true);
  }, [minimize, minimized, open]);

  const clampPosition = useCallback((next) => {
    const box = dialogRef.current?.getBoundingClientRect();
    const width = box?.width || 520;
    const height = minimized ? 54 : (box?.height || 560);
    return { x: Math.max(8, Math.min(window.innerWidth - width - 8, next.x)), y: Math.max(8, Math.min(window.innerHeight - height - 8, next.y)) };
  }, [minimized]);

  useEffect(() => {
    const resize = () => setPosition((current) => current ? clampPosition(current) : current);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [clampPosition]);

  const startDrag = (event) => {
    if (event.target.closest("button")) return;
    event.preventDefault();
    const rect = dialogRef.current.getBoundingClientRect();
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    setPosition(clampPosition({ x: dragRef.current.left + event.clientX - dragRef.current.x, y: dragRef.current.top + event.clientY - dragRef.current.y }));
  };
  const stopDrag = () => { dragRef.current = null; };
  const toggleMaximize = () => { setPosition(null); setMaximized((value) => !value); setMinimized(false); };
  const style = position && !maximized ? { left: position.x, top: position.y, transform: "none" } : undefined;

  return <div className={open ? "voice-layer open" : "voice-layer"} aria-hidden={!open}>
    <section ref={dialogRef} className={`voice-dialog${minimized ? " minimized" : ""}${maximized ? " maximized" : ""}`} style={style} role="dialog" aria-modal="true" aria-label="Virtual KAM voice assistant" tabIndex="-1">
      <header className={`voice-modal-header${minimized ? " minimized-header" : ""}`} onPointerDown={minimized ? undefined : startDrag} onPointerMove={minimized ? undefined : moveDrag} onPointerUp={minimized ? undefined : stopDrag} onPointerCancel={stopDrag}>
        {minimized ? <><button className="minimized-orb" onClick={restore} aria-label="Restore Virtual KAM"><ParticleMorphOrb size={42} speed={callActive ? 1.12 : .72}/></button><div className="minimized-actions">{callActive && <button className="minimized-end" onClick={() => workspaceRef.current?.stop()} aria-label="End conversation"><PhoneOff size={16}/></button>}<button className="minimized-close" onClick={requestClose} aria-label={callActive ? "Keep call minimized" : "Close Virtual KAM"}><X size={17}/></button></div></> : <><div className="window-controls"><button className="traffic-light close" onClick={requestClose} aria-label="Close Virtual KAM"/><button className="traffic-light minimize" onClick={minimize} aria-label="Minimize Virtual KAM"/><button className="traffic-light maximize" onClick={toggleMaximize} aria-label={maximized ? "Restore window" : "Maximize window"}/></div><div className="window-title"><strong>Virtual KAM</strong><span className={`window-status ${status}`}>{statusText}</span></div><span className="window-drag-space"/></>}
      </header>
      <div className="voice-window-content" hidden={minimized}><VoiceWorkspace ref={workspaceRef} onStatusChange={setStatus} /></div>
    </section>
  </div>;
}
