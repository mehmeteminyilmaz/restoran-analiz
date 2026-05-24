import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import InputPanel from "./components/InputPanel";
import Dashboard from "./components/Dashboard";
import LoadingScreen from "./components/LoadingScreen";
import ComparePanel from "./components/ComparePanel";
import "./index.css";

const API_BASE = "http://localhost:8000";

export interface AnalysisResult {
  genel_skor: number;
  toplam_yorum: number;
  ozet: string;
  duygu_dagilimi: { pozitif: number; notr: number; negatif: number };
  kategoriler: {
    yemek: { skor: number; yorum: string };
    servis: { skor: number; yorum: string };
    fiyat: { skor: number; yorum: string };
    ambiyans: { skor: number; yorum: string };
  };
  guclu_yonler: string[];
  zayif_yonler: string[];
  aksiyon_onerileri: { oncelik: string; oneri: string; etki: string }[];
  one_cikan_kelimeler: string[];
  kaynak_dagilimi?: { platform: string; yorum_sayisi: number; yuzde: number }[];
  trend_verisi?: { ay: string; skor: number; yorum_sayisi?: number }[];
}

// ── Ana analiz sayfası ───────────────────────────────────────────────────────
function AnalyzePage() {
  const [result, setResult]     = useState<AnalysisResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [apiDone, setApiDone]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [reviewsCount, setReviewsCount] = useState(10);

  const pendingResultRef = useRef<AnalysisResult | null>(null);
  const pendingErrorRef  = useRef<string | null>(null);

  const handleLoadingComplete = () => {
    setLoading(false);
    setApiDone(false);
    if (pendingErrorRef.current) {
      setError(pendingErrorRef.current);
      pendingErrorRef.current = null;
    }
    if (pendingResultRef.current) {
      setResult(pendingResultRef.current);
      pendingResultRef.current = null;
    }
  };

  const handleAnalyze = async (type: "text" | "places" | "search", data: object) => {
    if (type === "text" && data && "reviews" in data && Array.isArray((data as any).reviews)) {
      setReviewsCount((data as any).reviews.length);
    } else {
      setReviewsCount(20);
    }
    pendingResultRef.current = null;
    pendingErrorRef.current  = null;
    setApiDone(false);
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/analyze/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Hata oluştu");
      pendingResultRef.current = json.data;
    } catch (e: unknown) {
      pendingErrorRef.current = e instanceof Error ? e.message : "Bilinmeyen hata";
    } finally {
      setApiDone(true);
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 28px" }}>
      {loading ? (
        <LoadingScreen reviewsCount={reviewsCount} apiDone={apiDone} onComplete={handleLoadingComplete} />
      ) : !result ? (
        <div className="animate-fade-in-up">
          <InputPanel loading={loading} error={error} onAnalyze={handleAnalyze} />
        </div>
      ) : (
        <div className="animate-fade-in-up">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <button
              onClick={() => { setResult(null); setError(null); }}
              style={{
                padding: "9px 20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: "#666",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "#aaa"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "#666"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              ↺ Yeni Analiz
            </button>
          </div>
          <Dashboard data={result} />
        </div>
      )}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header style={{
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      gap: 16,
      position: "sticky",
      top: 0,
      background: "rgba(8,8,8,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: "auto" }}>
        <div style={{
          width: 36,
          height: 36,
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
          flexShrink: 0,
        }}>
          🍽️
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>
            Restoran Analiz <span className="gradient-text">AI</span>
          </div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 1 }}>
            Yapay zeka destekli yorum analitiği
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 4 }}>
        {[
          { to: "/",        label: "Analiz",       icon: "🔍", end: true  },
          { to: "/compare", label: "Karşılaştır",  icon: "⚖️", end: false },
        ].map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
            padding: "7px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: isActive ? "rgba(249,115,22,0.12)" : "transparent",
            color: isActive ? "#f97316" : "#666",
            border: isActive ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
          })}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Status badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 99,
        background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.15)",
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#22c55e",
          boxShadow: "0 0 6px #22c55e",
          animation: "pulse-glow 2s infinite",
        }} />
        <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>CANLI</span>
      </div>
    </header>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh" }}>
        <Header />
        <Routes>
          <Route path="/"        element={<AnalyzePage />} />
          <Route path="/compare" element={
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 28px" }}>
              <ComparePanel />
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
