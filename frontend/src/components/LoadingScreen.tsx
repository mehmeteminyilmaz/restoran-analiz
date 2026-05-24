import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface Props {
  reviewsCount: number;
  apiDone: boolean;       // App: API cevabı geldi
  onComplete: () => void; // Biz: animasyon bitti, geçiş yapabilirsin
}

const STEPS = (count: number) => [
  { id: 1, label: `${count} adet müşteri yorumu okunuyor ve temizleniyor...`, duration: 1800 },
  { id: 2, label: "Llama AI modeline güvenli bağlantı kuruluyor...",           duration: 1500 },
  { id: 3, label: "Semantik ve duygu (sentiment) analizleri yapılıyor...",      duration: 2500 },
  { id: 4, label: "Yemek, Servis, Ambiyans ve Fiyat kategorileri skorlanıyor...", duration: 2500 },
  { id: 5, label: "Güçlü/zayıf yönler ve kritik anahtar kelimeler çıkarılıyor...", duration: 2200 },
  { id: 6, label: "İşletmeniz için eyleme geçilebilir aksiyon planları tasarlanıyor...", duration: 2500 },
  { id: 7, label: "Görsel raporlama paneli hazırlanıyor...",                    duration: 2000 },
];

export default function LoadingScreen({ reviewsCount, apiDone, onComplete }: Props) {
  const steps = STEPS(reviewsCount);
  const totalDuration = steps.reduce((s, st) => s + st.duration, 0);

  const [progress, setProgress]           = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [done, setDone]                   = useState(false);   // yeşil tamamlandı
  const [fadeOut, setFadeOut]             = useState(false);   // ekran kaybolur

  const rafRef    = useRef<number>(0);
  const elapsedRef = useRef(0);
  const lastTsRef  = useRef<number | null>(null);
  const onCompleteCalledRef = useRef(false);

  /* ---- İlerleme animasyonu: maks %92 ---- */
  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      elapsedRef.current += dt;

      // %92'ye kadar git; kalan %8 "apiDone" sonrası
      const raw = Math.min((elapsedRef.current / totalDuration) * 92, 92);
      setProgress(Math.round(raw));

      // Aktif adım
      let acc = 0;
      let activeIdx = steps.length - 1;
      for (let i = 0; i < steps.length; i++) {
        acc += steps[i].duration;
        if (elapsedRef.current < acc) { activeIdx = i; break; }
      }
      setCurrentStepIndex(activeIdx);

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ---- API cevabı geldiğinde: %100 + "Tamamlandı" + fade-out ---- */
  useEffect(() => {
    if (!apiDone || onCompleteCalledRef.current) return;

    // Animasyon durdur
    cancelAnimationFrame(rafRef.current);

    // %100'e pürüzsüz git
    const start = performance.now();
    const fromProgress = Math.round(Math.min((elapsedRef.current / totalDuration) * 92, 92));
    const fillDuration = 600; // ms içinde %100'e çık

    const fill = (ts: number) => {
      const t = Math.min((ts - start) / fillDuration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = Math.round(fromProgress + (100 - fromProgress) * eased);
      setProgress(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(fill);
      } else {
        // %100 ulaştı: tüm adımları tamamlandı göster
        setProgress(100);
        setCurrentStepIndex(steps.length); // hepsini yeşil yap
        setDone(true);

        // 800ms "Tamamlandı!" ekranı gözükür, sonra fade-out
        setTimeout(() => {
          setFadeOut(true);
          // Fade-out geçiş süresi (600ms CSS) bittikten sonra onComplete
          setTimeout(() => {
            onCompleteCalledRef.current = true;
            onComplete();
          }, 620);
        }, 800);
      }
    };
    rafRef.current = requestAnimationFrame(fill);
  }, [apiDone]);

  const accentColor = done ? "#22c55e" : "#f97316";

  return (
    <div style={{
      background: "#111111",
      border: `1px solid ${done ? "#22c55e33" : "#1e1e1e"}`,
      borderRadius: 24,
      padding: "40px 32px",
      textAlign: "center",
      maxWidth: 600,
      margin: "40px auto",
      boxShadow: done
        ? "0 20px 60px rgba(34, 197, 94, 0.12)"
        : "0 20px 40px rgba(0, 0, 0, 0.5)",
      position: "relative",
      overflow: "hidden",
      opacity: fadeOut ? 0 : 1,
      transform: fadeOut ? "scale(0.96) translateY(12px)" : "scale(1) translateY(0)",
      transition: "opacity 0.6s ease, transform 0.6s ease, border 0.5s ease, box-shadow 0.5s ease",
    }}>
      {/* Arka plan parlaması */}
      <div style={{
        position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%",
        background: done
          ? "radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, transparent 60%)"
          : "radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0, transition: "background 0.8s ease",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Üst ikon */}
        <div style={{
          width: 64, height: 64,
          background: done
            ? "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))"
            : "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15))",
          border: `1px solid ${done ? "rgba(34,197,94,0.4)" : "rgba(249,115,22,0.3)"}`,
          borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", color: accentColor,
          animation: done ? "none" : "pulse 2s infinite ease-in-out",
          transition: "all 0.5s ease",
        }}>
          {done
            ? <CheckCircle2 size={32} style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }} />
            : <Sparkles size={32} style={{ animation: "float 3s infinite ease-in-out" }} />}
        </div>

        <h3 style={{
          fontSize: 22, fontWeight: 700, color: done ? "#22c55e" : "#fff",
          marginBottom: 8, transition: "color 0.4s ease",
        }}>
          {done ? "✅ Analiz Tamamlandı!" : "Yapay Zeka Restoran Analizi Başladı"}
        </h3>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 32, minHeight: 20 }}>
          {done
            ? "Raporunuz hazırlanıyor, dashboard yükleniyor..."
            : "Llama AI modeli derinlemesine semantik analiz gerçekleştiriyor."}
        </p>

        {/* İlerleme çemberi */}
        <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 40px" }}>
          <svg style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
            <circle cx="70" cy="70" r="60" stroke="#1a1a1a" strokeWidth="8" fill="transparent" />
            <circle
              cx="70" cy="70" r="60"
              stroke={done ? "url(#doneGrad)" : "url(#loadGrad)"}
              strokeWidth="8" fill="transparent"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.35s ease, stroke 0.5s ease" }}
            />
            <defs>
              <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" /><stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="doneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 32, fontWeight: 800, lineHeight: 1,
              color: done ? "#22c55e" : "#fff",
              transition: "color 0.5s ease",
            }}>
              %{progress}
            </span>
            <span style={{ fontSize: 11, color: "#555", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ilerleme
            </span>
          </div>
        </div>

        {/* Adım listesi */}
        <div style={{
          textAlign: "left", background: "#0a0a0a", border: "1px solid #1a1a1a",
          borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14,
        }}>
          {steps.map((step, index) => {
            const isCompleted = done || index < currentStepIndex;
            const isActive    = !done && index === currentStepIndex;
            const isPending   = !done && index > currentStepIndex;
            return (
              <div key={step.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                opacity: isPending ? 0.3 : 1, transition: "opacity 0.3s ease",
              }}>
                <div style={{ flexShrink: 0, lineHeight: 0 }}>
                  {isCompleted && <CheckCircle2 size={18} style={{ color: "#22c55e" }} />}
                  {isActive    && <Loader2 size={18} style={{ color: "#f97316", animation: "spin 1s linear infinite" }} />}
                  {isPending   && <Clock size={18} style={{ color: "#444" }} />}
                </div>
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isCompleted ? "#aaa" : isActive ? "#fff" : "#444",
                  transition: "all 0.3s ease",
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { transform:scale(1); box-shadow:0 0 0 0 rgba(249,115,22,.2); }
          50%      { transform:scale(1.02); box-shadow:0 0 20px 5px rgba(249,115,22,.1); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-4px); }
        }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes popIn {
          0%   { transform:scale(0.4); opacity:0; }
          70%  { transform:scale(1.2); }
          100% { transform:scale(1);   opacity:1; }
        }
      `}</style>
    </div>
  );
}
