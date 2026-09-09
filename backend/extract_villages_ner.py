"""
extract_villages_ner.py
=======================
Extracts village and hamlet settlement data for all 8 Northeast India states
from OpenStreetMap via the Overpass API.

Source      : OpenStreetMap (c) OpenStreetMap contributors, ODbL
Via         : Overpass API (https://overpass-api.de)
Output      : data/Villages/villages_ner.parquet   (GeoParquet, EPSG:4326)
              data/Villages/villages_ner.geojson    (debug / GIS inspection)

Method      : Queries the NER bounding box directly (very fast), then uses
              a spatial join with data/NER_Boundaries/ner_states_combined.geojson
              to accurately assign states and filter out non-NER points.

Usage       : python extract_villages_ner.py
Deps        : overpy, geopandas, shapely, pyarrow, pandas, requests
"""

import os
import sys
import time
import logging
import json
import warnings

import pandas as pd

try:
    import overpy
except ImportError:
    sys.exit("ERROR: overpy not found. Run: .venv\\Scripts\\python -m pip install overpy")

try:
    import geopandas as gpd
    from shapely.geometry import Point
except ImportError:
    sys.exit("ERROR: geopandas/shapely not found. Run: .venv\\Scripts\\python -m pip install geopandas shapely")

warnings.filterwarnings("ignore", category=UserWarning, module="geopandas")

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Configuration ─────────────────────────────────────────────────────────────
# NER State mappings for mapping geometry name to standard state codes
STATE_CODE_MAP = {
    "Assam": "IN-AS",
    "Arunachal Pradesh": "IN-AR",
    "Meghalaya": "IN-ML",
    "Manipur": "IN-MN",
    "Mizoram": "IN-MZ",
    "Nagaland": "IN-NL",
    "Tripura": "IN-TR",
    "Sikkim": "IN-SK",
}

PLACE_TYPES = ["village", "hamlet"]

# NER Bounding Box (roughly 21.9N to 29.5N, 88.0E to 97.5E)
BBOX = (21.9, 88.0, 29.5, 97.5) # South, West, North, East

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
REQUEST_TIMEOUT = 180

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VILLAGES_DIR = os.path.join(BASE_DIR, "data", "Villages")
PARQUET_OUT = os.path.join(VILLAGES_DIR, "villages_ner.parquet")
GEOJSON_OUT = os.path.join(VILLAGES_DIR, "villages_ner.geojson")
BOUNDARIES_FILE = os.path.join(BASE_DIR, "data", "NER_Boundaries", "ner_states_combined.geojson")

os.makedirs(VILLAGES_DIR, exist_ok=True)

