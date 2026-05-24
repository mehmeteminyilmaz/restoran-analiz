import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  loading: boolean;
  error: string | null;
  onAnalyze: (type: "text" | "places" | "search", data: object) => void;
}

type Mode = "text" | "places" | "search";

const EXAMPLE_REVIEWS = `Yemekler harikaydı, özellikle kuzu tandır müthişti!
Servis biraz yavaş kaldı ama personel çok nazikti.
Fiyatlar makul, kaliteye göre gayet uygun.
Ambiyans çok güzel, romantik bir akşam yemeği için ideal.
Porsiyon miktarları biraz az, doyurucu gelmedi.
Temizlik konusunda çok titizler, her yer pırıl pırıl.
Rezervasyon yaptırmak çok kolaydı, sistemi iyi çalışıyor.
Vejetaryen seçenekler oldukça kısıtlı, çeşit artırılmalı.
Manzarası inanılmaz, Boğaz'a karşı yemek yemek ayrı güzel.
Tatlılar enfes, künefe özellikle tavsiye ederim.`;

const TABS: { id: Mode; label: string; icon: string; desc: string }[] = [
  { id: "text",   label: "Yorum Yapıştır", icon: "📝", desc: "Manuel yorum girişi" },
  { id: "places", label: "Google Maps",   icon: "📍", desc: "Place ID ile gerçek veri" },
  { id: "search", label: "Restoran Ara",  icon: "🔍", desc: "Yelp & TripAdvisor" },
];

const FEATURES = [
  { icon: "🍽️", label: "Yemek Kalitesi",   color: "#f97316" },
  { icon: "👨‍🍳", label: "Servis & Hizmet",  color: "#3b82f6" },
  { icon: "💰", label: "Fiyat/Değer",      color: "#22c55e" },
  { icon: "✨", label: "Ambiyans",          color: "#8b5cf6" },
  { icon: "😊", label: "Duygu Analizi",    color: "#f59e0b" },
  { icon: "📈", label: "Puan Trendi",      color: "#10b981" },
  { icon: "☁️", label: "Kelime Bulutu",   color: "#ec4899" },
  { icon: "💡", label: "Aksiyon Planı",   color: "#06b6d4" },
];

