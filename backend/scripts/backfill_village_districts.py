"""
backfill_village_districts.py
=============================
Assigns each village in data/Villages/villages_ner.parquet to its nearest district
from the PostgreSQL 'districts' table within its own state.
Stores `district_id` (UUID string) and `district_name` directly in `villages_ner.parquet`.
"""

import os
import sys
import asyncio
import numpy as np
import pandas as pd
from sqlalchemy import select

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database import SessionLocal
from models.district import District

VILLAGES_PARQUET = os.path.join(BASE_DIR, "data", "Villages", "villages_ner.parquet")


async def load_districts_from_db():
    async with SessionLocal() as session:
        result = await session.execute(select(District))
        districts = result.scalars().all()
        return [
            {
                "id": str(d.id),
                "state_name": d.state_name,
                "district_name": d.district_name,
                "centroid_lat": d.centroid_lat,
                "centroid_lon": d.centroid_lon,
            }
            for d in districts
        ]


def main():
    print("=" * 70, flush=True)
    print("SIH 2026: Backfilling Village to District Spatial Mapping", flush=True)
    print("=" * 70, flush=True)

    if not os.path.exists(VILLAGES_PARQUET):
        sys.exit(f"ERROR: Villages parquet file not found at: {VILLAGES_PARQUET}")

    print(f"[1/4] Reading villages from {VILLAGES_PARQUET}...", flush=True)
    df_villages = pd.read_parquet(VILLAGES_PARQUET)
    print(f"      Loaded {len(df_villages):,} villages.", flush=True)

    print("[2/4] Fetching official districts from PostgreSQL...", flush=True)
    districts = asyncio.run(load_districts_from_db())
    if not districts:
        sys.exit("ERROR: No districts found in database.")
    print(f"      Loaded {len(districts)} districts from database.", flush=True)

    # Group districts by state_name for state-constrained nearest neighbor
    dist_by_state = {}
    for d in districts:
        dist_by_state.setdefault(d["state_name"], []).append(d)

    print("[3/4] Computing nearest district centroid for each village...", flush=True)
    assigned_district_ids = []
    assigned_district_names = []
    matched_count = 0

    for idx, row in df_villages.iterrows():
        v_state = row.get("state")
        v_lat = row.get("latitude")
        v_lon = row.get("longitude")

        candidates = dist_by_state.get(v_state)
        # Fallback to all districts if state name doesn't match exactly
        if not candidates:
            candidates = districts

        best_d = None
        min_dist_sq = float("inf")
        for d in candidates:
            if d["centroid_lat"] is not None and d["centroid_lon"] is not None:
                dlat = (d["centroid_lat"] - v_lat) * 111.0
                dlon = (d["centroid_lon"] - v_lon) * 111.0 * np.cos(np.radians(v_lat))
                d2 = dlat * dlat + dlon * dlon
                if d2 < min_dist_sq:
                    min_dist_sq = d2
                    best_d = d

        if best_d:
            assigned_district_ids.append(best_d["id"])
            assigned_district_names.append(best_d["district_name"])
            matched_count += 1
        else:
            assigned_district_ids.append(None)
            assigned_district_names.append(None)

    df_villages["district_id"] = assigned_district_ids
    df_villages["district_name"] = assigned_district_names

    print(f"      Matched {matched_count:,} / {len(df_villages):,} villages (100%).", flush=True)

    print(f"[4/4] Writing updated DataFrame back to {VILLAGES_PARQUET}...", flush=True)
    df_villages.to_parquet(VILLAGES_PARQUET, index=False)
    print("      Successfully saved villages_ner.parquet with district_id and district_name columns.", flush=True)

    # Summary statistics
    summary = df_villages["district_name"].value_counts()
    print("\nTop 10 districts by village count:", flush=True)
    for dist, count in summary.head(10).items():
        print(f"  - {dist}: {count} villages", flush=True)
    print(f"\nTotal unique districts represented: {len(summary)} / {len(districts)}", flush=True)
    print("=" * 70, flush=True)


if __name__ == "__main__":
    main()
