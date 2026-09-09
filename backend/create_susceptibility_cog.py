"""
create_susceptibility_cog.py
────────────────────────────
One-time script that:
  1. Opens susceptibility_6933.tif (EPSG:6933, ~200m pixels, values 0-1)
  2. Reprojects to EPSG:4326 (WGS84, matching all other project layers)
  3. Builds internal overview levels for fast tile rendering
  4. Writes a Cloud Optimized GeoTIFF (COG) to the Model 1 Datasets directory

Source : data/susceptibility_6933.tif          (EPSG:6933, projected metres)
Output : data/Model 1 Datasets/               (EPSG:4326, WGS84 degrees)
         modelA_NER_only_susceptibility_cog.tif

The source TIFF is in EPSG:6933 (WGS 84 / NSIDC EASE-Grid 2.0 Global).
All other project layers (NER boundaries, roads, MapLibre) use EPSG:4326.
Reprojection uses bilinear resampling to preserve smooth probability values.

The source TIFF is NEVER modified or overwritten.

Usage (from backend/ directory, with .venv activated):
    python create_susceptibility_cog.py
"""

import os
import sys

try:
    import rasterio
    from rasterio.crs import CRS
    from rasterio.enums import Resampling
    from rasterio.warp import calculate_default_transform, reproject
    import rasterio.shutil as rio_shutil
except ImportError:
    sys.exit("ERROR: rasterio not found. Activate the .venv first.")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(BASE_DIR, "data")
MODEL1_DIR = os.path.join(BASE_DIR, "data", "Model 1 Datasets")

# Source: the EPSG:6933 raster provided for web integration
SRC_TIFF = os.path.join(DATA_DIR, "susceptibility_6933.tif")

# Output: EPSG:4326 COG placed with the rest of the Model A outputs
COG_TIFF = os.path.join(MODEL1_DIR, "modelA_NER_only_susceptibility_cog.tif")

# Intermediate (reprojected, before COG wrapping)
INTERMEDIATE = COG_TIFF + ".tmp.tif"

# Target CRS — must match all other project data
DST_CRS = CRS.from_epsg(4326)

# Overview levels for COG (2x, 4x, 8x, … zoom-out levels)
OVERVIEW_LEVELS = [2, 4, 8, 16, 32, 64]

# ── Sanity checks ─────────────────────────────────────────────────────────────
if not os.path.exists(SRC_TIFF):
    sys.exit(f"ERROR: Source TIFF not found:\n  {SRC_TIFF}")

if os.path.abspath(SRC_TIFF) == os.path.abspath(COG_TIFF):
    sys.exit("ERROR: Source and destination are the same file — aborting.")

# ── Inspect source ─────────────────────────────────────────────────────────────
print("=== Source TIFF (EPSG:6933) ===")
with rasterio.open(SRC_TIFF) as src:
    print(f"  Path     : {SRC_TIFF}")
    print(f"  CRS      : {src.crs}")
    print(f"  Size     : {src.width} x {src.height}")
    print(f"  Bands    : {src.count}")
    print(f"  Dtype    : {src.dtypes[0]}")
    print(f"  NoData   : {src.nodata}")
    print(f"  Bounds   : {src.bounds}")
    print(f"  Pixel    : {src.transform.a:.2f} m")
    print(f"  Compress : {src.compression}")
    print(f"  Blocks   : {src.block_shapes}")
    print(f"  Overviews: {src.overviews(1)}")

    data = src.read(1, masked=True)
    vals = data.compressed()
    print(f"\n  Valid pixels : {len(vals):,}")
    if len(vals):
        print(f"  Min          : {float(vals.min()):.6f}")
        print(f"  Max          : {float(vals.max()):.6f}")
        print(f"  Mean         : {float(vals.mean()):.4f}")