export default function InputPanel({ loading, error, onAnalyze }: Props) {
  const [mode, setMode]               = useState<Mode>("text");
  const [reviewText, setReviewText]   = useState("");
  const [placeId, setPlaceId]         = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewCount, setReviewCount] = useState(20);
  const [hasSerperKey, setHasSerperKey] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setHasSerperKey(!!data.has_serper_key);
          setHasGoogleKey(!!data.has_google_key);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = () => {
    if (mode === "text") {
      const reviews = reviewText.split("\n").map(r => r.trim()).filter(Boolean);
      if (!reviews.length) return;
      onAnalyze("text", { reviews });
    } else if (mode === "places") {
      if (!placeId.trim()) return;
      onAnalyze("places", { place_id: placeId.trim(), review_count: reviewCount });
    } else {
      if (!searchQuery.trim()) return;
      onAnalyze("search", { query: searchQuery.trim(), review_count: reviewCount });
    }
  };

  const isReady = mode === "text"
    ? reviewText.split("\n").filter(r => r.trim()).length > 0
    : mode === "places"
    ? placeId.trim().length > 0
    : searchQuery.trim().length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

      {/* ── Sol: Input Card ── */}
      <div className="glass-card" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 42, height: 42,
              background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.15))",
              border: "1px solid rgba(249,115,22,0.25)",
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🍽️</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                Yorum Analizi
              </h2>
              <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                Yapay zeka destekli çok kaynaklı restoran analizi
              </p>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div style={{
          display: "flex",
          background: "rgba(0,0,0,0.4)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          gap: 3,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMode(tab.id)} style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
              transition: "all 0.25s",
              background: mode === tab.id
                ? "linear-gradient(135deg, #f97316, #ef4444)"
                : "transparent",
              color: mode === tab.id ? "#fff" : "#555",
              boxShadow: mode === tab.id ? "0 2px 12px rgba(249,115,22,0.3)" : "none",
              letterSpacing: "0.01em",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Text */}
        {mode === "text" && (
          <>
            <div style={{ position: "relative" }}>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Her satıra bir yorum yapıştır veya yaz..."
                rows={12}
                className="input-base"
                style={{ resize: "vertical", lineHeight: 1.7 }}
              />
              <div style={{
                position: "absolute",
                bottom: 12, right: 14,
                fontSize: 11,
                color: "#444",
                fontVariantNumeric: "tabular-nums",
              }}>
                {reviewText.split("\n").filter(r => r.trim()).length} satır
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setReviewText(EXAMPLE_REVIEWS)}
                style={{
                  fontSize: 12, color: "#f97316", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
                  opacity: 0.8,
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
              >
                Örnek yükle →
              </button>
            </div>
          </>
        )}

        {/* Tab: Places */}
        {mode === "places" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">Google Place ID</label>
              <input
                className="input-base"
                value={placeId}
                onChange={e => setPlaceId(e.target.value)}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              />
            </div>

            <div className={`info-box ${hasGoogleKey ? "info-box-green" : "info-box-orange"}`}>
              <span style={{ fontSize: 16 }}>{hasGoogleKey ? "🟢" : "🟡"}</span>
              <div>
                <strong style={{ color: hasGoogleKey ? "#22c55e" : "#f97316", fontSize: 12 }}>
                  {hasGoogleKey ? "Google Places API Aktif" : "Demo Modu Aktif"}
                </strong>
                <br />
                {hasGoogleKey
                  ? "Gerçek Google yorumları çekilecek."
                  : "API anahtarı yok — demo verilerle analiz yapılacak."
                }
              </div>
            </div>

            <div className="info-box info-box-orange" style={{ padding: "10px 14px" }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <span>Place ID için:{" "}
                <a href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank" rel="noreferrer"
                  style={{ color: "#f97316" }}>
                  Google Places ID Finder →
                </a>
              </span>
            </div>

            <div>
              <label className="label">Çekilecek yorum sayısı: {reviewCount}</label>
              <input type="range" min={5} max={50} value={reviewCount}
                onChange={e => setReviewCount(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginTop: 4 }}>
                <span>5</span><span>50</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Search */}
        {mode === "search" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">Restoran Adı & Şehir</label>
              <input
                className="input-base"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && isReady && !loading && handleSubmit()}
                placeholder="Nusr-et Etiler İstanbul"
              />
            </div>

            <div className={`info-box ${hasSerperKey ? "info-box-green" : "info-box-blue"}`}>
              <span style={{ fontSize: 16 }}>{hasSerperKey ? "🟢" : "🟡"}</span>
              <div>
                <strong style={{ color: hasSerperKey ? "#22c55e" : "#3b82f6", fontSize: 12 }}>
                  {hasSerperKey ? "Serper.dev API Aktif" : "Demo Modu Aktif"}
                </strong>
                <br />
                {hasSerperKey
                  ? "Yelp ve TripAdvisor'dan gerçek yorumlar çekilecek."
                  : "API anahtarı yok — demo verilerle analiz yapılacak."
                }
              </div>
            </div>

            <div>
              <label className="label">Çekilecek yorum sayısı: {reviewCount}</label>
              <input type="range" min={5} max={40} value={reviewCount}
                onChange={e => setReviewCount(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginTop: 4 }}>
                <span>5</span><span>40</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            color: "#ef4444",
            fontSize: 13,
            display: "flex",
            gap: 8,
          }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading || !isReady}
          className="btn-primary" style={{ marginTop: 20 }}>
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Analiz ediliyor...</>
            : <><span>✨</span> Analiz Et</>
          }
        </button>
      </div>

      {/* ── Sağ: Info Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* How it works */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#f97316" }}>🚀</span> Nasıl Çalışır?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { num: "01", title: "Kaynak Seç", desc: "Yorum yapıştır, Google Maps ID gir veya restoran adı ara", color: "#f97316" },
              { num: "02", title: "AI Analizi", desc: "Llama AI modeli yorumları 4 kategoride derinlemesine inceler", color: "#8b5cf6" },
              { num: "03", title: "Kapsamlı Rapor", desc: "Skor, trend grafik, kelime bulutu ve aksiyon planı", color: "#22c55e" },
            ].map(s => (
              <div key={s.num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: s.color + "15",
                  border: `1px solid ${s.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: s.color, flexShrink: 0,
                  letterSpacing: "0.02em",
                }}>
                  {s.num}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#3b82f6" }}>📊</span> Analiz Boyutları
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
                transition: "border-color 0.2s",
              }}>
                <span style={{ fontSize: 15 }}>{f.icon}</span>
                <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI model info */}
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>🤖</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>OpenRouter AI</div>
              <div style={{ fontSize: 11, color: "#444" }}>Llama 3.3 • Gemma 2 • DeepSeek</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span className="badge badge-purple" style={{ fontSize: 10 }}>Aktif</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
