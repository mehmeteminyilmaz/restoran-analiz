# 🍽️ Restoran Analiz AI — Yapay Zeka Destekli Yorum Analitiği

> Müşteri yorumlarını yapay zeka modelleriyle derinlemesine analiz eden, platform bazlı veri toplayan ve göz alıcı premium arayüzüyle görsel raporlar üreten full-stack SaaS uygulaması.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org)
[![React](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green.svg)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-bd34fe.svg)](https://vite.dev)

---

## 🎨 Premium & Modern Arayüz Tasarımı
Uygulama, modern web tasarımının en iyi pratikleri kullanılarak baştan aşağı yenilenmiş ve göz alıcı bir kullanıcı deneyimi sunacak şekilde tasarlanmıştır:
- **Glassmorphism (Cam Efekti)**: Yüksek bulanıklık (`blur(20px)`) ve şeffaf katmanlarla hazırlanan premium kart tasarımları (`glass-card`).
- **Degrade Renk Paleti**: Turuncu, kırmızı ve mor tonlarının muhteşem uyumuyla şekillendirilmiş modern karanlık mod (Dark Mode).
- **Akıcı Mikro-Animasyonlar**: Sayfa geçişlerinde `fadeInUp`, yükleme durumlarında `pulse-glow` ve özel dönme (`spin`) animasyonları.
- **Dinamik SVG Puan Göstergesi (ScoreGauge)**: Linear-gradient renk geçişleri, neon parlama gölgesi ve restoran puanına göre değişen durum emojileriyle donatılmış özel çember grafik.
- **Canlı Durum Rozeti**: Sağ üst köşede uygulamanın aktifliğini gösteren nabız efektli yeşil `CANLI` durum göstergesi.

---

## 🚀 Özellikler

- **🔌 Çoklu Veri Kaynağı Entegrasyonu**:
  - *Manuel Giriş*: Yorumları doğrudan yapıştırarak anında analiz etme.
  - *Google Places API*: Restoran detaylarından tam adres ve şehir bilgisini otomatik parse ederek gerçek zamanlı yorum çekme.
  - *Yelp & TripAdvisor*: Serper.dev arama motoru aracılığıyla restoran yorum snippet'larını tarama.
- **🤖 Akıllı Yapay Zeka Modelleri (OpenRouter)**:
  - Ücretsiz Tier fallback zinciri sayesinde API kesintilerine son! Sırasıyla: `openrouter/free` ➔ `Llama 3.3` ➔ `Gemma 2` ➔ `DeepSeek` ➔ `Qwen 2.5` denenir.
- **🔒 Kusursuz Yerel Analiz Yedeklemesi (Local Fallback)**:
  - API anahtarlarınız olmadığında veya yapay zeka servislerinde limit aşımı yaşandığında, arka planda çalışan **akıllı yerel NLP sentiment analiz motoru** devreye girer ve uygulamanın kesintisiz çalışmasını sağlar.
- **⚖️ Rakip Karşılaştırma Paneli**:
  - İki restoranı yan yana ve başa baş kıyaslama.
  - Yapay zeka tarafından hazırlanan "Kazanan Özeti" ve iki restoranın yemek, servis, fiyat, ambiyans skorlarını karşılaştıran **Radar Grafiği**.
- **📊 Kapsamlı Dashboard Raporları**:
  - 📈 *Puan Trendi*: Son 6 ayın skor ve yorum hacmi değişimi.
  - ☁️ *Kelime Bulutu*: Müşteri yorumlarında en çok öne çıkan kelimeler.
  - 👨‍🍳 *Detaylı Kategori Skorları*: Yemek kalitesi, servis hızı, fiyat/değer dengesi ve ambiyans için ayrı ayrı puan ve yapay zeka yorumları.
  - 💡 *Aksiyon Önerileri*: Yüksek, orta, düşük öncelikli çözümler ve bunların restoran üzerindeki beklenen etkileri.

---

## 🏗️ Proje Yapısı

```
restoran-analiz/
├── backend/
│   ├── main.py              # FastAPI Uygulaması ve Uç Noktalar
│   ├── analyzer.py          # Yapay Zeka ve Yerel NLP Analiz Motoru
│   ├── models.py            # Pydantic Şemaları ve Veri Doğrulama
│   ├── scrapers/
│   │   ├── google_places.py # Google Places API ve Adres/Şehir Parser
│   │   └── serper_search.py # Yelp & TripAdvisor Arama Tarayıcı
│   ├── .env.example         # Örnek Çevre Değişkenleri
│   └── requirements.txt     # Python Bağımlılıkları
└── frontend/
    ├── src/
    │   ├── App.tsx           # Router, Header ve Sayfa Düzenleri
    │   ├── index.css         # Tasarım Sistemi, CSS Değişkenleri ve Animasyonlar
    │   └── components/
    │       ├── Dashboard.tsx        # Detaylı Analiz Sonuçları Raporu
    │       ├── InputPanel.tsx       # Kaynak Seçimi ve Yorum Giriş Alanı
    │       ├── ComparePanel.tsx     # Rakip Karşılaştırma Bileşeni
    │       ├── ScoreGauge.tsx       # SVG Degrade Puan Göstergesi
    │       ├── TrendChart.tsx       # Recharts Çizgi Grafiği
    │       ├── WordCloud.tsx        # Öne Çıkan Kelimeler Bulutu
    │       ├── PlatformBreakdown.tsx# Kaynak Yüzdeleri Gösterimi
    │       └── LoadingScreen.tsx    # Aşamalı Yükleme İlerleme Ekranı
    └── package.json          # Frontend Bağımlılıkları
```

---

## ⚙️ Kurulum & Çalıştırma

### Gereksinimler
- Node.js (v18+)
- Python (3.11+)
- OpenRouter API Key (Ücretsiz katman yeterlidir)

### 1. Backend Kurulumu
```bash
cd backend
python -m venv .venv

# Windows için sanal ortamı aktifleştirme:
.venv\Scripts\activate
# macOS/Linux için:
# source .venv/bin/activate

pip install -r requirements.txt

# Çevre değişkenlerini ayarlama:
cp .env.example .env
# .env dosyasını açıp OPENROUTER_API_KEY bilginizi girin.
# (API anahtarı girilmezse uygulama otomatik olarak kusursuz demo/fallback modunda çalışır)

# Backend servisini başlatın:
uvicorn main:app --reload --port 8000
```

### 2. Frontend Kurulumu
```bash
cd frontend
npm install

# Geliştirme sunucusunu başlatın:
npm run dev
```

Uygulamanız artık yayında!
- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:8000  
- **API Dokümantasyonu (Swagger):** http://localhost:8000/docs  

---

## 🌐 API Endpoint'leri

| Endpoint | Method | Açıklama |
|---|---|---|
| `GET /` | GET | Servis sağlık durumu ve entegrasyon kontrolleri |
| `/analyze/text` | POST | Doğrudan yapıştırılan metin yorumlarını analiz etme |
| `/analyze/places` | POST | Google Places ID ile yorum çekip analiz etme |
| `/analyze/url` | POST | Google Maps URL'sinden ID çözüp analiz etme |
| `/analyze/search` | POST | Yelp & TripAdvisor üzerinde restoran arayıp analiz etme |
| `/analyze/compare` | POST | İki restoranı yan yana analiz edip karşılaştırma |

---

## 📄 Lisans
Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
