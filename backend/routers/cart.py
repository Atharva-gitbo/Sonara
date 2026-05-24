# Author: Kunj Vania
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId, errors as bson_errors
from datetime import datetime

from database import get_db
from auth import get_current_user, require_admin
from models.cart import CartItemAdd, CartItemUpdate, CartItemOut, CartSummary

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _to_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except (bson_errors.InvalidId, TypeError):
        raise HTTPException(400, "Invalid ID format")


# ── Admin (must be before /{item_id} to avoid route conflict) ─────────────────

@router.get("/all", response_model=list[CartSummary])
async def get_all_carts(admin=Depends(require_admin)):
    db = get_db()
    users = await db.users.find().to_list(None)
    result = []
    for user in users:
        items = await db.cart.find({"user_id": str(user["_id"])}).to_list(None)
        if not items:
            continue
        enriched, total = await _enrich_items(db, items)
        result.append(CartSummary(
            user_id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            items=enriched,
            total=round(total, 2),
        ))
    return result


async def _enrich_items(db, items: list) -> tuple[list[CartItemOut], float]:
    enriched = []
    total = 0.0
    for item in items:
        product = await db.products.find_one({"_id": _to_object_id(item["product_id"])})
        if not product:
            continue
        subtotal = product["price"] * item["quantity"]
        total += subtotal
        enriched.append(CartItemOut(
            id=str(item["_id"]),
            product_id=item["product_id"],
            product_name=product["name"],
            product_price=product["price"],
            product_image=product.get("image_url", ""),
            quantity=item["quantity"],
            subtotal=subtotal,
            added_at=item["added_at"],
        ))
    return enriched, total


@router.get("/", response_model=dict)
async def get_my_cart(current_user=Depends(get_current_user)):
    db = get_db()
    items = await db.cart.find({"user_id": str(current_user["_id"])}).to_list(None)
    enriched, total = await _enrich_items(db, items)
    return {"items": [i.model_dump() for i in enriched], "total": round(total, 2)}


@router.post("/", response_model=CartItemOut, status_code=201)
async def add_to_cart(body: CartItemAdd, current_user=Depends(get_current_user)):
    db = get_db()
    product = await db.products.find_one({"_id": _to_object_id(body.product_id)})
    if not product:
        raise HTTPException(404, "Product not found")
    if product["stock"] < body.quantity:
        raise HTTPException(400, f"Only {product['stock']} in stock")

    existing = await db.cart.find_one({
        "user_id": str(current_user["_id"]),
        "product_id": body.product_id,
    })

    if existing:
        new_qty = existing["quantity"] + body.quantity
        if product["stock"] < new_qty:
            raise HTTPException(400, f"Only {product['stock']} in stock")
        await db.cart.update_one({"_id": existing["_id"]}, {"$set": {"quantity": new_qty}})
        updated = await db.cart.find_one({"_id": existing["_id"]})
    else:
        doc = {
            "user_id": str(current_user["_id"]),
            "product_id": body.product_id,
            "quantity": body.quantity,
            "added_at": datetime.utcnow(),
        }
        result = await db.cart.insert_one(doc)
        updated = await db.cart.find_one({"_id": result.inserted_id})

    subtotal = product["price"] * updated["quantity"]
    return CartItemOut(
        id=str(updated["_id"]),
        product_id=updated["product_id"],
        product_name=product["name"],
        product_price=product["price"],
        product_image=product.get("image_url", ""),
        quantity=updated["quantity"],
        subtotal=subtotal,
        added_at=updated["added_at"],
    )


@router.put("/{item_id}", response_model=CartItemOut)
async def update_cart_item(item_id: str, body: CartItemUpdate, current_user=Depends(get_current_user)):
    db = get_db()
    oid = _to_object_id(item_id)
    item = await db.cart.find_one({"_id": oid, "user_id": str(current_user["_id"])})
    if not item:
        raise HTTPException(404, "Cart item not found")

    product = await db.products.find_one({"_id": _to_object_id(item["product_id"])})
    if not product:
        raise HTTPException(404, "Product no longer available")
    if product["stock"] < body.quantity:
        raise HTTPException(400, f"Only {product['stock']} in stock")

    await db.cart.update_one({"_id": oid}, {"$set": {"quantity": body.quantity}})
    subtotal = product["price"] * body.quantity
    return CartItemOut(
        id=item_id,
        product_id=item["product_id"],
        product_name=product["name"],
        product_price=product["price"],
        product_image=product.get("image_url", ""),
        quantity=body.quantity,
        subtotal=subtotal,
        added_at=item["added_at"],
    )


@router.delete("/{item_id}", status_code=204)
async def remove_cart_item(item_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = await db.cart.delete_one({"_id": _to_object_id(item_id), "user_id": str(current_user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(404, "Cart item not found")


@router.delete("/", status_code=204)
async def clear_cart(current_user=Depends(get_current_user)):
    db = get_db()
    await db.cart.delete_many({"user_id": str(current_user["_id"])})
