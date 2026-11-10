import { createElement, useEffect, useState } from "react";
import { ArrowRight, BarChart3, Boxes, LayoutDashboard, Menu, MessageCircle, Search, X, Minus, Bell, ChevronDown } from "lucide-react";
import VoiceWorkspace from "../../voice/components/VoiceWorkspace.jsx";
import { getSeller } from "../../seller/services/sellerApi.js";

const nav = ["Home", "Agent", "About", "How It Works"];
const menu = [[LayoutDashboard, "Overview"], [BarChart3, "Seller Performance"], [Boxes, "Products"], [MessageCircle, "Conversations"], [BarChart3, "Reports"]];

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
      <nav className={mobileNav ? "site-nav open" : "site-nav"}>{nav.map((item) => <button key={item} onClick={item === "Agent" ? openVoice : undefined}>{item}</button>)}</nav>
      <button className="button-surface dashboard-link" onClick={openVoice}>SIGN IN <ArrowRight size={19} /></button>
    </header>
    <section className="hero" id="home">
      <div className="hero-copy"><p className="hero-eyebrow">AI-POWERED SELLER GROWTH</p><h1>Your business deserves<br />a smarter account manager.</h1><p className="hero-description">Talk to your AI-powered Virtual KAM, understand what’s affecting your sales, and discover actionable ways to grow your business.</p><button className="button-surface hero-cta" onClick={openVoice}>START A CONVERSATION <span><ArrowRight size={20} /></span></button><p className="hero-footnote">Intelligent insights. Real conversations. Better decisions.</p></div>
      <div className="desert-art" aria-hidden="true" />
      <ProductPreview seller={seller} />
    </section>
    {loadError && <div className="error-banner landing-error">{loadError}</div>}
    <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} />
  </main>;
}

function ProductPreview({ seller }) {
  const metrics = seller?.metrics?.thisMonth;
  return <section className="product-preview" aria-label="Seller dashboard preview"><aside className="preview-sidebar"><div className="preview-logo"><span className="wordmark-mark">S</span> snapdeal</div><div className="preview-menu">{menu.map(([Icon, label], index) => <div className={index === 0 ? "preview-menu-item selected" : "preview-menu-item"} key={label}>{createElement(Icon, { size: 15 })}<span>{label}</span></div>)}</div><div className="preview-projects"><span>QUICK VIEWS</span><button>+</button><p><i className="blue-dot"/> Growth opportunities</p><p><i className="orange-dot"/> Inventory health</p></div></aside><div className="preview-main"><div className="preview-top"><div className="search"><Search size={15}/><span>Search insights or ask a question</span><kbd>⌘ K</kbd></div><button className="preview-action">Ask Virtual KAM <ChevronDown size={14}/></button><Bell size={18}/><div className="avatar">AS</div></div><div className="preview-body"><p className="preview-date">SELLER PERFORMANCE · NOVEMBER</p><div className="preview-greeting"><div><h2>Good morning, {seller?.sellerName?.split(" ")[0] || "Seller"}.</h2><p>Here’s the health of your store today.</p></div><button className="outlined-action">Share report</button></div><div className="preview-kpis"><Kpi label="Total sales" value={metrics ? `₹${Number(metrics.sales).toLocaleString("en-IN")}` : "₹1,35,000"} note="vs. last month"/><Kpi label="Total orders" value={metrics?.orders || "270"} note="this month"/><Kpi label="Cancellation rate" value={metrics ? `${metrics.cancellationRate}%` : "14%"} note="needs attention" warn/><Kpi label="Out-of-stock products" value={metrics?.outOfStockProducts || "18"} note="restock soon" warn/></div><div className="preview-grid"><div className="chart-card"><div className="card-title"><strong>Sales performance</strong><span><i className="legend prior"/> Previous month <i className="legend current"/> Current month</span></div><div className="bar-chart">{[42,58,45,72,62,80,69,92,76,63,82,95].map((n,i) => <div className="chart-group" key={i}><i style={{height:`${Math.max(18,n-18)}%`}}/><b style={{height:`${n}%`}}/></div>)}</div><div className="chart-labels"><span>01 Nov</span><span>10 Nov</span><span>20 Nov</span><span>30 Nov</span></div></div><div className="issues-card"><div className="card-title"><strong>Priority issues</strong><span className="view-all">View all</span></div><Issue title="Cancellations are elevated" tag="14%"/><Issue title="18 products are out of stock" tag="Action needed"/></div></div><div className="table-card"><div className="card-title"><strong>Top product performance</strong><span className="view-all">See all products</span></div><div className="product-row header-row"><span>PRODUCT</span><span>ORDERS</span><span>REVENUE</span><span>STATUS</span></div><div className="product-row"><strong>Wireless Bluetooth Earbuds</strong><span>84</span><span>₹42,000</span><em>Healthy</em></div><div className="product-row"><strong>Smart LED Lamp</strong><span>57</span><span>₹28,500</span><em className="attention">Low stock</em></div></div></div></div></section>;
}
function Kpi({label,value,note,warn}) { return <div className="preview-kpi"><span>{label}</span><strong>{value}</strong><small className={warn ? "warning" : ""}>{note}</small></div>; }
function Issue({title,tag}) { return <div className="issue"><i/><div><strong>{title}</strong><span>{tag}</span></div></div>; }

function VoiceModal({ open, onClose }) {
  const [position, setPosition] = useState(null); const [minimized, setMinimized] = useState(false);
  const drag = (event) => { const origin = position || { x: Math.max(16, (window.innerWidth - 520) / 2), y: Math.max(16, (window.innerHeight - 600) / 2) }; const startX = event.clientX, startY = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); const move = (e) => setPosition({ x: Math.min(window.innerWidth - 330, Math.max(8, origin.x + e.clientX - startX)), y: Math.min(window.innerHeight - 84, Math.max(8, origin.y + e.clientY - startY)) }); const end = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", end); };
  const style = position ? { left: position.x, top: position.y, transform: "none" } : undefined;
  return <div className={open ? "voice-layer open" : "voice-layer"} aria-hidden={!open}><div className="voice-backdrop" onClick={onClose}/><section className={minimized ? "voice-dialog minimized" : "voice-dialog"} style={style} role="dialog" aria-modal="true" aria-label="Virtual KAM voice assistant" tabIndex="-1"><header className="voice-modal-header" onPointerDown={drag}><div><span className="status-dot"/> VIRTUAL KAM <small>ONLINE</small></div><div><button onClick={() => setMinimized(!minimized)} aria-label="Minimize"><Minus size={17}/></button><button onClick={onClose} aria-label="Close"><X size={18}/></button></div></header>{!minimized && <VoiceWorkspace />}</section></div>;
}
