"""Run once to populate the database with sample products and an admin user."""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PRODUCTS = [
    {"name": "Wireless Headphones", "description": "Premium noise-cancelling headphones with 30hr battery life.", "price": 149.99, "stock": 25, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"},
    {"name": "Mechanical Keyboard", "description": "Compact TKL mechanical keyboard with Cherry MX Blue switches.", "price": 89.99, "stock": 40, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"},
    {"name": "Running Shoes", "description": "Lightweight trail running shoes with superior grip.", "price": 119.99, "stock": 60, "category": "Sports", "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"},
    {"name": "Yoga Mat", "description": "Non-slip eco-friendly yoga mat, 6mm thickness.", "price": 34.99, "stock": 80, "category": "Sports", "image_url": "https://images.unsplash.com/photo-1601925228440-0f6f4e6e3ba3?w=400"},
    {"name": "Coffee Maker", "description": "12-cup programmable drip coffee maker with built-in grinder.", "price": 79.99, "stock": 30, "category": "Kitchen", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"},
    {"name": "Stainless Steel Bottle", "description": "Insulated 1L water bottle, keeps drinks cold 24hrs.", "price": 29.99, "stock": 100, "category": "Kitchen", "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"},
    {"name": "Desk Lamp", "description": "LED desk lamp with adjustable brightness and color temperature.", "price": 44.99, "stock": 50, "category": "Home", "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"},
    {"name": "Novel: The Midnight Library", "description": "A bestselling novel about life's infinite possibilities.", "price": 14.99, "stock": 200, "category": "Books", "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"},
]


async def seed():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "shopdb")]

    await db.products.delete_many({})
    now = datetime.utcnow()
    await db.products.insert_many([{**p, "created_at": now} for p in PRODUCTS])
    print(f"Inserted {len(PRODUCTS)} products")

    existing = await db.users.find_one({"email": "admin@shop.com"})
    if not existing:
        await db.users.insert_one({
            "username": "admin",
            "email": "admin@shop.com",
            "password_hash": pwd_context.hash("Ravi123"),
            "role": "admin",
            "created_at": now,
        })
        print("Admin user created: admin@shop.com / Ravi123")
    else:
        print("Admin user already exists")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
