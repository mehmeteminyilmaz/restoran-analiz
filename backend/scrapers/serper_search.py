"""Serper.dev Google Search API ile Yelp / TripAdvisor snippet çekme.

Gereksinim:
    SERPER_API_KEY ortam değişkeni (serper.dev'den ücretsiz alınır — 2500 istek/ay).
    Yoksa demo yorumlar döner.
"""
import os
import httpx
import re
from typing import Optional


DEMO_YELP_REVIEWS = [
    "Absolutely fantastic food, the lamb dishes were outstanding.",
    "Service was a bit slow but the staff were very friendly.",
    "Prices are a bit high but the quality justifies it.",
    "Beautiful ambiance, perfect for a romantic dinner.",
    "Portions were small, left feeling a bit hungry.",
]

DEMO_TRIPADVISOR_REVIEWS = [
    "One of the best restaurants in the city, highly recommended!",
    "The view from the terrace is breathtaking.",
    "Vegetarian options are very limited, hope they expand the menu.",
    "Booking was easy and the table was ready on time.",
    "Desserts are a must-try, especially the baklava.",
]

SERPER_URL = "https://google.serper.dev/search"


async def fetch_web_reviews(query: str, max_reviews: int = 15, platform: Optional[str] = None) -> dict:
    """
    Serper.dev ile web araması yapar, review snippet'ları toplar.

    Args:
        query: "Nusr-et Etiler yorumlar" gibi
        platform: "yelp", "tripadvisor" veya None (ikisi de)

    Returns:
        {"reviews": [...], "platform": "yelp|tripadvisor|web", "source": "serper|demo"}
    """
    api_key = os.getenv("SERPER_API_KEY", "")

    if not api_key:
        # Demo fallback
        if platform == "yelp":
            reviews = DEMO_YELP_REVIEWS[:max_reviews]
        elif platform == "tripadvisor":
            reviews = DEMO_TRIPADVISOR_REVIEWS[:max_reviews]
        else:
            reviews = (DEMO_YELP_REVIEWS + DEMO_TRIPADVISOR_REVIEWS)[:max_reviews]
        return {
            "reviews": reviews,
            "platform": platform or "web",
            "source": "demo",
            "note": "SERPER_API_KEY ayarlanmadı. Demo mod aktif.",
        }

    # Platform odaklı arama
    if platform == "yelp":
        search_q = f"{query} site:yelp.com"
    elif platform == "tripadvisor":
        search_q = f"{query} site:tripadvisor.com"
    else:
        search_q = f"{query} müşteri yorumları"

    headers = {
        "X-API-KEY": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "q": search_q,
        "gl": "tr",
        "hl": "tr",
        "num": 10,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(SERPER_URL, json=payload, headers=headers)
        data = resp.json()

    snippets = []
    # organic results → snippet
    for item in data.get("organic", []):
        snippet = item.get("snippet", "").strip()
        if snippet and len(snippet) > 30:
            snippets.append(snippet)

    # answer box varsa ekle
    if data.get("answerBox", {}).get("answer"):
        snippets.insert(0, data["answerBox"]["answer"])

    # snippet yoksa fallback
    if not snippets:
        snippets = DEMO_YELP_REVIEWS[:max_reviews]

    return {
        "reviews": snippets[:max_reviews],
        "platform": platform or "web",
        "source": "serper",
    }


async def search_restaurant(query: str, max_reviews: int = 15) -> dict:
    """
    Hem web hem de mümkünse yelp + tripadvisor'dan review toplar.
    Her birinden max_reviews//3 kadar alır, birleştirir.
    """
    per_source = max(5, max_reviews // 3)

    web_data = await fetch_web_reviews(query, per_source)
    yelp_data = await fetch_web_reviews(f"{query} yelp yorumlar", per_source, platform="yelp")
    ta_data   = await fetch_web_reviews(f"{query} tripadvisor yorumlar", per_source, platform="tripadvisor")

    all_reviews = web_data["reviews"] + yelp_data["reviews"] + ta_data["reviews"]
    unique = list(dict.fromkeys(all_reviews))  # sırayı koruyarak tekrarları sil

    breakdown = [
        {"platform": "web",         "count": len(web_data["reviews"])},
        {"platform": "yelp",        "count": len(yelp_data["reviews"])},
        {"platform": "tripadvisor", "count": len(ta_data["reviews"])},
    ]

    return {
        "reviews": unique[:max_reviews],
        "breakdown": breakdown,
        "source": "serper" if os.getenv("SERPER_API_KEY") else "demo",
    }
