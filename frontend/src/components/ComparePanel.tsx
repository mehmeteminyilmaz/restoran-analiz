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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="animate-fade-in-up">
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-0.01em" }}>
          ⚖️ Rakip <span className="gradient-text">Karşılaştırma</span>
        </h2>
        <p style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>İki restoranın müşteri yorumlarını yapay zeka ile yan yana analiz edip kıyaslayın</p>
      </div>

      {!result ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Restoran Giriş Kartları */}
          {[
            { label: "1. RESTORAN", name: nameA, setName: setNameA, reviews: reviewsA, setReviews: setReviewsA, color: "#f97316", glow: "rgba(249,115,22,0.06)" },
            { label: "2. RESTORAN", name: nameB, setName: setNameB, reviews: reviewsB, setReviews: setReviewsB, color: "#3b82f6", glow: "rgba(59,130,246,0.06)" },
          ].map(({ label, name, setName, reviews, setReviews, color, glow }) => (
            <div key={label} className="glass-card" style={{ padding: 28, borderColor: `${color}18`, boxShadow: `0 8px 32px ${glow}` }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color,
                textTransform: "uppercase", letterSpacing: "0.08em",
                marginBottom: 20, display: "flex", alignItems: "center", gap: 8
              }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
                {label}
              </div>

              <div style={{ marginBottom: 16 }}>
                <span className="label">Restoran Adı</span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="örn. Nusr-Et veya Kadıköy Kebapçısı"
                  className="input-base"
                />
              </div>

              <div>
                <span className="label">Müşteri Yorumları</span>
                <textarea
                  value={reviews}
                  onChange={e => setReviews(e.target.value)}
                  placeholder="Analiz edilmesini istediğiniz yorumları buraya yapıştırın... (Her satıra bir yorum)"
                  rows={8}
                  className="input-base"
                  style={{ resize: "vertical", minHeight: 180, lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <span className="badge badge-orange" style={{ background: reviews.split("\n").filter(r => r.trim()).length > 0 ? undefined : "rgba(255,255,255,0.02)", color: reviews.split("\n").filter(r => r.trim()).length > 0 ? undefined : "#444", borderColor: reviews.split("\n").filter(r => r.trim()).length > 0 ? undefined : "transparent" }}>
                  ✍️ {reviews.split("\n").filter(r => r.trim()).length} Yorum Girişi
                </span>
              </div>
            </div>
          ))}

          <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
            {error && (
              <div style={{
                marginBottom: 16,
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
            <button
              onClick={handleCompare}
              disabled={loading}
              className="btn-primary"
              style={{
                background: loading ? "rgba(30,30,30,1)" : "linear-gradient(135deg, #f97316, #3b82f6)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(249,115,22,0.15)"
              }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Karşılaştırma yapılıyor...</>
                : <><span>⚖️</span> Restoranları Karşılaştır</>}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
          {/* Kazanan banner */}
          <div className="glass-card animate-pulse-glow" style={{
            padding: "24px 32px",
            background: result.kazanan === "A"
              ? "linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(8,8,8,0.85) 60%)"
              : result.kazanan === "B"
              ? "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(8,8,8,0.85) 60%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(8,8,8,0.85) 60%)",
            borderColor: result.kazanan === "A" ? "rgba(249,115,22,0.2)" : result.kazanan === "B" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.08)",
            boxShadow: "var(--shadow-md)",
          }}>
            <span className="badge badge-orange" style={{
              background: result.kazanan === "A" ? "rgba(249,115,22,0.12)" : result.kazanan === "B" ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.05)",
              color: result.kazanan === "A" ? "#f97316" : result.kazanan === "B" ? "#3b82f6" : "#888",
              borderColor: result.kazanan === "A" ? "rgba(249,115,22,0.2)" : result.kazanan === "B" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.1)",
              marginBottom: 12
            }}>
              🏆 YAPAY ZEKA DEĞERLENDİRMESİ
            </span>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              {result.kazanan === "A"
                ? <><span style={{ color: "#f97316" }}>🥇 {result.restoran_a.name}</span> <span style={{ fontSize: 13, fontWeight: 500, color: "#444" }}>öne çıkıyor</span></>
                : result.kazanan === "B"
                ? <><span style={{ color: "#3b82f6" }}>🥇 {result.restoran_b.name}</span> <span style={{ fontSize: 13, fontWeight: 500, color: "#444" }}>öne çıkıyor</span></>
                : <><span style={{ color: "#8b5cf6" }}>🤝 Performans Eşit</span> <span style={{ fontSize: 13, fontWeight: 500, color: "#444" }}>başa baş bir yarış</span></>}
            </div>
            <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.85, fontWeight: 400 }}>{result.fark_ozeti}</p>
          </div>

          {/* Skor kartları */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { r: result.restoran_a, color: "#f97316", badge: "badge-orange" },
              { r: result.restoran_b, color: "#3b82f6", badge: "badge-blue" },
            ].map(({ r, color, badge }) => (
              <div key={r.name} className="glass-card" style={{ padding: 28, borderColor: `${color}18` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <span className={`badge ${badge}`} style={{ marginBottom: 6 }}>{r.name}</span>
                    <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Müşteri Algısı & Yapay Zeka Özeti</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      fontSize: 38, fontWeight: 900, color: scoreColor(r.analiz.genel_skor ?? 0),
                      lineHeight: 1, textShadow: `0 0 20px ${scoreColor(r.analiz.genel_skor ?? 0)}20`
                    }}>
                      {r.analiz.genel_skor ?? 0}
                    </div>
                    <span style={{ fontSize: 10, color: "#444", fontWeight: 700, marginTop: 4 }}>GENEL PUAN</span>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "#999", lineHeight: 1.8, marginBottom: 18 }}>{r.analiz.ozet || "Özet yok."}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 16 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#bbb" }}>{r.analiz.guclu_yonler?.[0] || "Belirlenmedi"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>!</span>
                    <span style={{ fontSize: 13, color: "#bbb" }}>{r.analiz.zayif_yonler?.[0] || "Belirlenmedi"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar karşılaştırma */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#444",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 20, display: "flex", alignItems: "center", gap: 8
            }}>
              <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(135deg, #f97316, #3b82f6)" }} />
              Kategori Karşılaştırması (Radar Analizi)
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={["yemek", "servis", "fiyat", "ambiyans"].map(key => ({
                category: key === "yemek" ? "Yemek" : key === "servis" ? "Servis" : key === "fiyat" ? "Fiyat" : "Ambiyans",
                A: result.restoran_a.analiz.kategoriler[key]?.skor ?? 0,
                B: result.restoran_b.analiz.kategoriler[key]?.skor ?? 0,
              }))}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} />
                <Radar name={result.restoran_a.name} dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.12} strokeWidth={2} />
                <Radar name={result.restoran_b.name} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.12} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button onClick={() => setResult(null)} style={{
            alignSelf: "center",
            padding: "9px 24px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            color: "#666",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
            marginTop: 8
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "#aaa"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "#666"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            ↺ Yeni Karşılaştırma Yap
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
