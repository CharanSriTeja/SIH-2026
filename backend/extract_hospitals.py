import time
from pathlib import Path

import overpy
import geopandas as gpd
from shapely.geometry import Point


# ============================================================
# CONFIG
# ============================================================

STATES = {
    "IN-AR": "Arunachal Pradesh",
    "IN-NL": "Nagaland",
    "IN-TR": "Tripura",
    "IN-SK": "Sikkim",
}

OVERPASS_SERVERS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]

PROJECT_ROOT = Path(r"D:\charan coding\SIH 2026\SIH1")

OUTPUT_DIR = PROJECT_ROOT / "data" / "Hospitals"
RAW_DIR = OUTPUT_DIR / "raw"

RAW_DIR.mkdir(parents=True, exist_ok=True)

MAX_RETRIES = 2


# ============================================================
# OVERPASS QUERY
# ============================================================

def create_query(state_code):

    return f"""
    [out:json][timeout:300];

    area["ISO3166-2"="{state_code}"]->.state;

    (
        node["amenity"="hospital"](area.state);
        way["amenity"="hospital"](area.state);
        relation["amenity"="hospital"](area.state);
    );

    out center tags;
    """


# ============================================================
# EXTRACT ONE STATE
# ============================================================

def extract_state(state_code, state_name):

    print("\n" + "=" * 70)
    print(f"Extracting hospitals: {state_name} ({state_code})")
    print("=" * 70)

    query = create_query(state_code)

    for server in OVERPASS_SERVERS:

        for attempt in range(1, MAX_RETRIES + 1):

            print(f"\nServer: {server}")
            print(f"Attempt: {attempt}/{MAX_RETRIES}")

            try:

                api = overpy.Overpass(
                    url=server
                )

                result = api.query(query)

                print(
                    f"Nodes: {len(result.nodes)}"
                )

                print(
                    f"Ways: {len(result.ways)}"
                )

                print(
                    f"Relations: {len(result.relations)}"
                )

                records = []

                # ====================================================
                # NODES
                # ====================================================

                for element in result.nodes:

                    tags = element.tags

                    records.append({
                        "osm_id": int(element.id),
                        "osm_type": "node",
                        "name": tags.get("name"),
                        "hospital_type": tags.get(
                            "healthcare",
                            "hospital"
                        ),
                        "operator": tags.get("operator"),
                        "phone": tags.get("phone"),
                        "website": tags.get("website"),
                        "emergency": tags.get("emergency"),
                        "opening_hours": tags.get(
                            "opening_hours"
                        ),
                        "address": tags.get("addr:full"),
                        "city": tags.get("addr:city"),
                        "district": tags.get(
                            "addr:district"
                        ),
                        "state": state_name,
                        "state_code": state_code,
                        "latitude": float(element.lat),
                        "longitude": float(element.lon),
                    })

                # ====================================================
                # WAYS
                # ====================================================

                for element in result.ways:

                    tags = element.tags

                    lat = getattr(
                        element,
                        "center_lat",
                        None
                    )

                    lon = getattr(
                        element,
                        "center_lon",
                        None
                    )

                    if lat is None or lon is None:
                        continue

                    records.append({
                        "osm_id": int(element.id),
                        "osm_type": "way",
                        "name": tags.get("name"),
                        "hospital_type": tags.get(
                            "healthcare",
                            "hospital"
                        ),
                        "operator": tags.get("operator"),
                        "phone": tags.get("phone"),
                        "website": tags.get("website"),
                        "emergency": tags.get("emergency"),
                        "opening_hours": tags.get(
                            "opening_hours"
                        ),
                        "address": tags.get("addr:full"),
                        "city": tags.get("addr:city"),
                        "district": tags.get(
                            "addr:district"
                        ),
                        "state": state_name,
                        "state_code": state_code,
                        "latitude": float(lat),
                        "longitude": float(lon),
                    })

                # ====================================================
                # RELATIONS
                # ====================================================

                for element in result.relations:

                    tags = element.tags

                    lat = getattr(
                        element,
                        "center_lat",
                        None
                    )

                    lon = getattr(
                        element,
                        "center_lon",
                        None
                    )

                    if lat is None or lon is None:
                        continue

                    records.append({
                        "osm_id": int(element.id),
                        "osm_type": "relation",
                        "name": tags.get("name"),
                        "hospital_type": tags.get(
                            "healthcare",
                            "hospital"
                        ),
                        "operator": tags.get("operator"),
                        "phone": tags.get("phone"),
                        "website": tags.get("website"),
                        "emergency": tags.get("emergency"),
                        "opening_hours": tags.get(
                            "opening_hours"
                        ),
                        "address": tags.get("addr:full"),
                        "city": tags.get("addr:city"),
                        "district": tags.get(
                            "addr:district"
                        ),
                        "state": state_name,
                        "state_code": state_code,
                        "latitude": float(lat),
                        "longitude": float(lon),
                    })

                # ====================================================
                # NO DATA
                # ====================================================

                if not records:

                    print(
                        f"\nNo hospitals returned for "
                        f"{state_name}."
                    )

                    return gpd.GeoDataFrame(
                        columns=[
                            "osm_id",
                            "osm_type",
                            "name",
                            "hospital_type",
                            "operator",
                            "phone",
                            "website",
                            "emergency",
                            "opening_hours",
                            "address",
                            "city",
                            "district",
                            "state",
                            "state_code",
                            "latitude",
                            "longitude",
                            "geometry",
                        ],
                        geometry="geometry",
                        crs="EPSG:4326",
                    )

                # ====================================================
                # GEODATAFRAME
                # ====================================================

                gdf = gpd.GeoDataFrame(
                    records,
                    geometry=[
                        Point(
                            record["longitude"],
                            record["latitude"]
                        )
                        for record in records
                    ],
                    crs="EPSG:4326"
                )

                # ====================================================
                # REMOVE INVALID COORDINATES
                # ====================================================

                before = len(gdf)

                gdf = gdf[
                    gdf["latitude"].between(-90, 90)
                    & gdf["longitude"].between(-180, 180)
                ].copy()

                print(
                    f"Invalid coordinates removed: "
                    f"{before - len(gdf)}"
                )

                # ====================================================
                # REMOVE UNNAMED
                # ====================================================

                before = len(gdf)

                gdf = gdf[
                    gdf["name"].notna()
                    & (
                        gdf["name"]
                        .astype(str)
                        .str.strip()
                        != ""
                    )
                ].copy()

                print(
                    f"Unnamed hospitals removed: "
                    f"{before - len(gdf)}"
                )

                # ====================================================
                # REMOVE EXACT OSM DUPLICATES
                # ====================================================

                before = len(gdf)

                gdf = gdf.drop_duplicates(
                    subset=[
                        "osm_type",
                        "osm_id"
                    ]
                ).copy()

                print(
                    f"Duplicate OSM objects removed: "
                    f"{before - len(gdf)}"
                )

                # ====================================================
                # SAVE STATE
                # ====================================================

                output_file = (
                    RAW_DIR
                    / f"hospitals_{state_code}.parquet"
                )

                gdf.to_parquet(
                    output_file,
                    index=False
                )

                print(
                    f"\nSUCCESS: {state_name}"
                )

                print(
                    f"Hospitals: {len(gdf)}"
                )

                print(
                    f"Saved to:\n{output_file}"
                )

                return gdf

            except Exception as error:

                print(
                    f"\nERROR: "
                    f"{type(error).__name__}: {error}"
                )

                if attempt < MAX_RETRIES:

                    print(
                        "Waiting 20 seconds before retry..."
                    )

                    time.sleep(20)

        print(
            "\nTrying next Overpass server..."
        )

    print(
        f"\nFAILED COMPLETELY: "
        f"{state_name}"
    )

    return None


# ============================================================
# MAIN
# ============================================================

def main():

    successful = []
    failed = []

    for state_code, state_name in STATES.items():

        result = extract_state(
            state_code,
            state_name
        )

        if result is None:

            failed.append(
                state_name
            )

        else:

            successful.append(
                (
                    state_name,
                    len(result)
                )
            )

        # Don't overload Overpass
        print(
            "\nWaiting 15 seconds before next state..."
        )

        time.sleep(15)

    # ========================================================
    # SUMMARY
    # ========================================================

    print("\n")
    print("=" * 70)
    print("FINAL EXTRACTION SUMMARY")
    print("=" * 70)

    print("\nSUCCESSFUL STATES:")

    if successful:

        for state, count in successful:

            print(
                f"  {state:<25} {count}"
            )

    else:

        print("  None")

    print("\nFAILED STATES:")

    if failed:

        for state in failed:

            print(
                f"  {state}"
            )

    else:

        print("  None")

    print("\nRaw files:")

    print(RAW_DIR)

    print("\nIMPORTANT:")
    print(
        "Do NOT create the final PMTiles yet."
    )

    print(
        "First verify all 8 NER states."
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()