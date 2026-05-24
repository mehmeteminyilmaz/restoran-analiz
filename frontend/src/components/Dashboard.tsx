import type { AnalysisResult } from "../App";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import TrendChart from "./TrendChart";
import WordCloud from "./WordCloud";
import ScoreGauge from "./ScoreGauge";
import PlatformBreakdown from "./PlatformBreakdown";

interface Props { data: AnalysisResult }

const scoreColor   = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#f97316" : "#ef4444";
const oncelikColor = (o: string) => o === "yuksek" ? "#ef4444" : o === "orta" ? "#f97316" : "#22c55e";
const oncelikLabel = (o: string) => o === "yuksek" ? "Yüksek" : o === "orta" ? "Orta" : "Düşük";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(135deg, #f97316, #ef4444)" }} />
      {children}
    </div>
  );
}

export default function Dashboard({ data }: Props) {
  const kategoriler = data.kategoriler || {
    yemek: { skor: 0, yorum: "Veri yok" },
    servis: { skor: 0, yorum: "Veri yok" },
    fiyat: { skor: 0, yorum: "Veri yok" },
    ambiyans: { skor: 0, yorum: "Veri yok" }
  };

  const radarData = [
    { category: "Yemek",    value: kategoriler.yemek?.skor ?? 0 },
    { category: "Servis",   value: kategoriler.servis?.skor ?? 0 },
    { category: "Fiyat",    value: kategoriler.fiyat?.skor ?? 0 },
    { category: "Ambiyans", value: kategoriler.ambiyans?.skor ?? 0 },
  ];

  const duygu = data.duygu_dagilimi || { pozitif: 0, notr: 0, negatif: 0 };
  const pieData = [
    { name: "Pozitif", value: duygu.pozitif ?? 0, color: "#22c55e" },
    { name: "Nötr",    value: duygu.notr ?? 0,    color: "#f97316" },
    { name: "Negatif", value: duygu.negatif ?? 0, color: "#ef4444" },
  ];

  const gucluYonler      = data.guclu_yonler || [];
  const zayifYonler      = data.zayif_yonler || [];
  const aksiyonOnerileri = data.aksiyon_onerileri || [];
  const oneCikanKelimeler = data.one_cikan_kelimeler || [];

  const categoryMeta: Record<string, { icon: string; color: string; label: string }> = {
    yemek:    { icon: "🍽️", color: "#f97316", label: "Yemek" },
    servis:   { icon: "👨‍🍳", color: "#3b82f6", label: "Servis" },
    fiyat:    { icon: "💰", color: "#22c55e",  label: "Fiyat"  },
    ambiyans: { icon: "✨", color: "#8b5cf6",  label: "Ambiyans" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Satır 1: Gauge · Özet · Pie ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 270px", gap: 16 }}>

        {/* Gauge */}
        <ScoreGauge score={data.genel_skor || 0} />

        {/* Özet */}
        <div className="glass-card" style={{ padding: 24 }}>
          <SectionLabel>Genel Değerlendirme</SectionLabel>
          <p style={{ color: "#bbb", fontSize: 13.5, lineHeight: 1.85, marginBottom: 18 }}>
            {data.ozet || "Değerlendirme özeti yüklenemedi."}
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 99,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            fontSize: 12, color: "#555",
          }}>
            📋 {data.toplam_yorum || 0} yorum analiz edildi
          </div>
          {oneCikanKelimeler.length > 0 && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "18px 0" }} />
              <WordCloud words={oneCikanKelimeler} />
            </>
          )}
        </div>

        {/* Pie */}
        <div className="glass-card" style={{ padding: 24 }}>
          <SectionLabel>Duygu Dağılımı</SectionLabel>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                dataKey="value" paddingAngle={4}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  <span style={{ fontSize: 12, color: "#666" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Satır 2: Trend + Platform Breakdown ── */}
      {(data.trend_verisi || data.kaynak_dagilimi) && (
        <div style={{ display: "grid", gridTemplateColumns: data.kaynak_dagilimi ? "1fr 280px" : "1fr", gap: 16 }}>
          {data.trend_verisi && <TrendChart data={data.trend_verisi} />}
          {data.kaynak_dagilimi && <PlatformBreakdown data={data.kaynak_dagilimi} />}
        </div>
      )}

      {/* ── Satır 3: Radar · Kategori Detayları ── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <SectionLabel>Kategori Skorları</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "#555", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <SectionLabel>Kategori Detayları</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {Object.entries(kategoriler).map(([key, val]) => {
              const meta = categoryMeta[key];
              const valSkor = val?.skor ?? 0;
              const color = scoreColor(valSkor);
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 28, height: 28,
                        background: (meta?.color || "#f97316") + "18",
                        border: `1px solid ${meta?.color || "#f97316"}30`,
                        borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13,
                      }}>
                        {meta?.icon || "•"}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#ccc" }}>
                        {meta?.label || key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
                      {valSkor}
                    </span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99, marginBottom: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${valSkor}%`,
                      background: `linear-gradient(90deg, ${color}aa, ${color})`,
                      borderRadius: 99, transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{val?.yorum || "Yorum yok"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Satır 4: Güçlü/Zayıf · Aksiyonlar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Güçlü + Zayıf */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass-card" style={{ padding: 24, borderColor: "rgba(34,197,94,0.12)" }}>
            <SectionLabel>Güçlü Yönler</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gucluYonler.length > 0
                ? gucluYonler.map((g, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#22c55e", flexShrink: 0, marginTop: 1,
                      }}>✓</div>
                      <span style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7 }}>{g}</span>
                    </div>
                  ))
                : <span style={{ fontSize: 13, color: "#444" }}>Belirlenmedi.</span>
              }
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24, borderColor: "rgba(239,68,68,0.12)" }}>
            <SectionLabel>Zayıf Yönler</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {zayifYonler.length > 0
                ? zayifYonler.map((z, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#ef4444", flexShrink: 0, marginTop: 1,
                      }}>!</div>
                      <span style={{ fontSize: 13, color: "#bbb", lineHeight: 1.7 }}>{z}</span>
                    </div>
                  ))
                : <span style={{ fontSize: 13, color: "#444" }}>Belirlenmedi.</span>
              }
            </div>
          </div>
        </div>

        {/* Aksiyon Önerileri */}
        <div className="glass-card" style={{ padding: 24 }}>
          <SectionLabel>Aksiyon Önerileri</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {aksiyonOnerileri.length > 0
              ? aksiyonOnerileri.map((a, i) => {
                  const col = oncelikColor(a.oncelik || "dusuk");
                  return (
                    <div key={i} style={{
                      padding: "14px 16px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 14,
                      borderLeft: `3px solid ${col}`,
                      border: `1px solid rgba(255,255,255,0.04)`,
                      borderLeftColor: col,
                      transition: "border-color 0.2s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd", lineHeight: 1.5 }}>
                          {a.oneri || "Öneri yok"}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 10px",
                          background: col + "18", color: col,
                          borderRadius: 99, border: `1px solid ${col}30`,
                          flexShrink: 0, whiteSpace: "nowrap", textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}>
                          {oncelikLabel(a.oncelik || "dusuk")}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                        <span style={{ color: col }}>→</span> {a.etki || "Etki yok"}
                      </div>
                    </div>
                  );
                })
              : <span style={{ fontSize: 13, color: "#444" }}>Aksiyon önerisi sunulamadı.</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
