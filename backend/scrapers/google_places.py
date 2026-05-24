"""Google Places API ile gerçek yorum çekme.

Gereksinim:
    GOOGLE_PLACES_API_KEY ortam değişkeni ayarlanmış olmalı.
    Yoksa demo yorumlar döner (graceful fallback).
"""
import os
import httpx
from typing import Optional


DEMO_REVIEWS = [
    "Yemekler harikaydı, özellikle kebap mükemmeldi!",
    "Servis biraz yavaş kaldı ama personel çok nazikti.",
    "Fiyatlar makul, kaliteye göre gayet uygun.",
    "Ambiyans çok güzel, romantik bir akşam yemeği için ideal.",
    "Porsiyon miktarları biraz az, doyurucu gelmedi.",
    "Temizlik konusunda çok titizler, her yer pırıl pırıl.",
    "Rezervasyon yaptırmak çok kolaydı, sistemi iyi çalışıyor.",
    "Vejetaryen seçenekler oldukça kısıtlı, çeşit artırılmalı.",
    "Manzarası inanılmaz, Boğaz'a karşı yemek yemek ayrı güzel.",
    "Tatlılar enfes, künefe özellikle tavsiye ederim.",
]


async def fetch_google_reviews(place_id: str, max_reviews: int = 20) -> dict:
    """
    Returns:
        {
            "reviews": [...],
            "restaurant_name": "...",
            "rating": 4.5,
            "source": "google" | "demo"
        }
    """
    api_key = os.getenv("GOOGLE_PLACES_API_KEY", "")
    if not api_key:
        return {
            "reviews": DEMO_REVIEWS[:max_reviews],
            "restaurant_name": "Demo Restoran",
            "rating": None,
            "source": "demo",
            "note": "GOOGLE_PLACES_API_KEY ayarlanmadı. Demo mod aktif.",
        }

    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,rating,reviews,formatted_address",
        "language": "tr",
        "key": api_key,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=params)
        data = resp.json()

    if data.get("status") != "OK":
        raise ValueError(f"Google Places API hatası: {data.get('status')} — {data.get('error_message', '')}")

    result = data["result"]
    reviews_raw = result.get("reviews", [])
    texts = [r["text"] for r in reviews_raw if r.get("text")]

    full_address = result.get("formatted_address", "")
    # Şehir: adresten son iki virgülle ayrılmış parçadan ilkini al
    # Örn: "Bağdat Cd. No:5, 34730 Kadıköy/İstanbul, Türkiye"  → "İstanbul"
    city = ""
    if full_address:
        parts = [p.strip() for p in full_address.split(",")]
        # Son parça genellikle ülke, sondan bir önceki şehir içerir
        if len(parts) >= 2:
            candidate = parts[-2]  # "34730 Kadıköy/İstanbul" gibi
            # Slash varsa son kısım şehirdir
            if "/" in candidate:
                city = candidate.split("/")[-1].strip()
            else:
                # Rakam prefix'i at (posta kodu)
                city = " ".join(w for w in candidate.split() if not w[0].isdigit()).strip()

    return {
        "reviews": texts[:max_reviews],
        "restaurant_name": result.get("name", ""),
        "rating": result.get("rating"),
        "address": full_address,
        "city": city,
        "source": "google",
    }


async def place_id_from_url(maps_url: str) -> Optional[str]:
    """Google Maps URL'sinden place_id çıkarmaya çalışır (kısmi destek)."""
    import re
    # Örn: place_id=ChIJXXX biçimi
    m = re.search(r"place_id=([A-Za-z0-9_\-]+)", maps_url)
    if m:
        return m.group(1)
    return None
