import { useState } from "react";
import { Loader2 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";

const API_BASE = "http://localhost:8000";

interface RestaurantAnalysis {
  name: string;
  analiz: {
    genel_skor: number;
    ozet: string;
    kategoriler: Record<string, { skor: number; yorum: string }>;
    guclu_yonler: string[];
    zayif_yonler: string[];
    duygu_dagilimi: { pozitif: number; notr: number; negatif: number };
  };
}

interface CompareResult {
  restoran_a: RestaurantAnalysis;
  restoran_b: RestaurantAnalysis;
  kazanan: "A" | "B" | "Eşit";
  fark_ozeti: string;
}

const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f97316" : "#ef4444";

export default function ComparePanel() {
  const [nameA, setNameA]         = useState("");
  const [reviewsA, setReviewsA]   = useState("");
  const [nameB, setNameB]         = useState("");
  const [reviewsB, setReviewsB]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [result, setResult]       = useState<CompareResult | null>(null);

  const handleCompare = async () => {
    const rA = reviewsA.split("\n").map(r => r.trim()).filter(Boolean);
    const rB = reviewsB.split("\n").map(r => r.trim()).filter(Boolean);

    if (!nameA || !nameB || rA.length < 1 || rB.length < 1) {
      setError("İki restoran için de isim ve en az 1 yorum girmelisiniz.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analyze/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_a: { name: nameA, reviews: rA },
          restaurant_b: { name: nameB, reviews: rB },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Karşılaştırma hatası");
      setResult(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  const CARD: React.CSSProperties = { background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 24 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 6 }}>⚖️ Rakip Karşılaştırma</h2>
        <p style={{ fontSize: 13, color: "#555" }}>İki restoranın yorumlarını yan yana analiz edip karşılaştır</p>
      </div>

      {!result ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Restoran A */}
          {[
            { label: "Restoran A", name: nameA, setName: setNameA, reviews: reviewsA, setReviews: setReviewsA, color: "#f97316" },
            { label: "Restoran B", name: nameB, setName: setNameB, reviews: reviewsB, setReviews: setReviewsB, color: "#3b82f6" },
          ].map(({ label, name, setName, reviews, setReviews, color }) => (
            <div key={label} style={{ ...CARD, border: `1px solid ${color}22` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 16 }}>{label}</div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Restoran adı (örn. Nusr-et)"
                style={{
                  width: "100%", padding: "10px 14px", background: "#0a0a0a",
                  border: "1px solid #1e1e1e", borderRadius: 10, color: "#ddd",
                  fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12,
                }}
              />
              <textarea
                value={reviews}
                onChange={e => setReviews(e.target.value)}
                placeholder="Her satıra bir yorum..."
                rows={8}
                style={{
                  width: "100%", padding: "10px 14px", background: "#0a0a0a",
                  border: "1px solid #1e1e1e", borderRadius: 10, color: "#ddd",
                  fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit",
                  lineHeight: 1.6, boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
                {reviews.split("\n").filter(r => r.trim()).length} yorum
              </div>
            </div>
          ))}

          <div style={{ gridColumn: "1 / -1" }}>
            {error && (
              <div style={{ marginBottom: 12, padding: "10px 14px", background: "#1a0000", border: "1px solid #ef444433", borderRadius: 10, color: "#ef4444", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}
            <button
              onClick={handleCompare}
              disabled={loading}
              style={{
                width: "100%", padding: "14px 0",
                background: loading ? "#333" : "linear-gradient(135deg, #f97316, #3b82f6)",
                border: "none", borderRadius: 12, color: "#fff",
                fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Karşılaştırılıyor...</>
                : "⚖️ Karşılaştır"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeInUp 0.4s ease both" }}>
          {/* Kazanan banner */}
          <div style={{
            padding: "20px 28px",
            background: result.kazanan === "A"
              ? "linear-gradient(135deg, #f9731622, #0a0a0a)"
              : result.kazanan === "B"
              ? "linear-gradient(135deg, #3b82f622, #0a0a0a)"
              : "linear-gradient(135deg, #22222222, #0a0a0a)",
            border: `1px solid ${result.kazanan === "A" ? "#f9731644" : result.kazanan === "B" ? "#3b82f644" : "#333"}`,
            borderRadius: 20,
          }}>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>Kazanan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              {result.kazanan === "A" ? `🏆 ${result.restoran_a.name}` : result.kazanan === "B" ? `🏆 ${result.restoran_b.name}` : "🤝 Eşit"}
            </div>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>{result.fark_ozeti}</p>
          </div>

          {/* Skor kartları */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { r: result.restoran_a, color: "#f97316" },
              { r: result.restoran_b, color: "#3b82f6" },
            ].map(({ r, color }) => (
              <div key={r.name} style={{ ...CARD, border: `1px solid ${color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{r.name}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: scoreColor(r.analiz.genel_skor) }}>
                    {r.analiz.genel_skor}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>{r.analiz.ozet}</p>
                <div style={{ fontSize: 12, color: "#22c55e", marginBottom: 6 }}>✅ {r.analiz.guclu_yonler[0]}</div>
                <div style={{ fontSize: 12, color: "#ef4444" }}>⚠️ {r.analiz.zayif_yonler[0]}</div>
              </div>
            ))}
          </div>

          {/* Radar karşılaştırma */}
          <div style={CARD}>
            <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>
              Kategori Karşılaştırması
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={["yemek", "servis", "fiyat", "ambiyans"].map(key => ({
                category: key.charAt(0).toUpperCase() + key.slice(1),
                A: result.restoran_a.analiz.kategoriler[key]?.skor ?? 0,
                B: result.restoran_b.analiz.kategoriler[key]?.skor ?? 0,
              }))}>
                <PolarGrid stroke="#222" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "#555", fontSize: 13 }} />
                <Radar name={result.restoran_a.name} dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
                <Radar name={result.restoran_b.name} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 13, color: "#555" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button onClick={() => setResult(null)} style={{
            alignSelf: "center", padding: "10px 28px", background: "transparent",
            border: "1px solid #333", borderRadius: 10, color: "#555", fontSize: 13, cursor: "pointer",
          }}>
            ↺ Yeni Karşılaştırma
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
