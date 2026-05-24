import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import InputPanel from "./components/InputPanel";
import Dashboard from "./components/Dashboard";
import LoadingScreen from "./components/LoadingScreen";
import ComparePanel from "./components/ComparePanel";

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
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      {loading ? (
        <LoadingScreen reviewsCount={reviewsCount} apiDone={apiDone} onComplete={handleLoadingComplete} />
      ) : !result ? (
        <InputPanel loading={loading} error={error} onAnalyze={handleAnalyze} />
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <button
              onClick={() => { setResult(null); setError(null); }}
              style={{ padding: "8px 20px", background: "transparent", border: "1px solid #262626", borderRadius: 10, color: "#555", fontSize: 13, cursor: "pointer" }}
            >
              ↺ Yeni Analiz
            </button>
          </div>
          <div style={{ animation: "fadeInUp 0.5s ease both" }}>
            <Dashboard data={result} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "6px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all .2s",
    background: isActive ? "#f9731622" : "transparent",
    color: isActive ? "#f97316" : "#555",
    border: isActive ? "1px solid #f9731633" : "1px solid transparent",
  });

  return (
    <div style={{ borderBottom: "1px solid #1a1a1a", padding: "14px 32px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: "#0a0a0aee", backdropFilter: "blur(12px)", zIndex: 50 }}>
      <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #f97316, #ef4444)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🍽️</div>
      <div style={{ marginRight: "auto" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Restoran Analiz AI</div>
        <div style={{ fontSize: 11, color: "#444" }}>Müşteri yorumlarını yapay zeka ile analiz et</div>
      </div>
      <nav style={{ display: "flex", gap: 6 }}>
        <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>🔍 Analiz</NavLink>
        <NavLink to="/compare" style={({ isActive }) => linkStyle(isActive)}>⚖️ Karşılaştır</NavLink>
      </nav>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
        <Header />
        <Routes>
          <Route path="/"        element={<AnalyzePage />} />
          <Route path="/compare" element={
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
              <ComparePanel />
            </div>
          } />
        </Routes>
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
      `}</style>
    </BrowserRouter>
  );
}
