# 🍽️ Restoran Analiz AI

> Müşteri yorumlarını yapay zeka ile analiz eden, çok kaynaklı veri toplayan ve görsel raporlar üreten full-stack SaaS uygulaması.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-19-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green)

---

## 🚀 Özellikler

- **3 Farklı Veri Kaynağı**: Manuel yorum girişi, Google Places API, Yelp & TripAdvisor (Serper.dev)
- **AI Analiz**: OpenRouter üzerinden Llama, Gemma, DeepSeek modelleri (ücretsiz tier)
- **Zengin Dashboard**:
  - 📊 Puan Trendi (Son 6 ay)
  - ☁️ Kelime Bulutu
  - 🎯 Gauge Skoru
  - 🌐 Veri Kaynağı Dağılımı
  - 📡 Radar Grafik
- **⚖️ Rakip Karşılaştırma**: 2 restoranı yan yana analiz et, AI kazanan özeti
- **Akıllı Yükleme Ekranı**: Aşamalı animasyonlu progress göstergesi

---

## 🏗️ Proje Yapısı

```
restoran-analiz/
├── backend/
│   ├── main.py              # FastAPI uygulama
│   ├── analyzer.py          # AI analiz motoru (OpenRouter)
│   ├── models.py            # Pydantic şemaları
│   ├── scrapers/
│   │   ├── google_places.py # Google Places API
│   │   └── serper_search.py # Yelp & TripAdvisor (Serper.dev)
│   ├── .env.example         # Örnek ortam değişkenleri
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.tsx           # Router + Ana bileşen
    │   └── components/
    │       ├── Dashboard.tsx
    │       ├── InputPanel.tsx
    │       ├── LoadingScreen.tsx
    │       ├── ComparePanel.tsx
    │       ├── TrendChart.tsx
    │       ├── WordCloud.tsx
    │       ├── ScoreGauge.tsx
    │       └── PlatformBreakdown.tsx
    └── package.json
```

---

## ⚙️ Kurulum

### Gereksinimler

- Python 3.11+
- Node.js 18+
- [OpenRouter](https://openrouter.ai) API key (ücretsiz)
- *(Opsiyonel)* Google Places API key
- *(Opsiyonel)* [Serper.dev](https://serper.dev) API key

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
# veya: source .venv/bin/activate  # macOS/Linux

pip install fastapi uvicorn python-dotenv openai httpx

# .env dosyasını oluştur
cp .env.example .env
# .env içine OpenRouter API key'ini gir

uvicorn main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173  
API: http://localhost:8000  
API Docs: http://localhost:8000/docs

---

## 🔑 Ortam Değişkenleri

`backend/.env` dosyasını oluştur:

```env
# Zorunlu
OPENROUTER_API_KEY=sk-or-v1-...

# Opsiyonel — gerçek yorum çekme için
GOOGLE_PLACES_API_KEY=
SERPER_API_KEY=
```

> API key olmadan uygulama **demo modunda** çalışır, örnek verilerle analiz üretir.

---

## 🌐 API Endpoint'leri

| Endpoint | Method | Açıklama |
|---|---|---|
| `GET /` | GET | Sağlık kontrolü |
| `/analyze/text` | POST | Manuel yorum analizi |
| `/analyze/places` | POST | Google Places ID ile analiz |
| `/analyze/search` | POST | Restoran adı araması (Yelp/TripAdvisor) |
| `/analyze/compare` | POST | 2 restoran karşılaştırma |

---

## 🤖 Kullanılan AI Modeller

Ücretsiz model fallback zinciri (sırayla denenir):
1. `openrouter/free` (otomatik seçim)
2. `meta-llama/llama-3.3-70b-instruct:free`
3. `google/gemma-2-9b-it:free`
4. `deepseek/deepseek-r1:free`
5. `qwen/qwen-2.5-coder-32b-instruct:free`

---

## 📄 Lisans

MIT © 2026
