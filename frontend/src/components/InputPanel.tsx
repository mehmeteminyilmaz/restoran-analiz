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
  { id: "text",   label: "Yorum Yapıştır",     icon: "📝", desc: "Yorumları kendiniz girin" },
  { id: "places", label: "Google Maps",        icon: "📍", desc: "Place ID ile gerçek yorum çek" },
  { id: "search", label: "Restoran Ara",       icon: "🔍", desc: "Adından ara, Yelp & TripAdvisor" },
];

export default function InputPanel({ loading, error, onAnalyze }: Props) {
  const [mode, setMode]             = useState<Mode>("text");
  const [reviewText, setReviewText] = useState("");
  const [placeId, setPlaceId]       = useState("");
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
      .catch(err => console.error("Error fetching config status:", err));
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

      {/* Sol — Input */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#fff" }}>Yorum Analizi</h2>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Yorumları yapıştır, Google Maps ID gir veya restoran adı ara</p>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#0a0a0a", borderRadius: 12, padding: 4, marginBottom: 24, gap: 3 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMode(tab.id)} style={{
              flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 500, transition: "all .2s",
              background: mode === tab.id ? "#f97316" : "transparent",
              color: mode === tab.id ? "#fff" : "#555",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Text mode */}
        {mode === "text" && (
          <>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Her satıra bir yorum yaz veya yapıştır..."
              rows={12}
              style={{
                width: "100%", padding: "12px 14px", background: "#0a0a0a",
                border: "1px solid #1e1e1e", borderRadius: 12, color: "#ddd",
                fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit",
                lineHeight: 1.6, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#444" }}>
                {reviewText.split("\n").filter(r => r.trim()).length} yorum
              </span>
              <button onClick={() => setReviewText(EXAMPLE_REVIEWS)}
                style={{ fontSize: 12, color: "#f97316", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Örnek yükle →
              </button>
            </div>
          </>
        )}

        {/* Places mode */}
        {mode === "places" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 6 }}>Google Place ID</label>
              <input
                value={placeId}
                onChange={e => setPlaceId(e.target.value)}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                style={{
                  width: "100%", padding: "12px 14px", background: "#0a0a0a",
                  border: "1px solid #1e1e1e", borderRadius: 12, color: "#ddd",
                  fontSize: 13, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ padding: "12px 14px", background: "#0a0800", border: "1px solid #f9731622", borderRadius: 10, fontSize: 12, color: "#888" }}>
              💡 Place ID'yi bulmak için:{" "}
              <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noreferrer" style={{ color: "#f97316" }}>
                Google Places ID Finder →
              </a>
            </div>
            <div style={{ padding: "12px 14px", background: hasGoogleKey ? "#080a08" : "#0a0800", border: hasGoogleKey ? "1px solid #10b98122" : "1px solid #f9731622", borderRadius: 10, fontSize: 12, color: "#888" }}>
              📍 {hasGoogleKey ? "Google Places API: Aktif — Gerçek yorumlar çekiliyor 🟢" : "Google Places API: Demo mod — GOOGLE_PLACES_API_KEY yok 🟡"}
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 6 }}>
                Çekilecek yorum sayısı: {reviewCount}
              </label>
              <input
                type="range" min={5} max={50} value={reviewCount}
                onChange={e => setReviewCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#f97316" }}
              />
            </div>
          </div>
        )}

        {/* Search mode */}
        {mode === "search" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 6 }}>Restoran Adı</label>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && isReady && !loading && handleSubmit()}
                placeholder="Nusr-et Etiler İstanbul"
                style={{
                  width: "100%", padding: "12px 14px", background: "#0a0a0a",
                  border: "1px solid #1e1e1e", borderRadius: 12, color: "#ddd",
                  fontSize: 13, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ padding: "12px 14px", background: hasSerperKey ? "#080a08" : "#080a0a", border: hasSerperKey ? "1px solid #10b98122" : "1px solid #3b82f622", borderRadius: 10, fontSize: 12, color: "#888" }}>
              🔍 Yelp ve TripAdvisor'dan otomatik yorum snippet'ları çekilir.
              {hasSerperKey ? " (Aktif — Gerçek yorumlar çekiliyor 🟢)" : " (Demo mod — SERPER_API_KEY eklenmemiş 🟡)"}
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#555", display: "block", marginBottom: 6 }}>
                Çekilecek yorum sayısı: {reviewCount}
              </label>
              <input
                type="range" min={5} max={40} value={reviewCount}
                onChange={e => setReviewCount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#f97316" }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#1a0000", border: "1px solid #ef444433", borderRadius: 10, color: "#ef4444", fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading || !isReady}
          style={{
            width: "100%", marginTop: 16, padding: "14px 0",
            background: loading ? "#7c3913" : !isReady ? "#1a1a1a" : "#f97316",
            border: "none", borderRadius: 12, color: !isReady && !loading ? "#333" : "#fff",
            fontSize: 15, fontWeight: 600,
            cursor: loading || !isReady ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}>
          {loading
            ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Analiz ediliyor...</>
            : "🔍 Analiz Et"}
        </button>
      </div>

      {/* Sağ — Bilgi Paneli */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: "#fff" }}>🚀 Nasıl Çalışır?</h3>
          {[
            { num: "1", title: "Kaynak Seç", desc: "Yorumları kendiniz girin, Google Maps ID girin veya restoran adı aratın" },
            { num: "2", title: "AI Analiz", desc: "Llama modeli tüm yorumları 4 kategoride derinlemesine inceler" },
            { num: "3", title: "Kapsamlı Rapor Al", desc: "Skor, trend grafik, kelime bulutu, kaynak dağılımı ve aksiyon planı" },
          ].map(s => (
            <div key={s.num} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f9731622", border: "1px solid #f9731644", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#f97316", flexShrink: 0 }}>
                {s.num}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#fff" }}>📊 Analiz Kategorileri</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "🍽️", label: "Yemek Kalitesi" },
              { icon: "👨‍🍳", label: "Servis" },
              { icon: "💰", label: "Fiyat/Değer" },
              { icon: "✨", label: "Ambiyans" },
              { icon: "😊", label: "Duygu Dağılımı" },
              { icon: "📈", label: "Puan Trendi" },
              { icon: "☁️", label: "Kelime Bulutu" },
              { icon: "💡", label: "Aksiyon Önerileri" },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", background: "#0a0a0a", borderRadius: 10 }}>
                <span style={{ fontSize: 16 }}>{c.icon}</span>
                <span style={{ fontSize: 12, color: "#777" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
