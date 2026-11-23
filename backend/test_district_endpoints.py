import asyncio
import httpx
from database import SessionLocal
from models.user import User
from routes.auth import create_access_token
from sqlalchemy import select

async def run_tests():
    async with SessionLocal() as session:
        # 1. Kohima Admin
        res = await session.execute(select(User).where(User.phone_number == "+919876598764"))
        admin1 = res.scalars().first()
        token1 = create_access_token({
            "id": str(admin1.id),
            "role": admin1.role,
            "phone_number": admin1.phone_number,
            "district_id": str(admin1.district_id)
        })

        # 2. Chumoukedima Admin
        res = await session.execute(select(User).where(User.phone_number == "+919876598765"))
        admin2 = res.scalars().first()
        token2 = create_access_token({
            "id": str(admin2.id),
            "role": admin2.role,
            "phone_number": admin2.phone_number,
            "district_id": str(admin2.district_id)
        })

        # 3. Citizen User (for 403 test)
        res = await session.execute(select(User).where(User.role == "citizen"))
        citizen = res.scalars().first()
        citizen_token = create_access_token({
            "id": str(citizen.id),
            "role": citizen.role,
            "phone_number": citizen.phone_number,
            "district_id": None
        }) if citizen else None

    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000", timeout=20.0) as client:
        # TEST 1: Kohima Overview
        r = await client.get("/district-admin/overview", headers={"Authorization": f"Bearer {token1}"})
        print(f"Overview status: {r.status_code}, text: {r.text}", flush=True)
        assert r.status_code == 200, f"Overview failed: {r.text}"
        d = r.json()
        print("TEST 1 (Kohima Overview): OK", flush=True)
        print(f"  District: {d['district']['district_name']}, Villages: {d['total_villages_count']}, Active Alerts: {d['active_risk_count']}", flush=True)
        print(f"  Breakdown: {d['risk_level_breakdown']}", flush=True)
        assert d["total_villages_count"] == 60
        assert "last_updated" in d and d["last_updated"] is not None

        # TEST 2: Kohima Villages list
        r = await client.get("/district-admin/villages", headers={"Authorization": f"Bearer {token1}"})
        assert r.status_code == 200, f"Villages failed: {r.text}"
        dv = r.json()
        print("TEST 2 (Kohima Villages): OK", flush=True)
        print(f"  Total villages returned: {dv['total_villages']}", flush=True)
        print(f"  Breakdown: {dv['breakdown']}", flush=True)
        assert len(dv["villages"]) == 60

        # TEST 3: Search filter
        r = await client.get("/district-admin/villages?search=Thizama", headers={"Authorization": f"Bearer {token1}"})
        assert r.status_code == 200
        d_search = r.json()
        print("TEST 3 (Search Filter): OK", flush=True)
        print(f"  Search 'Thizama' results count: {d_search['filtered_count']}", flush=True)
        assert d_search["filtered_count"] >= 1
        assert d_search["villages"][0]["name"] == "Thizama"

        # TEST 4: Chumoukedima Overview & Villages
        r = await client.get("/district-admin/overview", headers={"Authorization": f"Bearer {token2}"})
        assert r.status_code == 200
        d2 = r.json()
        print("TEST 4 (Chumoukedima Overview): OK", flush=True)
        print(f"  District: {d2['district']['district_name']}, Villages: {d2['total_villages_count']}", flush=True)
        assert d2["total_villages_count"] == 10

        # TEST 5: Security / 403 test for citizen
        if citizen_token:
            r = await client.get("/district-admin/villages", headers={"Authorization": f"Bearer {citizen_token}"})
            assert r.status_code == 403
            print("TEST 5 (Citizen 403 Forbidden): OK", flush=True)

    print("\nALL AUTOMATED TESTS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    asyncio.run(run_tests())
