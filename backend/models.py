"""Merkezi Pydantic şema dosyası."""
from pydantic import BaseModel
from typing import Optional


# ── Request modelleri ────────────────────────────────────────────────────────

class TextRequest(BaseModel):
    reviews: list[str]

class PlacesRequest(BaseModel):
    place_id: str
    review_count: Optional[int] = 20

class SearchRequest(BaseModel):
    query: str          # "Nusr-et İstanbul" gibi arama terimi
    review_count: Optional[int] = 15

class CompareRequest(BaseModel):
    restaurant_a: dict  # {"name": ..., "reviews": [...]} veya {"place_id": ...}
    restaurant_b: dict


# ── Response modelleri ───────────────────────────────────────────────────────

class CategoryScore(BaseModel):
    skor: int
    yorum: str

class DuyguDagilimi(BaseModel):
    pozitif: int
    notr: int
    negatif: int

class AksiyonOnerisi(BaseModel):
    oncelik: str
    oneri: str
    etki: str

class SourceBreakdown(BaseModel):
    platform: str        # "google", "yelp", "tripadvisor", "manuel"
    yorum_sayisi: int
    yuzde: int

class AnalysisResult(BaseModel):
    genel_skor: int
    toplam_yorum: int
    ozet: str
    duygu_dagilimi: DuyguDagilimi
    kategoriler: dict[str, CategoryScore]
    guclu_yonler: list[str]
    zayif_yonler: list[str]
    aksiyon_onerileri: list[AksiyonOnerisi]
    one_cikan_kelimeler: list[str]
    # Yeni alanlar
    kaynak_dagilimi: Optional[list[SourceBreakdown]] = None
    trend_verisi: Optional[list[dict]] = None   # [{"ay": "Ocak", "skor": 82}, ...]

class CompareResult(BaseModel):
    restoran_a: AnalysisResult
    restoran_b: AnalysisResult
    kazanan: str         # "A", "B" veya "Eşit"
    fark_ozeti: str
