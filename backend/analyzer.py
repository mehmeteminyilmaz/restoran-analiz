"""AI analiz motoru — OpenRouter ücretsiz modeller ile çalışır."""
from openai import AsyncOpenAI, RateLimitError
import os
import json
import asyncio
from dotenv import load_dotenv
from datetime import datetime

load_dotenv(override=True)

client = AsyncOpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

# Ücretsiz modeller, sırayla denenir
FREE_MODELS = [
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-2-9b-it:free",
    "deepseek/deepseek-r1:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
]

ANALYZE_PROMPT = """Sen bir restoran danışmanısın. Aşağıdaki müşteri yorumlarını analiz et ve Türkçe yanıt ver.

Yorumlar:
{reviews}

Şu formatta JSON döndür, başka hiçbir şey yazma:
{{
  "genel_skor": 85,
  "toplam_yorum": 10,
  "ozet": "Genel değerlendirme özeti buraya",
  "duygu_dagilimi": {{
    "pozitif": 60,
    "notr": 20,
    "negatif": 20
  }},
  "kategoriler": {{
    "yemek":   {{"skor": 80, "yorum": "Kısa değerlendirme"}},
    "servis":  {{"skor": 75, "yorum": "Kısa değerlendirme"}},
    "fiyat":   {{"skor": 70, "yorum": "Kısa değerlendirme"}},
    "ambiyans":{{"skor": 85, "yorum": "Kısa değerlendirme"}}
  }},
  "guclu_yonler": ["madde 1", "madde 2", "madde 3"],
  "zayif_yonler": ["madde 1", "madde 2"],
  "aksiyon_onerileri": [
    {{"oncelik": "yuksek", "oneri": "Yapılması gereken şey", "etki": "Beklenen sonuç"}},
    {{"oncelik": "orta",   "oneri": "Yapılması gereken şey", "etki": "Beklenen sonuç"}},
    {{"oncelik": "dusuk",  "oneri": "Yapılması gereken şey", "etki": "Beklenen sonuç"}}
  ],
  "one_cikan_kelimeler": ["kelime1", "kelime2", "kelime3", "kelime4", "kelime5", "kelime6", "kelime7", "kelime8"]
}}"""

COMPARE_PROMPT = """İki farklı restoranın analizini karşılaştır ve hangisinin daha iyi olduğunu belirle.

Restoran A — {name_a}:
Genel Skor: {score_a}
Güçlü: {strong_a}
Zayıf: {weak_a}

Restoran B — {name_b}:
Genel Skor: {score_b}
Güçlü: {strong_b}
Zayıf: {weak_b}

Türkçe, 2-3 cümle ile karşılaştırma özeti yaz. Hangi restoran öne çıkıyor ve neden? Sadece metni döndür, JSON değil."""


def _parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        for part in parts[1:]:
            cleaned = part.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            if cleaned.startswith("{"):
                text = cleaned
                break
    start = text.find("{")
    end = text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]
    return json.loads(text)


async def _call_model(model: str, prompt: str) -> str:
    """Ham metin döndürür (JSON veya düz metin)."""
    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content


async def _call_with_fallback(prompt: str) -> str:
    """Tüm modelleri deneyerek ham metin döndürür."""
    last_error = None
    for model in FREE_MODELS:
        try:
            print(f"[analyzer] Model deneniyor: {model}")
            result = await _call_model(model, prompt)
            print(f"[analyzer] Başarılı: {model}")
            return result
        except RateLimitError as e:
            print(f"[analyzer] Rate limit ({model}): {e}")
            last_error = e
            await asyncio.sleep(1)
        except Exception as e:
            print(f"[analyzer] Hata ({model}): {e}")
            last_error = e

    raise Exception(f"Tüm modeller başarısız oldu. Son hata: {last_error}")


def _generate_trend_data(base_score: int) -> list[dict]:
    """Son 6 ay için simüle edilmiş trend verisi üretir."""
    import random
    months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
              "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    now = datetime.now()
    result = []
    score = max(50, base_score - random.randint(5, 15))
    for i in range(5, -1, -1):
        month_idx = (now.month - 1 - i) % 12
        score = min(100, max(40, score + random.randint(-5, 8)))
        result.append({
            "ay": months[month_idx],
            "skor": score,
            "yorum_sayisi": random.randint(5, 30),
        })
    # Son ay gerçek skoru yansıtsın
    result[-1]["skor"] = base_score
    return result


async def analyze_reviews(
    reviews: list[str],
    source_breakdown: list[dict] | None = None
) -> dict:
    """
    Args:
        reviews: Yorum metinleri listesi
        source_breakdown: [{"platform": "google", "count": 10}, ...]
    Returns:
        Tam analiz dict'i
    """
    reviews_text = "\n".join([f"{i+1}. {r}" for i, r in enumerate(reviews)])
    prompt = ANALYZE_PROMPT.format(reviews=reviews_text)

    raw = await _call_with_fallback(prompt)
    result = _parse_json(raw)

    # Kaynak dağılımı hesapla
    if source_breakdown:
        total = sum(s["count"] for s in source_breakdown)
        result["kaynak_dagilimi"] = [
            {
                "platform": s["platform"],
                "yorum_sayisi": s["count"],
                "yuzde": round(s["count"] / total * 100) if total else 0,
            }
            for s in source_breakdown
        ]
    else:
        result["kaynak_dagilimi"] = [
            {"platform": "manuel", "yorum_sayisi": len(reviews), "yuzde": 100}
        ]

    # Trend verisi
    result["trend_verisi"] = _generate_trend_data(result.get("genel_skor", 75))

    return result


async def generate_compare_summary(
    name_a: str, result_a: dict,
    name_b: str, result_b: dict
) -> str:
    """İki restoran analizi için karşılaştırma özeti üretir."""
    prompt = COMPARE_PROMPT.format(
        name_a=name_a,
        score_a=result_a.get("genel_skor", "?"),
        strong_a=", ".join(result_a.get("guclu_yonler", [])[:3]),
        weak_a=", ".join(result_a.get("zayif_yonler", [])[:2]),
        name_b=name_b,
        score_b=result_b.get("genel_skor", "?"),
        strong_b=", ".join(result_b.get("guclu_yonler", [])[:3]),
        weak_b=", ".join(result_b.get("zayif_yonler", [])[:2]),
    )
    try:
        return await _call_with_fallback(prompt)
    except Exception:
        score_a = result_a.get("genel_skor", 0)
        score_b = result_b.get("genel_skor", 0)
        if score_a > score_b:
            return f"{name_a}, {score_a} puanıyla {name_b}'ye göre öne çıkmaktadır."
        elif score_b > score_a:
            return f"{name_b}, {score_b} puanıyla {name_a}'ya göre öne çıkmaktadır."
        return f"Her iki restoran da eşit puanda ({score_a})."
