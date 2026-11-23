import asyncio
import os
import re
import sys
from pathlib import Path

from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from database import SessionLocal
from models.district import District
from models.user import User
from services.auth_service import get_password_hash
from utils.validation import validate_indian_phone_number


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"{name} must be set in the environment.")
    return value


def validate_password(password: str, env_name: str) -> None:
    if len(password) < 8 or not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        raise ValueError(f"{env_name} must be at least 8 characters and contain letters and numbers.")


async def provision_account(
    session,
    *,
    name: str,
    phone: str,
    password: str,
    role: str,
    district_id=None,
) -> None:
    result = await session.execute(select(User).where(User.phone_number == phone))
    user = result.scalars().first()
    if user and user.role != role:
        raise ValueError(f"{phone} already belongs to a different role.")

    if user is None:
        user = User(phone_number=phone)
        session.add(user)

    user.name = name
    user.password_hash = get_password_hash(password)
    user.role = role
    user.is_verified = True
    if role == "district_admin":
        user.district_id = district_id


async def main() -> None:
    citizen_phone = validate_indian_phone_number(required_env("CITIZEN_PHONE"))
    citizen_password = required_env("CITIZEN_PASSWORD")
    district_admin_phone = validate_indian_phone_number(required_env("DISTRICT_ADMIN_PHONE"))
    district_admin_password = required_env("DISTRICT_ADMIN_PASSWORD")
    admin_phone = validate_indian_phone_number(required_env("ADMIN_PHONE"))
    admin_password = required_env("ADMIN_PASSWORD")

    passwords = (
        ("CITIZEN_PASSWORD", citizen_password),
        ("DISTRICT_ADMIN_PASSWORD", district_admin_password),
        ("ADMIN_PASSWORD", admin_password),
    )
    for env_name, password in passwords:
        validate_password(password, env_name)

    if len({citizen_phone, district_admin_phone, admin_phone}) != 3:
        raise ValueError("Citizen, district-admin, and admin phone numbers must be different.")

    state_name = os.getenv("DISTRICT_STATE", "Mizoram").strip()
    district_name = os.getenv("DISTRICT_NAME", "Aizawl").strip()

    async with SessionLocal() as session:
        district_result = await session.execute(
            select(District).where(
                District.state_name == state_name,
                District.district_name == district_name,
            )
        )
        district = district_result.scalars().first()
        if district is None:
            raise ValueError(f"District '{district_name}' in '{state_name}' was not found.")

        await provision_account(
            session,
            name="Citizen User",
            phone=citizen_phone,
            password=citizen_password,
            role="citizen",
        )
        await provision_account(
            session,
            name="District Administrator",
            phone=district_admin_phone,
            password=district_admin_password,
            role="district_admin",
            district_id=district.id,
        )
        await provision_account(
            session,
            name="System Administrator",
            phone=admin_phone,
            password=admin_password,
            role="admin",
        )
        await session.commit()

    print(f"Provisioned citizen, district_admin ({state_name} / {district_name}), and admin accounts.")


if __name__ == "__main__":
    asyncio.run(main())
