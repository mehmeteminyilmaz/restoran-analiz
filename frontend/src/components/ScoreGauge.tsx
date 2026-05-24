interface Props {
  score: number;
  label?: string;
}

export default function ScoreGauge({ score, label = "Genel Puan" }: Props) {
  // Yarım çember: 0° = sol (180deg SVG), 180° = sağ
  const R = 70;
  const circumference = Math.PI * R; // yarım çember
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - progress / 100);

  const color = progress >= 80 ? "#22c55e" : progress >= 60 ? "#f97316" : "#ef4444";
  const colorBg = color + "22";

  const label2 = progress >= 80 ? "Mükemmel" : progress >= 60 ? "Orta" : "Geliştirilmeli";

  return (
    <div style={{
      background: "#111", border: "1px solid #1e1e1e", borderRadius: 20,
      padding: "28px 24px 16px", textAlign: "center",
    }}>
      <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 20 }}>
        {label}
      </div>

      <div style={{ position: "relative", width: 180, height: 100, margin: "0 auto" }}>
        <svg width="180" height="110" viewBox="0 0 180 110">
          {/* Track */}
          <path
            d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Colored progress */}
          <path
            d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1), stroke 0.5s ease" }}
          />
          {/* Glow */}
          <path
            d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity={0.3}
            filter="blur(4px)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <span style={{ fontSize: 42, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {progress}
          </span>
          <span style={{ fontSize: 12, color: "#555", marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* Badge */}
      <div style={{
        display: "inline-block", marginTop: 16,
        padding: "5px 16px", background: colorBg,
        border: `1px solid ${color}44`, borderRadius: 20,
        fontSize: 13, fontWeight: 600, color,
      }}>
        {label2}
      </div>
    </div>
  );
}
