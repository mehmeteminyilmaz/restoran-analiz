interface Props {
  score: number;
  label?: string;
}

export default function ScoreGauge({ score, label = "Genel Puan" }: Props) {
  const R = 70;
  const circumference = Math.PI * R;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - progress / 100);

  const color   = progress >= 80 ? "#22c55e" : progress >= 60 ? "#f97316" : "#ef4444";
  const colorBg = color + "18";
  const label2  = progress >= 80 ? "Mükemmel" : progress >= 60 ? "İyi" : "Geliştirilmeli";

  const glowId = `glow-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="glass-card" style={{ padding: "28px 20px 20px", textAlign: "center" }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#444",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: "linear-gradient(135deg, #f97316, #ef4444)" }} />
        {label}
      </div>

      <div style={{ position: "relative", width: 180, height: 105, margin: "0 auto" }}>
        <svg width="180" height="115" viewBox="0 0 180 115">
          <defs>
            <linearGradient id="gaugeLoad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="gaugeDone" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            </filter>
          </defs>

          {/* Track */}
          <path d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
            fill="none" stroke="rgba(255,255,255,0.05)"
            strokeWidth="12" strokeLinecap="round" />

          {/* Glow */}
          <path d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
            fill="none"
            stroke={progress >= 80 ? "url(#gaugeDone)" : "url(#gaugeLoad)"}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity={0.4}
            filter={`url(#${glowId})`}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          />

          {/* Main progress */}
          <path d={`M 20 90 A ${R} ${R} 0 0 1 160 90`}
            fill="none"
            stroke={progress >= 80 ? "url(#gaugeDone)" : "url(#gaugeLoad)"}
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>

        {/* Center number */}
        <div style={{
          position: "absolute", bottom: 4, left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <span style={{
            fontSize: 46, fontWeight: 900, lineHeight: 1, color,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 30px ${color}60`,
            transition: "color 0.5s ease",
          }}>
            {progress}
          </span>
          <span style={{ fontSize: 11, color: "#444", marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* Level badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        marginTop: 16, padding: "6px 18px",
        background: colorBg,
        border: `1px solid ${color}35`,
        borderRadius: 99,
        fontSize: 12, fontWeight: 700, color,
        letterSpacing: "0.02em",
        boxShadow: `0 0 20px ${color}20`,
      }}>
        {progress >= 80 ? "⭐" : progress >= 60 ? "📈" : "⚠️"}
        {label2}
      </div>
    </div>
  );
}
