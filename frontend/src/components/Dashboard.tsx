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

const CARD: React.CSSProperties = {
  background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 24,
};

export default function Dashboard({ data }: Props) {
  // Safe defaults to prevent LLM schema crashes
  const kategoriler = data.kategoriler || {
    yemek: { skor: 0, yorum: "Veri yok" },
    servis: { skor: 0, yorum: "Veri yok" },
    fiyat: { skor: 0, yorum: "Veri yok" },
    ambiyans: { skor: 0, yorum: "Veri yok" }
  };
  
  const radarData = [
    { category: "Yemek",   value: kategoriler.yemek?.skor ?? 0 },
    { category: "Servis",  value: kategoriler.servis?.skor ?? 0 },
    { category: "Fiyat",   value: kategoriler.fiyat?.skor ?? 0 },
    { category: "Ambiyans",value: kategoriler.ambiyans?.skor ?? 0 },
  ];

  const duygu = data.duygu_dagilimi || { pozitif: 0, notr: 0, negatif: 0 };

  const pieData = [
    { name: "Pozitif", value: duygu.pozitif ?? 0, color: "#22c55e" },
    { name: "Nötr",    value: duygu.notr ?? 0,   color: "#f97316" },
    { name: "Negatif", value: duygu.negatif ?? 0, color: "#ef4444" },
  ];

  const gucluYonler = data.guclu_yonler || [];
  const zayifYonler = data.zayif_yonler || [];
  const aksiyonOnerileri = data.aksiyon_onerileri || [];
  const oneCikanKelimeler = data.one_cikan_kelimeler || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Satır 1: Gauge · Özet · Pie ── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: 16 }}>
        <ScoreGauge score={data.genel_skor || 0} />

        {/* Özet */}
        <div style={CARD}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Genel Değerlendirme</div>
          <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>{data.ozet || "Değerlendirme özeti yüklenemedi."}</p>
          <div style={{ fontSize: 12, color: "#444", marginBottom: 10 }}>{data.toplam_yorum || 0} yorum analiz edildi</div>
          <WordCloud words={oneCikanKelimeler} />
        </div>

        {/* Pie Chart */}
        <div style={CARD}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Duygu Dağılımı</div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 6 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                <span style={{ color: "#666" }}>{p.name} {p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Satır 2: Trend + Platform Breakdown ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {data.trend_verisi && <TrendChart data={data.trend_verisi} />}
        {data.kaynak_dagilimi && <PlatformBreakdown data={data.kaynak_dagilimi} />}
      </div>

      {/* ── Satır 3: Radar · Kategori Detayları ── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div style={CARD}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Kategori Skorları</div>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#222" />
              <PolarAngleAxis dataKey="category" tick={{ fill: "#555", fontSize: 12 }} />
              <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 16, textTransform: "uppercase", letterSpacing: ".06em" }}>Kategori Detayları</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(kategoriler).map(([key, val]) => {
              const icons: Record<string, string> = { yemek: "🍽️", servis: "👨‍🍳", fiyat: "💰", ambiyans: "✨" };
              const valSkor = val?.skor ?? 0;
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#aaa" }}>{icons[key]} {key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(valSkor) }}>{valSkor}</span>
                  </div>
                  <div style={{ height: 5, background: "#1a1a1a", borderRadius: 5, marginBottom: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${valSkor}%`, background: scoreColor(valSkor), borderRadius: 5, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>{val?.yorum || "Yorum yok"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Satır 4: Güçlü/Zayıf + Aksiyonlar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...CARD, border: "1px solid #22c55e22" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 14 }}>✅ Güçlü Yönler</div>
            {gucluYonler.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{g}</span>
              </div>
            ))}
            {gucluYonler.length === 0 && <span style={{ fontSize: 13, color: "#555" }}>Belirlenmedi.</span>}
          </div>
          <div style={{ ...CARD, border: "1px solid #ef444422" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 14 }}>⚠️ Zayıf Yönler</div>
            {zayifYonler.map((z, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{z}</span>
              </div>
            ))}
            {zayifYonler.length === 0 && <span style={{ fontSize: 13, color: "#555" }}>Belirlenmedi.</span>}
          </div>
        </div>

        <div style={CARD}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>💡 Aksiyon Önerileri</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {aksiyonOnerileri.map((a, i) => (
              <div key={i} style={{ padding: "14px 16px", background: "#0a0a0a", borderRadius: 14, borderLeft: `3px solid ${oncelikColor(a.oncelik || "dusuk")}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{a.oneri || "Öneri yok"}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", background: oncelikColor(a.oncelik || "dusuk") + "22", color: oncelikColor(a.oncelik || "dusuk"), borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                    {oncelikLabel(a.oncelik || "dusuk")}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>→ {a.etki || "Etki yok"}</div>
              </div>
            ))}
            {aksiyonOnerileri.length === 0 && <span style={{ fontSize: 13, color: "#555" }}>Aksiyon önerisi sunulamadı.</span>}
          </div>
        </div>
      </div>

    </div>
  );
}
