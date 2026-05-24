import os
import httpx
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional

from auth import require_admin
from database import get_db

router = APIRouter(prefix="/api/reverb", tags=["reverb"])

REVERB_BASE = "https://api.reverb.com/api"


def _headers():
    key = os.getenv("REVERB_API_KEY", "")
    if not key or key == "your_reverb_api_key_here":
        raise HTTPException(503, "REVERB_API_KEY not configured in .env")
    return {
        "Authorization": f"Bearer {key}",
        "Accept-Version": "3.0",
        "Content-Type": "application/hal+json",
    }


def _map_listing(item: dict) -> dict:
    price_raw = item.get("price", {})
    try:
        price = float(price_raw.get("amount", 0))
    except (TypeError, ValueError):
        price = 0.0

    photos = item.get("photos", [])
    image_url = ""
    if photos:
        image_url = (
            photos[0].get("_links", {}).get("large_crop", {}).get("href", "")
            or photos[0].get("_links", {}).get("full", {}).get("href", "")
        )

    categories = item.get("categories", [])
    category = categories[0].get("full_name", "Guitars") if categories else "Guitars"

    return {
        "name": item.get("title", "Unknown"),
        "description": item.get("description") or item.get("title", ""),
        "price": price,
        "stock": item.get("inventory", 1),
        "category": category,
        "image_url": image_url,
    }


@router.get("/search")
async def search_reverb(
    q: Optional[str] = Query("guitar"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{REVERB_BASE}/listings",
            headers=_headers(),
            params={"query": q, "page": page, "per_page": per_page},
        )
    if resp.status_code != 200:
        raise HTTPException(resp.status_code, f"Reverb API error: {resp.text[:200]}")

    data = resp.json()
    listings = data.get("listings", [])
    return {
        "total": data.get("total", len(listings)),
        "listings": [_map_listing(l) for l in listings],
    }


import re as _re

def _strip_html(text: str) -> str:
    return _re.sub(r'<[^>]+>', '', text or '').strip()


@router.post("/import", status_code=201)
async def import_from_reverb(
    q: str = Query("guitar"),
    per_page: int = Query(20, ge=1, le=50),
    admin=Depends(require_admin),
):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{REVERB_BASE}/listings",
            headers=_headers(),
            params={"query": q, "per_page": per_page},
        )
    if resp.status_code != 200:
        raise HTTPException(resp.status_code, f"Reverb API error: {resp.text[:200]}")

    db = get_db()
    await db.products.delete_many({})

    listings = resp.json().get("listings", [])
    now = datetime.utcnow()
    docs = []
    for item in listings:
        mapped = _map_listing(item)
        mapped["description"] = _strip_html(mapped["description"])
        mapped["created_at"] = now
        docs.append(mapped)

    if docs:
        await db.products.insert_many(docs)

    return {"inserted": len(docs), "skipped": 0}
