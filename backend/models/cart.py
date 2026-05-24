from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemOut(BaseModel):
    id: str
    product_id: str
    product_name: str
    product_price: float
    product_image: str
    quantity: int
    subtotal: float
    added_at: datetime


class CartSummary(BaseModel):
    user_id: str
    username: str
    email: str
    items: list[CartItemOut]
    total: float
