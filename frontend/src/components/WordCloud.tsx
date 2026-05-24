interface Props {
  words: string[];
  scores?: Record<string, number>; // kelime → ağırlık (opsiyonel)
}

const COLORS = [
  "#f97316", "#ef4444", "#f59e0b", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#fb923c", "#a3e635",
];

export default function WordCloud({ words, scores }: Props) {
  if (!words?.length) return null;

  // Kelime boyutu: ilk kelimelere daha büyük ağırlık ver
  const sizes = words.map((_, i) => {
    if (scores?.[_]) return Math.min(28, 14 + scores[_] / 5);
    return Math.max(12, 24 - i * 2);
  });

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 24 }}>
      <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>
        Öne Çıkan Kelimeler
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 100,
        padding: "8px 0",
      }}>
        {words.map((word, i) => {
          const color = COLORS[i % COLORS.length];
          const size = sizes[i];
          return (
            <span
              key={word + i}
              style={{
                fontSize: size,
                fontWeight: i < 3 ? 700 : i < 6 ? 600 : 500,
                color,
                opacity: 0.85 - i * 0.05,
                padding: "4px 10px",
                background: color + "12",
                borderRadius: 20,
                border: `1px solid ${color}30`,
                transition: "all 0.2s ease",
                cursor: "default",
                lineHeight: 1.3,
                animation: `fadeInScale 0.4s ease ${i * 0.06}s both`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
