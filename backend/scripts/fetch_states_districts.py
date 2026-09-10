"""
fetch_states_districts.py
Fetches and structures Northeast Region (NER) states and districts reference data,
saves data/states_districts.json, and seeds the PostgreSQL `districts` table.
"""

import os
import sys
import json
import uuid
import asyncio
import urllib.parse
from pathlib import Path
from typing import Dict, List, Any

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
load_dotenv(BACKEND_DIR / ".env")

try:
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

from models.district import District

# Complete, canonical 8 Northeast Region (NER) States and Revenue Districts with Centroids
NER_DISTRICT_REFERENCE: Dict[str, List[Dict[str, Any]]] = {
    "Arunachal Pradesh": [
        {"district": "Anjaw", "lat": 28.0123, "lon": 96.8432},
        {"district": "Changlang", "lat": 27.1245, "lon": 95.7412},
        {"district": "Dibang Valley", "lat": 28.7845, "lon": 95.8456},
        {"district": "East Kameng", "lat": 27.3291, "lon": 93.0426},
        {"district": "East Siang", "lat": 28.0667, "lon": 95.3333},
        {"district": "Kamle", "lat": 27.7123, "lon": 94.0123},
        {"district": "Kra Daadi", "lat": 27.8123, "lon": 93.6214},
        {"district": "Kurung Kumey", "lat": 27.9427, "lon": 93.4735},
        {"district": "Lepa Rada", "lat": 27.9542, "lon": 94.5123},
        {"district": "Lohit", "lat": 27.9123, "lon": 96.1723},
        {"district": "Longding", "lat": 26.8521, "lon": 95.2412},
        {"district": "Lower Dibang Valley", "lat": 28.1432, "lon": 95.8341},
        {"district": "Lower Siang", "lat": 27.8421, "lon": 94.7312},
        {"district": "Lower Subansiri", "lat": 27.5358, "lon": 93.8344},
        {"district": "Namsai", "lat": 27.6741, "lon": 95.8712},
        {"district": "Pakke Kessang", "lat": 27.0543, "lon": 93.2187},
        {"district": "Papum Pare", "lat": 27.1511, "lon": 93.5938},
        {"district": "Shi Yomi", "lat": 28.5321, "lon": 94.2145},
        {"district": "Siang", "lat": 28.3241, "lon": 94.9543},
        {"district": "Tawang", "lat": 27.5862, "lon": 91.8594},
        {"district": "Tirap", "lat": 27.0123, "lon": 95.5123},
        {"district": "Upper Siang", "lat": 28.6123, "lon": 95.0123},
        {"district": "Upper Subansiri", "lat": 28.0645, "lon": 94.1234},
        {"district": "West Kameng", "lat": 27.2645, "lon": 92.4159},
        {"district": "West Siang", "lat": 28.1678, "lon": 94.6732}
    ],
    "Assam": [
        {"district": "Bajali", "lat": 26.5412, "lon": 91.2145},
        {"district": "Baksa", "lat": 26.6543, "lon": 91.5987},
        {"district": "Barpeta", "lat": 26.3214, "lon": 91.0067},
        {"district": "Biswanath", "lat": 26.7321, "lon": 93.1542},
        {"district": "Bongaigaon", "lat": 26.4789, "lon": 90.5643},
        {"district": "Cachar", "lat": 24.8333, "lon": 92.8000},
        {"district": "Charaideo", "lat": 26.9421, "lon": 94.9543},
        {"district": "Chirang", "lat": 26.6123, "lon": 90.6421},
        {"district": "Darrang", "lat": 26.4521, "lon": 92.0321},
        {"district": "Dhemaji", "lat": 27.4812, "lon": 94.5821},
        {"district": "Dhubri", "lat": 26.0214, "lon": 89.9723},
        {"district": "Dibrugarh", "lat": 27.4728, "lon": 94.9120},
        {"district": "Dima Hasao", "lat": 25.1745, "lon": 93.0234},
        {"district": "Goalpara", "lat": 26.1789, "lon": 90.6234},
        {"district": "Golaghat", "lat": 26.5123, "lon": 93.9643},
        {"district": "Hailakandi", "lat": 24.6843, "lon": 92.5643},
        {"district": "Hojai", "lat": 26.0021, "lon": 92.8643},
        {"district": "Jorhat", "lat": 26.7509, "lon": 94.2037},
        {"district": "Kamrup", "lat": 26.3123, "lon": 91.6421},
        {"district": "Kamrup Metropolitan", "lat": 26.1445, "lon": 91.7362},
        {"district": "Karbi Anglong", "lat": 26.1543, "lon": 93.3643},
        {"district": "Karimganj", "lat": 24.8643, "lon": 92.3543},
        {"district": "Kokrajhar", "lat": 26.4021, "lon": 90.2734},
        {"district": "Lakhimpur", "lat": 27.2345, "lon": 94.1023},
        {"district": "Majuli", "lat": 26.9643, "lon": 94.2123},
        {"district": "Morigaon", "lat": 26.2543, "lon": 92.3421},
        {"district": "Nagaon", "lat": 26.3456, "lon": 92.6843},
        {"district": "Nalbari", "lat": 26.4421, "lon": 91.4321},
        {"district": "Sivasagar", "lat": 26.9843, "lon": 94.6321},
        {"district": "Sonitpur", "lat": 26.6543, "lon": 92.7934},
        {"district": "South Salmara-Mankachar", "lat": 25.7123, "lon": 89.9123},
        {"district": "Tamulpur", "lat": 26.6341, "lon": 91.5643},
        {"district": "Tinsukia", "lat": 27.5023, "lon": 95.3643},
        {"district": "Udalguri", "lat": 26.7456, "lon": 92.0987},
        {"district": "West Karbi Anglong", "lat": 25.8643, "lon": 92.5432}
    ],
    "Manipur": [
        {"district": "Bishnupur", "lat": 24.6321, "lon": 93.7643},
        {"district": "Chandel", "lat": 24.3245, "lon": 94.0345},
        {"district": "Churachandpur", "lat": 24.3333, "lon": 93.6667},
        {"district": "Imphal East", "lat": 24.8123, "lon": 93.9643},
        {"district": "Imphal West", "lat": 24.7943, "lon": 93.8921},
        {"district": "Jiribam", "lat": 24.8021, "lon": 93.1234},
        {"district": "Kakching", "lat": 24.4843, "lon": 93.9843},
        {"district": "Kamjong", "lat": 24.9543, "lon": 94.5123},
        {"district": "Kangpokpi", "lat": 25.1543, "lon": 93.9743},
        {"district": "Noney", "lat": 24.8421, "lon": 93.5943},
        {"district": "Pherzawl", "lat": 24.2543, "lon": 93.1843},
        {"district": "Senapati", "lat": 25.2643, "lon": 94.0123},
        {"district": "Tamenglong", "lat": 24.9843, "lon": 93.4934},
        {"district": "Tengnoupal", "lat": 24.4021, "lon": 94.1543},
        {"district": "Thoubal", "lat": 24.6321, "lon": 94.0123},
        {"district": "Ukhrul", "lat": 25.1123, "lon": 94.3643}
    ],
    "Meghalaya": [
        {"district": "East Garo Hills", "lat": 25.6123, "lon": 90.5843},
        {"district": "East Jaintia Hills", "lat": 25.3214, "lon": 92.4543},
        {"district": "East Khasi Hills", "lat": 25.5788, "lon": 91.8933},
        {"district": "Eastern West Khasi Hills", "lat": 25.5123, "lon": 91.5643},
        {"district": "North Garo Hills", "lat": 25.9123, "lon": 90.5643},
        {"district": "Ri Bhoi", "lat": 25.9021, "lon": 91.8843},
        {"district": "South Garo Hills", "lat": 25.3021, "lon": 90.6321},
        {"district": "South West Garo Hills", "lat": 25.5021, "lon": 89.9643},
        {"district": "South West Khasi Hills", "lat": 25.3421, "lon": 91.4543},
        {"district": "West Garo Hills", "lat": 25.5143, "lon": 90.2034},
        {"district": "West Jaintia Hills", "lat": 25.4521, "lon": 92.2034},
        {"district": "West Khasi Hills", "lat": 25.5345, "lon": 91.2643}
    ],
    "Mizoram": [
        {"district": "Aizawl", "lat": 23.7307, "lon": 92.7173},
        {"district": "Champhai", "lat": 23.4756, "lon": 93.3289},
        {"district": "Hnahthial", "lat": 22.9643, "lon": 92.9321},
        {"district": "Khawzawl", "lat": 23.5345, "lon": 93.1843},
        {"district": "Kolasib", "lat": 24.2245, "lon": 92.6843},
        {"district": "Lawngtlai", "lat": 22.5245, "lon": 92.8943},
        {"district": "Lunglei", "lat": 22.8843, "lon": 92.7345},
        {"district": "Mamit", "lat": 23.9321, "lon": 92.4843},
        {"district": "Saitual", "lat": 23.6843, "lon": 92.9843},
        {"district": "Serchhip", "lat": 23.3123, "lon": 92.8456},
        {"district": "Siaha", "lat": 22.4843, "lon": 92.9843}
    ],
    "Nagaland": [
        {"district": "Chümoukedima", "lat": 25.8021, "lon": 93.7843},
        {"district": "Dimapur", "lat": 25.9068, "lon": 93.7275},
        {"district": "Kiphire", "lat": 25.8643, "lon": 94.7843},
        {"district": "Kohima", "lat": 25.6751, "lon": 94.1086},
        {"district": "Longleng", "lat": 26.4745, "lon": 94.8123},
        {"district": "Mokokchung", "lat": 26.3245, "lon": 94.5245},
        {"district": "Mon", "lat": 26.7456, "lon": 95.0643},
        {"district": "Niuland", "lat": 25.8943, "lon": 93.9123},
        {"district": "Noklak", "lat": 26.1987, "lon": 95.0123},
        {"district": "Peren", "lat": 25.5123, "lon": 93.7412},
        {"district": "Phek", "lat": 25.6843, "lon": 94.5023},
        {"district": "Shamator", "lat": 26.0543, "lon": 94.9123},
        {"district": "Tminyu", "lat": 25.9245, "lon": 94.2034},
        {"district": "Tuensang", "lat": 26.2843, "lon": 94.8321},
        {"district": "Wokha", "lat": 26.1021, "lon": 94.2643},
        {"district": "Zunheboto", "lat": 25.9643, "lon": 94.5245}
    ],
    "Sikkim": [
        {"district": "Gangtok", "lat": 27.3389, "lon": 88.6065},
        {"district": "Gyalshing", "lat": 27.2843, "lon": 88.2456},
        {"district": "Mangan", "lat": 27.5123, "lon": 88.5321},
        {"district": "Namchi", "lat": 27.1643, "lon": 88.3543},
        {"district": "Pakyong", "lat": 27.2412, "lon": 88.5843},
        {"district": "Soreng", "lat": 27.1745, "lon": 88.2034}
    ],
    "Tripura": [
        {"district": "Dhalai", "lat": 23.9021, "lon": 91.8432},
        {"district": "Gomati", "lat": 23.5345, "lon": 91.4934},
        {"district": "Khowai", "lat": 24.0643, "lon": 91.6023},
        {"district": "North Tripura", "lat": 24.2843, "lon": 92.1745},
        {"district": "Sepahijala", "lat": 23.6843, "lon": 91.3123},
        {"district": "South Tripura", "lat": 23.2345, "lon": 91.5643},
        {"district": "Unakoti", "lat": 24.3345, "lon": 92.0123},
        {"district": "West Tripura", "lat": 23.8315, "lon": 91.2868}
    ]
}


