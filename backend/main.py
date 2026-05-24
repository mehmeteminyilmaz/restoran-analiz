"""Restoran Analiz AI — FastAPI backend."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from analyzer import analyze_reviews, generate_compare_summary
from scrapers.google_places import fetch_google_reviews, place_id_from_url
from scrapers.serper_search import search_restaurant

load_dotenv(override=True)

app = FastAPI(
    title="Restoran Analiz AI",
    description="Müşteri yorumlarını yapay zeka ile analiz eden API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request şemaları ─────────────────────────────────────────────────────────

class TextRequest(BaseModel):
    reviews: list[str]

class PlacesRequest(BaseModel):
    place_id: str
    restaurant_name: Optional[str] = "Restoran"
    review_count: Optional[int] = 20

class UrlRequest(BaseModel):
    url: str
    review_count: Optional[int] = 20

class SearchRequest(BaseModel):
    query: str
    review_count: Optional[int] = 15

class CompareRestaurant(BaseModel):
    name: str
    reviews: Optional[list[str]] = None
    place_id: Optional[str] = None
    query: Optional[str] = None

class CompareRequest(BaseModel):
    restaurant_a: CompareRestaurant
    restaurant_b: CompareRestaurant


# ── Yardımcı ─────────────────────────────────────────────────────────────────

async def _resolve_reviews(r: CompareRestaurant) -> tuple[list[str], list[dict]]:
    """CompareRestaurant için yorumları ve kaynak dağılımını döner."""
    if r.reviews:
        return r.reviews, [{"platform": "manuel", "count": len(r.reviews)}]
    if r.place_id:
        data = await fetch_google_reviews(r.place_id)
        return data["reviews"], [{"platform": data["source"], "count": len(data["reviews"])}]
    if r.query:
        data = await search_restaurant(r.query)
        breakdown = [{"platform": b["platform"], "count": b["count"]} for b in data["breakdown"]]
        return data["reviews"], breakdown
    raise ValueError(f"'{r.name}' için yorum kaynağı belirtilmedi (reviews, place_id veya query gerekli)")


# ── Endpoint'ler ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    import os
    return {
        "status": "Restoran Analiz AI v2.0 çalışıyor",
        "version": "2.0.0",
        "has_google_key": bool(os.getenv("GOOGLE_PLACES_API_KEY", "").strip()),
        "has_serper_key": bool(os.getenv("SERPER_API_KEY", "").strip()),
    }


@app.post("/analyze/text")
async def analyze_text(req: TextRequest):
    """Manuel yapıştırılan yorumları analiz et."""
    if not req.reviews:
        raise HTTPException(400, "En az 1 yorum gerekli")
    if len(req.reviews) > 100:
        raise HTTPException(400, "Maksimum 100 yorum analiz edilebilir")
    try:
        result = await analyze_reviews(req.reviews)
        return {"success": True, "data": result, "source": "manuel"}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/analyze/places")
async def analyze_places(req: PlacesRequest):
    """Google Places API ile gerçek yorumları çek ve analiz et."""
    try:
        fetched = await fetch_google_reviews(req.place_id, req.review_count)
        if not fetched["reviews"]:
            raise HTTPException(404, "Bu mekan için yorum bulunamadı")

        breakdown = [{"platform": fetched["source"], "count": len(fetched["reviews"])}]
        result = await analyze_reviews(fetched["reviews"], source_breakdown=breakdown)

        return {
            "success": True,
            "data": result,
            "source": fetched["source"],
            "restaurant_name": fetched.get("restaurant_name"),
            "google_rating": fetched.get("rating"),
            "note": fetched.get("note"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/analyze/url")
async def analyze_url(req: UrlRequest):
    """Google Maps URL'sinden place_id çıkar ve analiz et."""
    try:
        place_id = await place_id_from_url(req.url)
        if place_id:
            fetched = await fetch_google_reviews(place_id, req.review_count)
        else:
            # URL'den place_id çıkarılamadı — demo
            fetched = await fetch_google_reviews("", req.review_count)  # API key yoksa demo döner

        breakdown = [{"platform": fetched["source"], "count": len(fetched["reviews"])}]
        result = await analyze_reviews(fetched["reviews"], source_breakdown=breakdown)

        return {
            "success": True,
            "data": result,
            "source": fetched["source"],
            "note": fetched.get("note") or ("URL'den place_id çıkarılamadı, demo mod." if not place_id else None),
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/analyze/search")
async def analyze_search(req: SearchRequest):
    """Restoran adını aratıp Yelp/TripAdvisor snippet'larını analiz et."""
    try:
        fetched = await search_restaurant(req.query, req.review_count)
        if not fetched["reviews"]:
            raise HTTPException(404, "Arama sonucunda yorum bulunamadı")

        breakdown = [{"platform": b["platform"], "count": b["count"]} for b in fetched["breakdown"]]
        result = await analyze_reviews(fetched["reviews"], source_breakdown=breakdown)

        return {
            "success": True,
            "data": result,
            "source": fetched["source"],
            "query": req.query,
            "note": fetched.get("note"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/analyze/compare")
async def analyze_compare(req: CompareRequest):
    """İki restoranı yan yana analiz et ve karşılaştır."""
    try:
        reviews_a, breakdown_a = await _resolve_reviews(req.restaurant_a)
        reviews_b, breakdown_b = await _resolve_reviews(req.restaurant_b)

        if not reviews_a:
            raise HTTPException(400, f"'{req.restaurant_a.name}' için yorum bulunamadı")
        if not reviews_b:
            raise HTTPException(400, f"'{req.restaurant_b.name}' için yorum bulunamadı")

        import asyncio
        result_a, result_b = await asyncio.gather(
            analyze_reviews(reviews_a, source_breakdown=breakdown_a),
            analyze_reviews(reviews_b, source_breakdown=breakdown_b),
        )

        # Kazanan
        score_a = result_a.get("genel_skor", 0)
        score_b = result_b.get("genel_skor", 0)
        if score_a > score_b + 3:
            kazanan = "A"
        elif score_b > score_a + 3:
            kazanan = "B"
        else:
            kazanan = "Eşit"

        # Karşılaştırma özeti
        fark_ozeti = await generate_compare_summary(
            req.restaurant_a.name, result_a,
            req.restaurant_b.name, result_b,
        )

        return {
            "success": True,
            "data": {
                "restoran_a": {"name": req.restaurant_a.name, "analiz": result_a},
                "restoran_b": {"name": req.restaurant_b.name, "analiz": result_b},
                "kazanan": kazanan,
                "fark_ozeti": fark_ozeti,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
