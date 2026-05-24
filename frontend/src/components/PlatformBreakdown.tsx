interface SourceEntry {
  platform: string;
  yorum_sayisi: number;
  yuzde: number;
}

interface Props {
  data: SourceEntry[];
}

const PLATFORM_META: Record<string, { label: string; color: string; icon: string }> = {
  google:      { label: "Google Maps",  color: "#4285f4", icon: "🗺️" },
  yelp:        { label: "Yelp",         color: "#d32323", icon: "⭐" },
  tripadvisor: { label: "TripAdvisor",  color: "#00af87", icon: "🦉" },
  web:         { label: "Web Araması",  color: "#8b5cf6", icon: "🔍" },
  serper:      { label: "Web Araması",  color: "#8b5cf6", icon: "🔍" },
  demo:        { label: "Demo Veri",    color: "#666",    icon: "🧪" },
  manuel:      { label: "Manuel Giriş", color: "#f97316", icon: "📝" },
};

export default function PlatformBreakdown({ data }: Props) {
  if (!data?.length) return null;

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 24 }}>
      <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>
        Veri Kaynakları
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((entry) => {
          const meta = PLATFORM_META[entry.platform] ?? { label: entry.platform, color: "#555", icon: "📊" };
          return (
            <div key={entry.platform}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{meta.icon}</span>
                  {meta.label}
                </span>
                <span style={{ fontSize: 13, color: "#555" }}>
                  {entry.yorum_sayisi} yorum · %{entry.yuzde}
                </span>
              </div>
              <div style={{ height: 5, background: "#1a1a1a", borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${entry.yuzde}%`,
                  background: meta.color,
                  borderRadius: 5,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {data.some(d => d.platform === "demo") && (
        <div style={{
          marginTop: 14, padding: "8px 12px",
          background: "#1a1a00", border: "1px solid #f9731622",
          borderRadius: 10, fontSize: 12, color: "#f97316",
        }}>
          🧪 Demo veri kullanılıyor. Gerçek veriler için API key ekleyin.
        </div>
      )}
    </div>
  );
}
