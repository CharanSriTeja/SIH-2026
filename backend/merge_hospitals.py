from pathlib import Path
import geopandas as gpd
import pandas as pd

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------
BASE = Path(r"D:\charan coding\SIH 2026\SIH1")

MAIN_FILE = BASE / "data" / "Hospitals" / "hospitals_ner.parquet"
RAW_DIR = BASE / "data" / "Hospitals" / "raw"

OUTPUT_DIR = BASE / "backend" / "data" / "Hospitals"
OUTPUT_FILE = OUTPUT_DIR / "hospitals_ner.parquet"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------
# Load existing main hospitals file
# ---------------------------------------------------------
print("\nLoading existing hospitals dataset...")
main = gpd.read_parquet(MAIN_FILE)

print(f"Existing hospitals: {len(main)}")

# ---------------------------------------------------------
# Load the four raw state Parquet files
# ---------------------------------------------------------
raw_files = sorted(RAW_DIR.glob("*.parquet"))

print(f"\nRaw files found: {len(raw_files)}")

if len(raw_files) == 0:
    raise FileNotFoundError(f"No Parquet files found in: {RAW_DIR}")

frames = [main]

for file in raw_files:
    print(f"Loading: {file.name}")

    gdf = gpd.read_parquet(file)

    print(f"  Records: {len(gdf)}")

    frames.append(gdf)

# ---------------------------------------------------------
# Merge
# ---------------------------------------------------------
print("\nMerging datasets...")

merged = pd.concat(frames, ignore_index=True)

# Convert back to GeoDataFrame
merged = gpd.GeoDataFrame(
    merged,
    geometry="geometry",
    crs=main.crs
)

# ---------------------------------------------------------
# CRS normalization
# ---------------------------------------------------------
if merged.crs is None:
    merged = merged.set_crs("EPSG:4326")
elif str(merged.crs) != "EPSG:4326":
    merged = merged.to_crs("EPSG:4326")

# ---------------------------------------------------------
# Remove exact OSM duplicates
# ---------------------------------------------------------
if "osm_id" in merged.columns and "osm_type" in merged.columns:

    before = len(merged)

    merged = merged.drop_duplicates(
        subset=["osm_type", "osm_id"],
        keep="first"
    )

    print(
        f"Removed OSM duplicates: "
        f"{before - len(merged)}"
    )

# ---------------------------------------------------------
# Remove duplicate hospitals with same name + location
# ---------------------------------------------------------
if all(
    col in merged.columns
    for col in ["name", "latitude", "longitude"]
):

    before = len(merged)

    merged = merged.drop_duplicates(
        subset=["name", "latitude", "longitude"],
        keep="first"
    )

    print(
        f"Removed name/location duplicates: "
        f"{before - len(merged)}"
    )

# ---------------------------------------------------------
# Sort
# ---------------------------------------------------------
sort_columns = [
    col for col in ["state", "district", "name"]
    if col in merged.columns
]

if sort_columns:
    merged = merged.sort_values(
        by=sort_columns,
        na_position="last"
    )

# ---------------------------------------------------------
# Save final dataset
# ---------------------------------------------------------
print("\nSaving final dataset...")

merged.to_parquet(
    OUTPUT_FILE,
    index=False
)

# ---------------------------------------------------------
# Validation
# ---------------------------------------------------------
print("\n" + "=" * 60)
print("MERGE COMPLETE")
print("=" * 60)

print(f"Final hospitals: {len(merged)}")
print(f"CRS: {merged.crs}")
print(f"Output: {OUTPUT_FILE}")

if "state" in merged.columns:
    print("\nHospitals by state:")
    print(merged["state"].value_counts(dropna=False))

if "geometry" in merged.columns:
    print(
        f"\nMissing geometry: "
        f"{merged.geometry.isna().sum()}"
    )

if "latitude" in merged.columns:
    print(
        f"Missing latitude: "
        f"{merged['latitude'].isna().sum()}"
    )

if "longitude" in merged.columns:
    print(
        f"Missing longitude: "
        f"{merged['longitude'].isna().sum()}"
    )

print("\nFinal file:")
print(OUTPUT_FILE)