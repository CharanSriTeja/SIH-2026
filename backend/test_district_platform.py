import asyncio
import io
import uuid
import requests
from httpx import AsyncClient, ASGITransport

from main import app
from database import SessionLocal
from models.user import User
from models.district import District
from models.report import CitizenReport
from services.auth_service import get_password_hash, create_access_token
from sqlalchemy import select

async def run_tests():
    print("=" * 70)
    print("Testing District Admin & Scoped Hazard Reporting Platform")
    print("=" * 70)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test GET /reference/states-districts
        ref_res = await client.get("/reference/states-districts")
        print("\n1. GET /reference/states-districts ->", ref_res.status_code)
        assert ref_res.status_code == 200, f"Expected 200, got {ref_res.status_code}"
        ref_data = ref_res.json()
        print(f"   States ({len(ref_data['states'])}):", ref_data['states'])
        print(f"   Total Districts:", len(ref_data['all_districts']))
        assert "Meghalaya" in ref_data["districts_by_state"]
        assert "East Khasi Hills" in ref_data["districts_by_state"]["Meghalaya"]

        # 2. Setup Super Admin User in Database
        async with SessionLocal() as session:
            admin_stmt = select(User).where(User.phone_number == "+919999999999")
            res = await session.execute(admin_stmt)
            admin_user = res.scalars().first()
            if not admin_user:
                admin_user = User(
                    name="Super Administrator",
                    phone_number="+919999999999",
                    password_hash=get_password_hash("AdminPass123!"),
                    role="admin",
                    is_verified=True
                )
                session.add(admin_user)
                await session.commit()
                await session.refresh(admin_user)

            admin_token = create_access_token({"id": str(admin_user.id), "role": "admin", "phone_number": admin_user.phone_number})

        # 3. Test POST /admin/district-admins
        test_da_phone = "+919876543219"
        # Cleanup if existed
        async with SessionLocal() as session:
            old_u = (await session.execute(select(User).where(User.phone_number == test_da_phone))).scalars().first()
            if old_u:
                await session.delete(old_u)
                await session.commit()

        da_payload = {
            "name": "District Officer Shillong",
            "phone_number": test_da_phone,
            "password": "SecurePassword1",
            "state_name": "Meghalaya",
            "district_name": "East Khasi Hills"
        }
        create_da_res = await client.post(
            "/admin/district-admins",
            json=da_payload,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print("\n2. POST /admin/district-admins ->", create_da_res.status_code)
        assert create_da_res.status_code == 201, f"Expected 201, got {create_da_res.status_code}: {create_da_res.text}"
        created_da = create_da_res.json()["user"]
        print("   Created District Admin:", created_da["name"], "| District:", created_da["district_name"], "| ID:", created_da["district_id"])
        da_id = created_da["id"]
        assigned_district_id = created_da["district_id"]

        # 4. Test GET /admin/district-admins
        list_da_res = await client.get(
            "/admin/district-admins",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print("\n3. GET /admin/district-admins ->", list_da_res.status_code)
        assert list_da_res.status_code == 200
        da_list = list_da_res.json()
        print(f"   Found {len(da_list)} District Admin(s)")
        assert any(d["phone_number"] == test_da_phone for d in da_list)

        # 5. Test Login as District Admin
        login_res = await client.post("/auth/login", json={"phone_number": test_da_phone, "password": "SecurePassword1"})
        print("\n4. POST /auth/login (District Admin) ->", login_res.status_code)
        assert login_res.status_code == 200
        da_token = login_res.json()["access_token"]
        
        # Verify /auth/me returns district_id
        me_res = await client.get("/auth/me", headers={"Authorization": f"Bearer {da_token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        print("   /auth/me role:", me_data["role"], "| district_id:", me_data["district_id"])
        assert me_data["role"] == "district_admin"
        assert me_data["district_id"] == assigned_district_id

        # 6. Test Citizen Hazard Report Submission (POST /reports)
        # Create a citizen user
        citizen_phone = "+919876543218"
        async with SessionLocal() as session:
            c_user = (await session.execute(select(User).where(User.phone_number == citizen_phone))).scalars().first()
            if not c_user:
                c_user = User(
                    name="Test Citizen",
                    phone_number=citizen_phone,
                    password_hash=get_password_hash("CitizenPass1"),
                    role="citizen",
                    is_verified=True
                )
                session.add(c_user)
                await session.commit()
                await session.refresh(c_user)
            citizen_token = create_access_token({"id": str(c_user.id), "role": "citizen", "phone_number": c_user.phone_number})

        # Coordinates near Shillong (East Khasi Hills): lat 25.5788, lon 91.8933
        # Dummy JPEG bytes (FF D8 FF E0 ...)
        dummy_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"
        
        files = {"photo": ("tension_crack.jpg", dummy_jpeg, "image/jpeg")}
        form_data = {
            "latitude": "25.5788",
            "longitude": "91.8933",
            "hazard_type": "Ground Crack",
            "description": "Visible tension crack along hillside road embankment."
        }
        rep_res = await client.post(
            "/reports",
            data=form_data,
            files=files,
            headers={"Authorization": f"Bearer {citizen_token}"}
        )
        print("\n5. POST /reports (Citizen submission) ->", rep_res.status_code)
        assert rep_res.status_code == 201, f"Expected 201, got {rep_res.status_code}: {rep_res.text}"
        rep_json = rep_res.json()
        print("   Report ID:", rep_json["report_id"])
        print("   Assigned District:", rep_json["district"]["district_name"], f"({rep_json['district']['state_name']})")
        assert rep_json["district"]["id"] == assigned_district_id
        report_id = rep_json["report_id"]

        # 7. Test GET /reports/mine (Citizen)
        my_rep_res = await client.get("/reports/mine", headers={"Authorization": f"Bearer {citizen_token}"})
        print("\n6. GET /reports/mine ->", my_rep_res.status_code)
        assert my_rep_res.status_code == 200
        my_reps = my_rep_res.json()
        print(f"   Citizen has {len(my_reps)} report(s)")
        assert any(r["id"] == report_id for r in my_reps)

        # 8. Test GET /district-admin/reports (District Admin Scoped Query)
        da_reps_res = await client.get(
            "/district-admin/reports",
            headers={"Authorization": f"Bearer {da_token}"}
        )
        print("\n7. GET /district-admin/reports ->", da_reps_res.status_code)
        assert da_reps_res.status_code == 200
        da_reps_json = da_reps_res.json()
        print(f"   District Admin sees {da_reps_json['total_reports']} report(s) for {da_reps_json['district']['district_name']}")
        matching = [r for r in da_reps_json["reports"] if r["id"] == report_id]
        assert len(matching) == 1
        photo_url = matching[0]["photo_url"]
        print("   Report Photo URL:", photo_url)

        # 9. Test Access-Controlled Image Serving (GET /uploads/citizen_reports/...)
        img_res = await client.get(photo_url, headers={"Authorization": f"Bearer {da_token}"})
        print("\n8. GET photo URL (District Admin auth) ->", img_res.status_code)
        assert img_res.status_code == 200
        assert img_res.headers["content-type"] in ["image/jpeg", "image/jpg"]

        # Unauthorized user should be rejected (403 or 401)
        unauth_img_res = await client.get(photo_url)
        print("   GET photo URL (Unauthenticated) ->", unauth_img_res.status_code)
        assert unauth_img_res.status_code == 401

        # 10. Test PATCH /district-admin/reports/{id}
        patch_res = await client.patch(
            f"/district-admin/reports/{report_id}",
            json={"status": "verified"},
            headers={"Authorization": f"Bearer {da_token}"}
        )
        print("\n9. PATCH /district-admin/reports/{id} ->", patch_res.status_code)
        assert patch_res.status_code == 200
        patch_json = patch_res.json()
        print("   Updated status:", patch_json["status"], "| Reviewed at:", patch_json["reviewed_at"])
        assert patch_json["status"] == "verified"

        # 11. Test DELETE /admin/district-admins/{id}
        del_res = await client.delete(
            f"/admin/district-admins/{da_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        print("\n10. DELETE /admin/district-admins/{id} ->", del_res.status_code)
        assert del_res.status_code == 200
        print("    Message:", del_res.json()["message"])

    print("\n" + "=" * 70)
    print("ALL BACKEND & PLATFORM TESTS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_tests())
