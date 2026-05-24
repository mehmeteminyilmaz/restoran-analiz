#             🍽️ Restoran Analiz AI  
      Yapay Zeka Destekli Yorum Analitiği

> Müşteri yorumlarını yapay zeka modelleriyle derinlemesine analiz eden, platform bazlı veri toplayan ve göz alıcı premium arayüzüyle görsel raporlar üreten full-stack SaaS uygulaması.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org)
[![React](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green.svg)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8.0-bd34fe.svg)](https://vite.dev)

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

### Backend (Sunucu & Analiz Motoru)
- **[FastAPI](https://fastapi.tiangolo.com/)**: Asenkron yapıda çalışan, yüksek performanslı ve modern Python API çatısı.
- **[Python 3.11+](https://www.python.org/)**: Projenin veri çekme ve analiz algoritmalarının temel dili.
- **[Uvicorn](https://www.uvicorn.org/)**: Asenkron sunucu geçiş arayüzü (ASGI) sunucusu.
- **[AsyncOpenAI SDK](https://github.com/openai/openai-python)**: OpenRouter API üzerinden yapay zeka modelleriyle asenkron iletişim kurmak için kullanılan istemci.
- **[Pydantic v2](https://docs.pydantic.dev/)**: Veri şeması tanımlama ve katı tip/doğrulama kontrolü.
- **[Python-dotenv](https://github.com/theofidry/django-dotenv)**: `.env` dosyası üzerinden çevre değişkenleri (API Key'ler vb.) güvenli yönetimi.
- **[Httpx](https://www.python-httpx.org/)**: Google Places ve Serper API sorguları için kullanılan asenkron HTTP istemcisi.

### Frontend (Kullanıcı Arayüzü)
- **[React 19](https://react.dev/)**: Bileşen tabanlı modern kullanıcı arayüzü kütüphanesi.
- **[TypeScript](https://www.typescriptlang.org/)**: Güvenli kodlama için statik tip tanımlamaları.
- **[Vite 8.0](https://vite.dev/)**: Hızlı önbelleklemeli ve yeni nesil frontend derleyici aracı.
- **[React Router DOM v6](https://reactrouter.com/)**: Sayfalar arası geçiş ve yönlendirme yönetimi.
- **[Recharts](https://recharts.org/)**: Çizgi, pasta ve radar grafiklerini çizdirmek için asenkron SVG grafik kütüphanesi.
- **[Lucide React](https://lucide.dev/)**: Modern ve sade arayüz ikon seti.
- **[Vanilla CSS (Tasarım Sistemi)](https://developer.mozilla.org/en-US/docs/Web/CSS)**: Değişken tabanlı, esnek ve premium cam efekti (glassmorphism) stillerinin, özel scrollbar'ların ve geçiş animasyonlarının sıfırdan tasarlandığı özelleştirilmiş CSS sistemi.

---

## ⚡ Son Yapılan Geliştirmeler & Neler Yaptık?

Proje üzerinde uçtan uca yapılan kapsamlı güncellemeler ve hayata geçirilen yenilikler:

### 1. 🎨 Arayüz Tasarımı & Premium Görsellik
- **Glassmorphism (Cam Efekti) Entegrasyonu**: Tüm panel ve kart tasarımları (`glass-card`) arka plan bulanıklaştırma (`backdrop-filter: blur(20px)`) ve şık kenarlıklarla (`border: 1px solid rgba(255,255,255,0.06)`) modernize edildi.
- **Renk ve Tipografi**: Renk paleti HSL uyumlu degradelerle zenginleştirildi; standard sistem fontları yerine **Inter** Google Font sistemi entegre edildi.
- **Akıcı Mikro-Animasyonlar**: Sayfalara `fadeInUp`, `float`, ve durumsal yüklemelere nabız efekti (`pulse-glow`) kazandırıldı.
- **Canlı Gösterge Badge'i**: Uygulamanın aktif durumunu gösteren, nabız animasyonlu yeşil bir `CANLI` rozeti header alanına yerleştirildi.

### 2. 📊 Raporlama & Karşılaştırma Sayfası Dönüşümü
- **Özel SVG Skor Göstergesi (ScoreGauge)**: SVG ile çizilmiş yarım daire puan kadranı, renk geçişli `linear-gradient` dolgu, neon gölgeler ve puan seviyesine göre değişen ikonlarla (`⭐`, `📈`, `⚠️`) zenginleştirildi.
- **Rakip Karşılaştırma Paneli (`ComparePanel.tsx`)**: Form alanları, giriş kutuları (`input-base`) ve "Karşılaştır" butonları premium tasarıma uyarlandı. İki restoranı tek bir grafikte kıyaslayan **SVG Radar Grafiği** yenilendi ve yapay zeka kazanan değerlendirme kartı animasyonlu hale getirildi.
- **Detaylı Rapor Kartları**: Güçlü/zayıf yönler yeşil/kırmızı şık çerçevelere, aksiyon önerileri ise öncelik etiketleriyle (yüksek, orta, düşük) modern bilgi kutularına dönüştürüldü.

### 3. 🧠 Backend Zekası & Veri Kalitesi
- **Google Places API Entegrasyonu & Parser**: Places detay servisinden restoranın tam adres (`formatted_address`) bilgisi çekilerek içinden **şehir bilgisi** otomatik parse edildi.
- **Çoklu Model Fallback Sistemi**: OpenRouter API üzerinde yaşanabilecek olası gecikmeler veya rate-limit durumları için **Llama 3.3 ➔ Gemma 2 ➔ DeepSeek ➔ Qwen** sıralı yedekleme boru hattı kuruldu.
- **Akıllı Yerel NLP Duygu Analizi (Local Fallback)**: API anahtarı yokken veya API çöktüğünde devreye giren yerel duygu analizi ve simüle edilmiş trend grafik motoru kurularak uygulamanın kesintisiz (error-free) çalışması garanti altına alındı.

### 4. 📈 SEO & Yayın Kalitesi
- **SEO İyileştirmeleri**: `index.html` üzerinde Türkçe dil desteği, Open Graph meta etiketleri, açıklama (description), anahtar kelimeler ve emoji tabanlı modern bir favicon tanımlandı.
- **GitHub Versiyon Kontrolü**: Tüm bu devasa değişiklikler, **parça parça ve açıklayıcı Türkçe commit mesajlarıyla** (toplam 8 commit) adım adım commit'lenip GitHub uzak sunucusuna sorunsuz bir şekilde push'landı.

---

## 🚀 Özellikler

- **🔌 Çoklu Veri Kaynağı**: Manuel yorum, Google Places API ve Serper.dev (Yelp & TripAdvisor) entegrasyonu.
- **🤖 Akıllı AI Modelleri**: OpenRouter üzerinden ücretsiz modellerin otomatikfallback mekanizması.
- **🔒 Kesintisiz Çalışma**: API anahtarları eksik olduğunda otomatik devreye giren demo ve yerel yedek analiz modu.
- **⚖️ Rakip Karşılaştırma**: İki mekanı tek sayfada puan, analiz özeti ve radar grafiğiyle kıyaslama gücü.
- **📊 Zengin Görsel Dashboard**: Puan trendi, kelime bulutu, platform kırılımı, kategori analizleri ve eylem planı.

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