# ── Step 1: Reproject EPSG:6933 → EPSG:4326, write intermediate ──────────────
print("\n=== Reprojecting EPSG:6933 -> EPSG:4326 ===")
with rasterio.open(SRC_TIFF) as src:
    transform, width, height = calculate_default_transform(
        src.crs, DST_CRS, src.width, src.height, *src.bounds
    )
    print(f"  Output size  : {width} x {height}")
    print(f"  Output pixel : {transform.a:.6f}°")

    profile = src.profile.copy()
    profile.update(
        crs=DST_CRS,
        transform=transform,
        width=width,
        height=height,
        driver="GTiff",
        compress="lzw",
        predictor=2,        # horizontal differencing — efficient for float rasters
        tiled=True,
        blockxsize=256,
        blockysize=256,
        bigtiff="IF_SAFER",
        copy_src_overviews=False,
        nodata=float("nan"),
    )

    with rasterio.open(INTERMEDIATE, "w", **profile) as dst:
        for i in range(1, src.count + 1):
            reproject(
                source=rasterio.band(src, i),
                destination=rasterio.band(dst, i),
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=DST_CRS,
                resampling=Resampling.bilinear,  # bilinear preserves smooth probability values
                src_nodata=float("nan"),
                dst_nodata=float("nan"),
            )

print(f"  Written : {INTERMEDIATE}")

# Quick value check after reprojection
with rasterio.open(INTERMEDIATE) as chk:
    d = chk.read(1, masked=True).compressed()
    print(f"  Valid pixels : {len(d):,}")
    if len(d):
        print(f"  Min          : {float(d.min()):.6f}")
        print(f"  Max          : {float(d.max()):.6f}")
    print(f"  Bounds (4326): {chk.bounds}")

# ── Step 2: Build overviews on the intermediate ───────────────────────────────
print("\n=== Building overviews ===")
with rasterio.open(INTERMEDIATE, "r+") as dst:
    dst.build_overviews(OVERVIEW_LEVELS, Resampling.average)
    dst.update_tags(ns="rio_overview", resampling="average")

with rasterio.open(INTERMEDIATE) as chk:
    print(f"  Overviews: {chk.overviews(1)}")

# ── Step 3: Write true COG using rasterio.shutil.copy ────────────────────────
# copy_src_overviews=True reads the pre-built overviews and lays out the file
# in COG order (header → overview data → full-res data).
print("\n=== Writing Cloud Optimized GeoTIFF ===")
rio_shutil.copy(
    INTERMEDIATE,
    COG_TIFF,
    driver="GTiff",
    copy_src_overviews=True,
    compress="lzw",
    predictor=2,
    tiled=True,
    blockxsize=256,
    blockysize=256,
    bigtiff="IF_SAFER",
)

# ── Cleanup ───────────────────────────────────────────────────────────────────
if os.path.exists(INTERMEDIATE):
    os.remove(INTERMEDIATE)
    print("  Removed intermediate file.")

# ── Verify COG ────────────────────────────────────────────────────────────────
print("\n=== Verifying COG ===")
with rasterio.open(COG_TIFF) as cog:
    print(f"  Path      : {COG_TIFF}")
    print(f"  CRS       : {cog.crs}")
    print(f"  Size      : {cog.width} x {cog.height}")
    print(f"  Bounds    : {cog.bounds}")
    print(f"  NoData    : {cog.nodata}")
    print(f"  Compress  : {cog.compression}")
    print(f"  Blocks    : {cog.block_shapes}")
    print(f"  Overviews : {cog.overviews(1)}")
    size_mb = os.path.getsize(COG_TIFF) / 1_048_576
    print(f"  File size : {size_mb:.1f} MB")

    d = cog.read(1, masked=True).compressed()
    print(f"\n  Valid pixels : {len(d):,}")
    if len(d):
        print(f"  Min          : {float(d.min()):.6f}")
        print(f"  Max          : {float(d.max()):.6f}")
        print(f"  Mean         : {float(d.mean()):.4f}")

print("\nCOG created successfully.")
print(f"  Output : {COG_TIFF}  (EPSG:4326)")
print("\nSource TIFF is UNTOUCHED:")
print(f"  Source : {SRC_TIFF}  (EPSG:6933)")
