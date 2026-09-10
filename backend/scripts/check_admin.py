import asyncio
from database import SessionLocal
from models.user import User
from sqlalchemy import select
from services.auth_service import get_password_hash

async def check_or_create_admin():
    async with SessionLocal() as session:
        # Check existing admins
        stmt = select(User).where(User.role == "admin")
        result = await session.execute(stmt)
        admins = result.scalars().all()
        
        print("Existing Admins in Database:")
        for a in admins:
            print(f"- ID: {a.id} | Name: {a.name} | Phone: {a.phone_number} | Role: {a.role} | Verified: {a.is_verified}")
        
        # Also ensure the primary main admin exists
        main_phone = "+919999999999"
        main_admin = (await session.execute(select(User).where(User.phone_number == main_phone))).scalars().first()
        if not main_admin:
            print(f"Main admin {main_phone} not found. Creating...")
            main_admin = User(
                name="Super Administrator",
                phone_number=main_phone,
                password_hash=get_password_hash("AdminPass123!"),
                role="admin",
                is_verified=True
            )
            session.add(main_admin)
            await session.commit()
            print("Successfully created Super Administrator in PostgreSQL!")
        else:
            print(f"Verified: Main admin {main_phone} is active and ready.")

if __name__ == "__main__":
    asyncio.run(check_or_create_admin())
