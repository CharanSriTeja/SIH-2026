import os
import urllib.parse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("WARNING: DATABASE_URL not set in environment variables.")
    # Provide a dummy URL for offline schema generation if needed
    DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/dbname"

# Ensure asyncpg driver is specified for create_async_engine
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if "sslmode=" in DATABASE_URL or "channel_binding=" in DATABASE_URL or "neon.tech" in DATABASE_URL:
    parsed = urllib.parse.urlsplit(DATABASE_URL)
    DATABASE_URL = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
    connect_args["ssl"] = True

engine = create_async_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session

