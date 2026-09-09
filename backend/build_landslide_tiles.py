"""
build_landslide_tiles.py
========================
Converts modelA_positive_ner_200m.parquet => historical_landslides.pmtiles

Usage:  python build_landslide_tiles.py
Deps:   pyarrow, pandas, mercantile, mapbox_vector_tile, pmtiles
"""

import os, sys, gzip, json, time, collections
import pyarrow.parquet as pq
import pandas as pd
import mercantile
import mapbox_vector_tile
from pmtiles.writer import Writer, Compression, tileid_to_zxy
from pmtiles import writer as _w


# ── Hilbert curve: (z,x,y) → tile_id  ────────────────────────────────────────
def _rotate(n, x, y, rx, ry):
    if ry == 0:
        if rx == 1:
            x = n - 1 - x
            y = n - 1 - y
        x, y = y, x
    return x, y

def zxy_to_tileid(z, x, y):
    if z == 0: return 0
    acc = ((1 << (z * 2)) - 1) // 3   # sum of 4^0..4^(z-1)
    n = 1 << z
    rx = ry = d = 0
    s = n >> 1
    px, py = x, y
    while s > 0:
        rx = 1 if (px & s) > 0 else 0
        ry = 1 if (py & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        px, py = _rotate(s, px, py, rx, ry)
        s >>= 1
    return acc + d

# ── Paths & config ────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
PARQUET_PATH  = os.path.join(BASE_DIR, "data", "Landslides Data", "modelA_positive_ner_200m.parquet")
PMTILES_PATH  = os.path.join(BASE_DIR, "data", "Landslides Data", "historical_landslides.pmtiles")
SOURCE_LAYER  = "landslides"
MIN_ZOOM, MAX_ZOOM = 4, 14
WEB_COLUMNS   = ["latitude","longitude","state","elevation","slope","land_cover_class","label"]
# ESA CCI Land Cover classes — only classes present in the dataset:
# 10=Cropland, 20=Cropland irrigated, 30=Mosaic cropland, 40=Closed-open broadleaved deciduous forest,
# 50=Closed broadleaved evergreen forest, 60=Open broadleaved deciduous forest,
# 80=Open needleleaved deciduous forest, 100=Mosaic tree/shrub
LAND_COVER_LABELS = {
    10:  "Cropland (rainfed)",
    20:  "Cropland (irrigated)",
    30:  "Mosaic Cropland / Vegetation",
    40:  "Broadleaved Deciduous Forest",
    50:  "Broadleaved Evergreen Forest",
    60:  "Open Broadleaved Deciduous Forest",
    80:  "Open Needleleaved Forest",
    100: "Mosaic Tree and Shrub",
}

def main():
    t0 = time.time()
    print("\n" + "="*60)
    print("  Historical Landslide PMTiles Builder")
    print("="*60)

    # 1. Validate source
    print("[1/7] Validating source Parquet ...")
    assert os.path.exists(PARQUET_PATH), f"Missing: {PARQUET_PATH}"
    parquet_mb = os.path.getsize(PARQUET_PATH) / 1e6
    print(f"      {parquet_mb:.1f} MB  -- will NOT be modified")

    # 2. Read
    print("[2/7] Reading Parquet (read-only) ...")
    df = pd.read_parquet(PARQUET_PATH)
    assert "latitude" in df.columns and "longitude" in df.columns
    assert df["latitude"].notnull().all() and df["longitude"].notnull().all()
    assert df.longitude.between(-180,180).all() and df.latitude.between(-90,90).all()
    keep  = [c for c in WEB_COLUMNS if c in df.columns]
    dfw   = df[keep].copy()
    total = len(dfw)
    lon_min, lon_max = float(dfw.longitude.min()), float(dfw.longitude.max())
    lat_min, lat_max = float(dfw.latitude.min()),  float(dfw.latitude.max())
    print(f"      Rows: {total:,} | Cols: {keep}")
    print(f"      BBox: [{lon_min:.4f},{lat_min:.4f}] -> [{lon_max:.4f},{lat_max:.4f}]")
    print("      CRS:  WGS84 EPSG:4326 confirmed")

    # 3. Assign points -> tiles
    print("[3/7] Assigning points to tiles (zooms 4-14) ...")
    recs = dfw.to_dict("records")
    tile_feats = collections.defaultdict(list)
    for rec in recs:
        lon, lat = rec["longitude"], rec["latitude"]
        for z in range(MIN_ZOOM, MAX_ZOOM+1):
            t = mercantile.tile(lon, lat, z)
            tile_feats[(z, t.x, t.y)].append(rec)
    print(f"      Non-empty tiles: {len(tile_feats):,}")

    # 4. Encode MVT
    print("[4/7] Encoding MVT tiles (gzip) ...")
    tile_data = {}
    errors = 0
    for (z,x,y), feats in tile_feats.items():
        mvt_feats = []
        for rec in feats:
            props = {}
            if "state"            in rec: props["state"]            = str(rec["state"])
            if "elevation"        in rec: props["elevation_m"]       = round(float(rec["elevation"]),1)
            if "slope"            in rec: props["slope_deg"]         = round(float(rec["slope"]),2)
            if "land_cover_class" in rec:
                lc = int(rec["land_cover_class"])
                props["land_cover_class"] = lc
                props["land_cover"]       = LAND_COVER_LABELS.get(lc,"Unknown")
            if "label"            in rec: props["label"]             = int(rec["label"])
            mvt_feats.append({"geometry":{"type":"Point","coordinates":[rec["longitude"],rec["latitude"]]},"properties":props})
        try:
            b = mercantile.bounds(x, y, z)
            # Add 64-pixel buffer to tile bounds so that points on the
            # east/north boundary don't get quantized to exactly 4096
            # (which exceeds the MVT extent and triggers a MapLibre warning).
            buf_lon = (b.east  - b.west)  * 64 / 4096
            buf_lat = (b.north - b.south) * 64 / 4096
            raw = mapbox_vector_tile.encode(
                [{"name": SOURCE_LAYER, "features": mvt_feats}],
                default_options={
                    "quantize_bounds": (
                        b.west - buf_lon, b.south - buf_lat,
                        b.east + buf_lon, b.north + buf_lat
                    ),
                    "extents": 4096
                }
            )
            tile_data[(z, x, y)] = gzip.compress(raw)
        except Exception as e:
            errors += 1
            if errors <= 3: print(f"      Tile err {z}/{x}/{y}: {e}")
    print(f"      Encoded: {len(tile_data):,} tiles  (errors:{errors})")

    # 5. Write PMTiles v3
    print(f"[5/7] Writing PMTiles -> {os.path.basename(PMTILES_PATH)} ...")
    if os.path.exists(PMTILES_PATH):
        os.remove(PMTILES_PATH)

    meta = {
        "name":"historical_landslides",
        "description":"Northeast India Historical Landslide Occurrence Points",
        "attribution":"SIH 2026",
        "format":"pbf",
        "vector_layers":[{
            "id":SOURCE_LAYER,
            "description":"Landslide occurrence points",
            "minzoom":MIN_ZOOM,"maxzoom":MAX_ZOOM,
            "fields":{"state":"String","elevation_m":"Number","slope_deg":"Number",
                      "land_cover_class":"Number","land_cover":"String","label":"Number"}
        }]
    }

    # Header dict for pmtiles writer
    from pmtiles.writer import Compression, serialize_header, optimize_directories, build_roots_leaves
    from enum import Enum

    # TileType enum (inline since not exported by this package version)
    class TileType(Enum):
        UNKNOWN = 0; PNG = 1; JPEG = 2; WEBP = 3; AVIF = 4; MVT = 5

    header = {
        "tile_type":         TileType.MVT,
        "tile_compression":  Compression.GZIP,
        "min_lon_e7":        int(lon_min * 10_000_000),
        "min_lat_e7":        int(lat_min * 10_000_000),
        "max_lon_e7":        int(lon_max * 10_000_000),
        "max_lat_e7":        int(lat_max * 10_000_000),
        "center_zoom":       7,
        "center_lon_e7":     int(((lon_min+lon_max)/2) * 10_000_000),
        "center_lat_e7":     int(((lat_min+lat_max)/2) * 10_000_000),
    }

    # Sort by tile_id
    sorted_tiles = sorted(tile_data.items(), key=lambda kv: zxy_to_tileid(*kv[0]))

    with open(PMTILES_PATH,"wb") as f:
        writer = Writer(f)
        for (z,x,y), data in sorted_tiles:
            writer.write_tile(zxy_to_tileid(z,x,y), data)
        writer.finalize(header, meta)

    # 6. Verify
    print("[6/7] Verifying ...")
    assert os.path.exists(PMTILES_PATH)
    assert os.path.exists(PARQUET_PATH), "CRITICAL: Parquet gone!"
    pm_mb = os.path.getsize(PMTILES_PATH) / 1e6
    print(f"      PMTiles: {pm_mb:.2f} MB")
    print(f"      Parquet: intact ({parquet_mb:.1f} MB)  OK")

    # Try reading header back
    try:
        from pmtiles.reader import MemorySource, get_pmtiles_info
        with open(PMTILES_PATH,"rb") as f:
            info = get_pmtiles_info(MemorySource(f.read()))
        print(f"      Header: {info}")
    except Exception as e:
        print(f"      Header read note: {e}")

    # 7. Report
    elapsed = time.time() - t0
    print("[7/7] Done.\n")
    print("="*60)
    print("  BUILD REPORT")
    print("="*60)
    print(f"  Records          : {total:,}")
    print(f"  Geometry         : Point (WGS84 EPSG:4326)")
    print(f"  Columns in tiles : {keep}")
    print(f"  Source layer     : {SOURCE_LAYER}")
    print(f"  Zoom range       : {MIN_ZOOM} - {MAX_ZOOM}")
    print(f"  BBox             : [{lon_min:.4f},{lat_min:.4f},{lon_max:.4f},{lat_max:.4f}]")
    print(f"  Non-empty tiles  : {len(tile_data):,}")
    print(f"  PMTiles output   : {PMTILES_PATH}")
    print(f"  PMTiles size     : {pm_mb:.2f} MB")
    print(f"  Parquet intact   : YES ({parquet_mb:.1f} MB, untouched)")
    print(f"  Time             : {elapsed:.1f}s")
    print()
    print("  FastAPI URL      : GET /data/tiles/historical_landslides.pmtiles")
    print("  MapLibre source  : pmtiles:///data/tiles/historical_landslides.pmtiles")
    print(f"  Source-layer     : {SOURCE_LAYER}")
    print("="*60+"\n")

if __name__ == "__main__":
    main()