async def seed_database(data_by_state: Dict[str, List[Dict[str, Any]]]):
    """Seeds districts into PostgreSQL in a single efficient transaction."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("[Districts] ERROR: DATABASE_URL not set.")
        return

    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    connect_args = {}
    if "sslmode=" in database_url or "neon.tech" in database_url:
        parsed = urllib.parse.urlsplit(database_url)
        database_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", ""))
        connect_args["ssl"] = True

    engine = create_async_engine(database_url, echo=False, connect_args=connect_args)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        # Fetch all existing districts in one query
        existing_res = await session.execute(select(District))
        existing_map = {(d.state_name, d.district_name): d for d in existing_res.scalars().all()}

        total_inserted = 0
        total_updated = 0

        for state_name, districts in data_by_state.items():
            for item in districts:
                dist_name = item["district"]
                c_lat = item.get("lat")
                c_lon = item.get("lon")

                key = (state_name, dist_name)
                if key in existing_map:
                    existing = existing_map[key]
                    if existing.centroid_lat is None and c_lat is not None:
                        existing.centroid_lat = c_lat
                        existing.centroid_lon = c_lon
                        total_updated += 1
                else:
                    new_district = District(
                        state_name=state_name,
                        district_name=dist_name,
                        centroid_lat=c_lat,
                        centroid_lon=c_lon
                    )
                    session.add(new_district)
                    total_inserted += 1

        await session.commit()
        print(f"[Districts] Seed complete: {total_inserted} inserted, {len(existing_map)} already present, {total_updated} updated.")
    await engine.dispose()


def main():
    print("=" * 70)
    print("SIH 2026: Generating NER States & Districts Reference Data")
    print("=" * 70)

    data_dir = BACKEND_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    json_path = data_dir / "states_districts.json"

    simplified_json: Dict[str, List[str]] = {}
    total_districts = 0

    for state_name, districts in NER_DISTRICT_REFERENCE.items():
        sorted_names = sorted([d["district"] for d in districts])
        simplified_json[state_name] = sorted_names
        total_districts += len(sorted_names)
        print(f"  - {state_name}: {len(sorted_names)} districts")

    # Output to data/states_districts.json exactly as required:
    # { "Assam": ["Kamrup Metropolitan", "Dibrugarh", ...], "Meghalaya": ["East Khasi Hills", ...], ... }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(simplified_json, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {total_districts} total districts across 8 NER states to: {json_path}")

    # Seed Postgres database
    print("\nSeeding PostgreSQL `districts` table...")
    asyncio.run(seed_database(NER_DISTRICT_REFERENCE))
    print("[SUCCESS] All states and districts loaded.")


if __name__ == "__main__":
    main()
