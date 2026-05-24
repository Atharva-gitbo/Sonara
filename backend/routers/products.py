from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime
from typing import Optional

from database import get_db
from auth import get_current_user, require_admin
from models.product import ProductCreate, ProductUpdate, ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])


def _product_out(p: dict) -> ProductOut:
    return ProductOut(
        id=str(p["_id"]),
        name=p["name"],
        description=p["description"],
        price=p["price"],
        stock=p["stock"],
        category=p["category"],
        image_url=p.get("image_url", ""),
        created_at=p["created_at"],
    )


@router.get("/", response_model=list[ProductOut])
async def list_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
):
    db = get_db()
    query: dict = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}

    products = await db.products.find(query).sort("created_at", -1).to_list(None)
    return [_product_out(p) for p in products]


@router.get("/categories", response_model=list[str])
async def get_categories():
    db = get_db()
    categories = await db.products.distinct("category")
    return sorted(categories)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    db = get_db()
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(404, "Product not found")
    return _product_out(product)


@router.post("/", response_model=ProductOut, status_code=201)
async def create_product(body: ProductCreate, admin=Depends(require_admin)):
    db = get_db()
    doc = {**body.model_dump(), "created_at": datetime.utcnow()}
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _product_out(doc)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, body: ProductUpdate, admin=Depends(require_admin)):
    db = get_db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "Nothing to update")
    result = await db.products.update_one({"_id": ObjectId(product_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "Product not found")
    updated = await db.products.find_one({"_id": ObjectId(product_id)})
    return _product_out(updated)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str, admin=Depends(require_admin)):
    db = get_db()
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    await db.cart.delete_many({"product_id": product_id})
