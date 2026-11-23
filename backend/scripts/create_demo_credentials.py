import asyncio
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from database import SessionLocal
from models.user import User
from models.district import District
from sqlalchemy import select
from services.auth_service import get_password_hash, verify_password
from utils.validation import validate_indian_phone_number

USERS_TO_PROVISION = [
    {
        "role": "citizen",
        "name": "Citizen User",
        "phone": "9876543210",
        "password": "Citizen@123",
        "district_required": False
    },
    {
        "role": "district_admin",
        "name": "District Admin (Aizawl)",
        "phone": "9876543211",
        "password": "DistAdmin@123",
        "district_required": True,
        "state_name": "Mizoram",
        "district_name": "Aizawl"
    },
    {
        "role": "admin",
        "name": "Super Admin",
        "phone": "9999999999",
        "password": "SuperAdmin@123",
        "district_required": False
    },
    # Also provide 9876543212 as an alternative sequential super admin
    {
        "role": "admin",
        "name": "Super Admin 2",
        "phone": "9876543212",
        "password": "SuperAdmin@123",
        "district_required": False
    }
]

async def provision_users():
    async with SessionLocal() as session:
        # Fetch Aizawl district
        dist_res = await session.execute(
            select(District).where(
                District.district_name.ilike("%Aizawl%"),
                District.state_name.ilike("%Mizoram%")
            )
        )
        aizawl_district = dist_res.scalars().first()
        if not aizawl_district:
            print("Warning: Aizawl district not found. Fetching any district...")
            any_dist = (await session.execute(select(District))).scalars().first()
            district_id = any_dist.id if any_dist else None
        else:
            district_id = aizawl_district.id
            print(f"Using District: {aizawl_district.district_name}, {aizawl_district.state_name} ({district_id})")

        provisioned_summary = []

        for item in USERS_TO_PROVISION:
            canonical_phone = validate_indian_phone_number(item["phone"])
            query = await session.execute(select(User).where(User.phone_number == canonical_phone))
            user = query.scalars().first()

            if user is None:
                user = User(phone_number=canonical_phone)
                session.add(user)
                action = "Created"
            else:
                action = "Updated"

            user.name = item["name"]
            user.role = item["role"]
            user.password_hash = get_password_hash(item["password"])
            user.is_verified = True
            
            if item["district_required"]:
                user.district_id = district_id
            else:
                user.district_id = None

            provisioned_summary.append({
                "action": action,
                "role": user.role,
                "name": user.name,
                "phone_input": item["phone"],
                "canonical_phone": canonical_phone,
                "password": item["password"],
                "district_id": str(user.district_id) if user.district_id else "None"
            })

        await session.commit()
        print("\nProvisioning completed successfully!")
        print("=" * 80)
        for u in provisioned_summary:
            print(f"[{u['action']}] Role: {u['role']:15} | Name: {u['name']:25} | Phone: {u['phone_input']} ({u['canonical_phone']}) | Pass: {u['password']} | District ID: {u['district_id']}")
        print("=" * 80)

        # Verification check
        print("\nVerifying database hashes and passwords:")
        for item in USERS_TO_PROVISION:
            canonical_phone = validate_indian_phone_number(item["phone"])
            user = (await session.execute(select(User).where(User.phone_number == canonical_phone))).scalars().first()
            assert user is not None, f"User {canonical_phone} not found!"
            assert user.is_verified is True, f"User {canonical_phone} not verified!"
            assert verify_password(item["password"], user.password_hash), f"Password check failed for {canonical_phone}!"
            print(f"PASS: {user.role:15} | {user.phone_number:15} | verified={user.is_verified} | password verified!")

if __name__ == "__main__":
    asyncio.run(provision_users())