# ── Extraction ────────────────────────────────────────────────────────────────
def main():
    t0 = time.time()
    print()
    print("=" * 65)
    print("  NER Village Extraction  (OpenStreetMap via Overpass API)")
    print("=" * 65)
    
    if not os.path.exists(BOUNDARIES_FILE):
        sys.exit(f"ERROR: Boundaries file not found: {BOUNDARIES_FILE}")

    # 1. Bounding box query
    place_filter = "|".join(PLACE_TYPES)
    query = f"""
    [out:json][timeout:{REQUEST_TIMEOUT}];
    node["place"~"^({place_filter})$"]({BBOX[0]}, {BBOX[1]}, {BBOX[2]}, {BBOX[3]});
    out body;
    """
    
    log.info(f"Querying Overpass for bbox {BBOX} ...")
    api = overpy.Overpass(url=OVERPASS_URL)
    
    try:
        result = api.query(query)
    except Exception as e:
        sys.exit(f"Overpass API error: {e}")

    records = []
    for node in result.nodes:
        tags = node.tags
        place_type = tags.get("place", "").strip()
        
        if place_type not in PLACE_TYPES:
            continue
            
        name = tags.get("name", "").strip() or None
        population = tags.get("population", None)
        if population:
            try:
                population = int(population)
            except (ValueError, TypeError):
                population = None

        records.append({
            "osm_id":     int(node.id),
            "name":       name,
            "place_type": place_type,
            "latitude":   float(node.lat),
            "longitude":  float(node.lon),
            "population": population,
            "wikidata":   tags.get("wikidata", None) or None,
            "wikipedia":  tags.get("wikipedia", None) or None,
        })

    log.info(f"Extracted {len(records):,} total settlement nodes from BBOX")
    if not records:
        sys.exit("No records found in BBOX.")

    # 2. Build GeoDataFrame
    df = pd.DataFrame(records)
    # Deduplicate early
    pre_dedup = len(df)
    df = df.drop_duplicates(subset=["osm_id", "place_type"], keep="first")
    dupes_removed = pre_dedup - len(df)
    
    geometry = [Point(row.longitude, row.latitude) for row in df.itertuples()]
    nodes_gdf = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")
    
    # 3. Load Boundaries
    log.info(f"Loading NER boundaries for spatial join ...")
    boundaries = gpd.read_file(BOUNDARIES_FILE)
    if boundaries.crs is None or boundaries.crs.to_epsg() != 4326:
        boundaries = boundaries.to_crs(epsg=4326)
        
    # Standardize column name for state
    state_col = None
    for c in ["state", "STATE", "name", "NAME"]:
        if c in boundaries.columns:
            state_col = c
            break
            
    if not state_col:
        sys.exit(f"Could not find a state name column in {BOUNDARIES_FILE}. Columns: {boundaries.columns.tolist()}")

    # 4. Spatial Join (filter nodes to only those inside NER boundaries)
    log.info("Performing spatial join (Point in Polygon) ...")
    joined = gpd.sjoin(nodes_gdf, boundaries, how="inner", predicate="intersects")
    
    # Extract state names and assign standard codes
    joined["state"] = joined[state_col]
    joined["state_code"] = joined["state"].map(STATE_CODE_MAP)
    
    # Check for missing state codes (due to typos in the boundary file)
    missing_codes = joined[joined["state_code"].isna()]["state"].unique()
    if len(missing_codes) > 0:
        log.warning(f"Unrecognized states from boundaries: {missing_codes}")
        # Attempt fallback matching
        for st in missing_codes:
            for k, v in STATE_CODE_MAP.items():
                if k.lower() in str(st).lower():
                    joined.loc[joined["state"] == st, "state_code"] = v
                    joined.loc[joined["state"] == st, "state"] = k
    
    # 5. Clean up columns
    col_order = [
        "osm_id", "name", "place_type",
        "latitude", "longitude",
        "state", "state_code",
        "population", "wikidata", "wikipedia",
        "geometry",
    ]
    
    final_gdf = joined[[c for c in col_order if c in joined.columns]].copy()
    
    invalid_coords = 0
    missing_names = final_gdf["name"].isna().sum()

    # 6. Save GeoParquet
    log.info(f"Writing GeoParquet -> {PARQUET_OUT}")
    final_gdf.to_parquet(PARQUET_OUT, index=False)

    # 7. Save GeoJSON
    log.info(f"Writing GeoJSON   -> {GEOJSON_OUT}")
    final_gdf.to_file(GEOJSON_OUT, driver="GeoJSON")

    # ── Data Quality Report ───────────────────────────────────────────────────
    elapsed = time.time() - t0
    print()
    print("=" * 65)
    print("  NER VILLAGE EXTRACTION — DATA QUALITY REPORT")
    print("=" * 65)
    print()
    print("  Records by state:")
    by_state = final_gdf["state"].value_counts()
    for state_name, n in by_state.items():
        code = STATE_CODE_MAP.get(state_name, "UNKNOWN")
        print(f"    {state_name:<25} ({code}) {n:>6,}")
    print(f"    {'':34}  {'------'}")
    total = len(final_gdf)
    print(f"    {'TOTAL':<34}  {total:>6,}")
    print()

    by_type = final_gdf["place_type"].value_counts()
    for ptype, cnt in by_type.items():
        print(f"  {ptype.capitalize():<12}: {cnt:>6,}")
    print()
    print(f"  BBOX Nodes filtered : {len(df) - total:,} (outside NER polygons)")
    print(f"  Duplicates removed  : {dupes_removed:,}")
    print(f"  Missing names       : {missing_names:,}")
    print()

    bb = final_gdf.total_bounds   # [min_lon, min_lat, max_lon, max_lat]
    print(f"  Bounding box (EPSG:4326):")
    print(f"    West  : {bb[0]:.4f}")
    print(f"    South : {bb[1]:.4f}")
    print(f"    East  : {bb[2]:.4f}")
    print(f"    North : {bb[3]:.4f}")
    print()
    print(f"  CRS     : EPSG:4326 (WGS84)")
    print(f"  Output  : {PARQUET_OUT}")
    print(f"  Elapsed : {elapsed:.1f}s")
    print("=" * 65)
    print()
    print("  Next step: python build_village_tiles.py")
    print()

if __name__ == "__main__":
    main()
