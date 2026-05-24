# Author: Kunj Vania
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
    {
        "name": "Fender Player Stratocaster",
        "description": "Iconic SSS Stratocaster with Player Series pickups, maple neck, and a smooth 9.5\" radius fretboard. Versatile tones from clean sparkle to biting overdrive.",
        "price": 849.99, "stock": 12, "category": "Electric Guitars",
        "image_url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
    },
    {
        "name": "Gibson Les Paul Standard",
        "description": "The quintessential rock guitar. Mahogany body with maple top, BurstBucker Pro humbuckers, and a beautiful AAA flame maple veneer.",
        "price": 2499.99, "stock": 6, "category": "Electric Guitars",
        "image_url": "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400",
    },
    {
        "name": "Taylor 214ce",
        "description": "Grand Auditorium acoustic-electric with Sitka spruce top and layered rosewood back and sides. ES2 pickup system for warm, natural amplified sound.",
        "price": 1199.99, "stock": 8, "category": "Acoustic Guitars",
        "image_url": "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400",
    },
    {
        "name": "Martin D-28",
        "description": "The benchmark dreadnought. Solid Sitka spruce top, East Indian rosewood back and sides, and forward-shifted scalloped X-bracing for legendary projection.",
        "price": 3099.99, "stock": 4, "category": "Acoustic Guitars",
        "image_url": "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400",
    },
    {
        "name": "Boss DS-1 Distortion Pedal",
        "description": "The world's most popular distortion pedal. Aggressive, hard-edged distortion suitable for everything from blues to heavy metal.",
        "price": 59.99, "stock": 35, "category": "Pedals & Effects",
        "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    },
    {
        "name": "Electro-Harmonix Big Muff Pi",
        "description": "Legendary fuzz/sustain pedal used by countless iconic guitarists. Produces a rich, harmonically complex fuzz tone with long, creamy sustain.",
        "price": 89.99, "stock": 20, "category": "Pedals & Effects",
        "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    },
    {
        "name": "Fender Blues Junior IV",
        "description": "15-watt all-tube combo amp with 12\" Celestion speaker. Classic American clean tones that break up beautifully when pushed.",
        "price": 699.99, "stock": 10, "category": "Amplifiers",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    },
    {
        "name": "D'Addario EXL110 String Set",
        "description": "Nickel wound electric guitar strings, Regular Light gauge (.010-.046). Balanced tone, comfortable feel, and long-lasting performance.",
        "price": 9.99, "stock": 200, "category": "Accessories",
        "image_url": "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400",
    },
    {
        "name": "Ernie Ball Earthwood 80/20",
        "description": "Bronze wound acoustic strings, Medium Light (.012-.054). Crisp, bright tone that opens up the natural resonance of any acoustic guitar.",
        "price": 8.99, "stock": 200, "category": "Accessories",
        "image_url": "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400",
    },
    {
        "name": "Squier Classic Vibe '50s Telecaster",
        "description": "Faithful recreation of a '50s Tele with an alnico single-coil in the neck and a vintage-style bridge pickup. Pure twang at an approachable price.",
        "price": 499.99, "stock": 15, "category": "Electric Guitars",
        "image_url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400",
    },
]


async def seed():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "shopdb")]

    await db.products.delete_many({})
    now = datetime.utcnow()
    await db.products.insert_many([{**p, "created_at": now} for p in PRODUCTS])
    print(f"Inserted {len(PRODUCTS)} products")

    admin_email = os.getenv("ADMIN_EMAIL", "admin@sonara.com")
    admin_password = os.getenv("ADMIN_PASSWORD")
    if not admin_password:
        raise RuntimeError("ADMIN_PASSWORD environment variable is required — set it in backend/.env")

    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "username": "admin",
            "email": admin_email,
            "password_hash": pwd_context.hash(admin_password),
            "role": "admin",
            "created_at": now,
        })
        print(f"Admin user created: {admin_email}")
    else:
        print("Admin user already exists")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
