# Author: Kunj Vania
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = client[os.getenv("DB_NAME", "shopdb")]
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.products.create_index("name")
    await db.products.create_index("category")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
