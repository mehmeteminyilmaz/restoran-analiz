import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface TrendPoint {
  ay: string;
  skor: number;
  yorum_sayisi?: number;
}

interface Props {
  data: TrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      <div style={{ color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#f97316", fontWeight: 700 }}>Skor: {payload[0]?.value}</div>
      {payload[1] && <div style={{ color: "#666", marginTop: 2 }}>Yorum: {payload[1]?.value}</div>}
    </div>
  );
};

export default function TrendChart({ data }: Props) {
  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
            Puan Trendi
          </div>
          <div style={{ fontSize: 13, color: "#444" }}>Son 6 ay</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
            <div style={{ width: 10, height: 3, background: "#f97316", borderRadius: 2 }} /> Skor
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
            <div style={{ width: 10, height: 10, background: "#333", borderRadius: 2 }} /> Yorum
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis dataKey="ay" tick={{ fill: "#444", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[40, 100]} tick={{ fill: "#444", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="skor"
            stroke="#f97316"
            strokeWidth={2.5}
            fill="url(#trendGrad)"
            dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#f97316" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Mini bar chart for yorum_sayisi */}
      {data[0]?.yorum_sayisi !== undefined && (
        <ResponsiveContainer width="100%" height={50} style={{ marginTop: 8 }}>
          <BarChart data={data} barSize={10}>
            <Bar dataKey="yorum_sayisi" fill="#1e1e1e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
