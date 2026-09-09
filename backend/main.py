from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import sqlite3
import json
import math
import io

try:
    import rasterio
    from rasterio.windows import from_bounds as window_from_bounds
    from PIL import Image
    import numpy as np
    _RASTER_DEPS = True
except ImportError:
    _RASTER_DEPS = False
    print("[Susceptibility] WARNING: rasterio or Pillow not found — susceptibility tiles will return 503")

app = FastAPI(title="SIH 2026 Landslide GIS API - Northeast India")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
NER_DIR = os.path.join(BASE_DIR, "data", "NER_Boundaries")
ROADS_DIR = os.path.join(BASE_DIR, "data", "roads")
LANDSLIDES_DIR = os.path.join(BASE_DIR, "data", "Landslides Data")
LANDSLIDES_PMTILES = os.path.join(LANDSLIDES_DIR, "historical_landslides.pmtiles")

# Model A — Landslide Susceptibility COG
MODEL1_DIR = os.path.join(BASE_DIR, "data", "Model 1 Datasets")
SUSCEPTIBILITY_COG = os.path.join(MODEL1_DIR, "modelA_NER_only_susceptibility_cog.tif")

# Locate roads.mbtiles
MBTILES_CANDIDATES = [
    os.path.abspath(os.path.join(BASE_DIR, "..", "data", "roads", "roads.mbtiles")),
    os.path.join(ROADS_DIR, "roads.mbtiles"),
    os.path.abspath(os.path.join(BASE_DIR, "..", "data", "roads.mbtiles"))
]

def get_mbtiles_path():
    for p in MBTILES_CANDIDATES:
        if os.path.exists(p) and os.path.getsize(p) > 1024:
            return p
    return None

def get_mbtiles_conn():
    path = get_mbtiles_path()
    if path:
        try:
            # Open SQLite in read-only mode for thread safety and maximum concurrency
            return sqlite3.connect(f"file:{path}?mode=ro", uri=True, check_same_thread=False)
        except Exception:
            return sqlite3.connect(path, check_same_thread=False)
    return None

# Verify MBTiles file is accessible at startup (connection is opened per-request for thread safety)
_mbtiles_available = get_mbtiles_path() is not None
if _mbtiles_available:
    print(f"[MBTiles] Roads tile database found: {get_mbtiles_path()}")
else:
    print("[MBTiles] WARNING: roads.mbtiles not found — road vector tiles will return 404")

# Verify landslide PMTiles
if os.path.exists(LANDSLIDES_PMTILES):
    pm_mb = os.path.getsize(LANDSLIDES_PMTILES) / (1024 * 1024)
    print(f"[PMTiles] Landslide tiles found: {LANDSLIDES_PMTILES} ({pm_mb:.1f} MB)")
else:
    print("[PMTiles] WARNING: historical_landslides.pmtiles not found — run build_landslide_tiles.py")

# Verify susceptibility COG
if os.path.exists(SUSCEPTIBILITY_COG):
    cog_mb = os.path.getsize(SUSCEPTIBILITY_COG) / (1024 * 1024)
    print(f"[Susceptibility] COG found: {SUSCEPTIBILITY_COG} ({cog_mb:.1f} MB)")
else:
    print("[Susceptibility] WARNING: COG not found — run backend/create_susceptibility_cog.py")

# ── Susceptibility colormap (0–1 probability → RGBA) ────────────────────────
# 5-class equal-interval: Very Low → Low → Moderate → High → Very High
# Standard diverging risk palette: green → yellow → red
_SUSC_COLORMAP = [
    # (threshold_max, R, G, B)
    (0.20, 0x1a, 0x96, 0x41),  # Very Low  — green
    (0.40, 0xa6, 0xd9, 0x6a),  # Low       — light green
    (0.60, 0xff, 0xff, 0xbf),  # Moderate  — yellow
    (0.80, 0xfd, 0xae, 0x61),  # High      — orange
    (1.01, 0xd7, 0x19, 0x1c),  # Very High — red
]

def _value_to_rgba(value: float) -> tuple:
    """Map a 0–1 susceptibility value to an RGBA tuple (alpha=200)."""
    for threshold, r, g, b in _SUSC_COLORMAP:
        if value <= threshold:
            return (r, g, b, 200)
    return (0xd7, 0x19, 0x1c, 200)  # fallback: Very High


_TRANSPARENT_TILE = None

def _make_transparent_tile() -> bytes:
    """Return a 256×256 fully transparent PNG (cached)."""
    global _TRANSPARENT_TILE
    if _TRANSPARENT_TILE is None:
        img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        _TRANSPARENT_TILE = buf.getvalue()
    return _TRANSPARENT_TILE

# ============================================================================
# 1. VECTOR TILE SERVING ENDPOINTS (MBTILES / MVT / PBF)
# ============================================================================

@app.get("/tiles/roads/{z}/{x}/{y}.pbf")
@app.get("/tiles/roads/{z}/{x}/{y}.mvt")
def get_road_tile(z: int, x: int, y: int):
    """
    Serve individual Mapbox Vector Tiles (MVT/PBF) directly from roads.mbtiles.
    TMS to XYZ conversion: tms_y = (1 << z) - 1 - y.
    """
    # 1. Validate tile coordinate bounds
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    }

    if z < 0 or z > 22:
        return Response(
            content=json.dumps({"detail": "Invalid zoom level. Must be between 0 and 22."}),
            status_code=400,
            media_type="application/json",
            headers=cors_headers
        )
    
    max_index = (1 << z) - 1
    if x < 0 or x > max_index or y < 0 or y > max_index:
        return Response(
            content=json.dumps({"detail": f"Coordinates out of bounds for zoom {z}."}),
            status_code=400,
            media_type="application/json",
            headers=cors_headers
        )

    # 2. Open a local MBTiles connection for this request thread
    # Using thread-local connections is safer for SQLite under high concurrency
    local_db = get_mbtiles_conn()
    if local_db is None:
        return Response(
            content=json.dumps({"detail": "Vector tiles database (roads.mbtiles) not found."}),
            status_code=404,
            media_type="application/json",
            headers=cors_headers
        )

    # 3. In MBTiles specification, Y coordinate uses TMS convention
    tms_y = (1 << z) - 1 - y

    try:
        cur = local_db.cursor()
        cur.execute(
            "SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?",
            (z, x, tms_y)
        )
        row = cur.fetchone()
    except Exception as e:
        local_db.close()
        return Response(
            content=json.dumps({"detail": f"Database error: {e}"}),
            status_code=500,
            media_type="application/json",
            headers=cors_headers
        )
    finally:
        local_db.close()

    # If tile does not exist (empty area or no road features), return HTTP 204 No Content.
    # MapLibre treats 204 as a valid empty tile without firing _loadTile fetch errors.
    if not row or not row[0]:
        return Response(
            status_code=204,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400, immutable"
            }
        )

    tile_bytes = row[0]

    # Standard vector tile response headers
    headers = {
        "Content-Type": "application/vnd.mapbox-vector-tile",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
        "X-Source-Layer": "roads"
    }

    # Dynamically detect compression type
    if tile_bytes.startswith(b'\x1f\x8b'):
        headers["Content-Encoding"] = "gzip"
    elif tile_bytes.startswith(b'\x78\x9c'):
        headers["Content-Encoding"] = "deflate"

    return Response(content=tile_bytes, media_type="application/vnd.mapbox-vector-tile", headers=headers)


@app.get("/tiles/roads.json")
async def get_roads_tilejson():
    """
    TileJSON 2.2.0 metadata endpoint describing the road vector tileset.
    """
    return {
        "tilejson": "2.2.0",
        "name": "roads",
        "description": "Northeast India Road Network Vector Tiles (OSM)",
        "version": "1.0.0",
        "scheme": "xyz",
        "tiles": [
            "/tiles/roads/{z}/{x}/{y}.pbf"
        ],
        "minzoom": 5,
        "maxzoom": 14,
        "bounds": [87.95972, 21.93356, 97.33081, 29.37639],
        "center": [93.0, 26.0, 7],
        "vector_layers": [
            {
                "id": "roads",
                "description": "Northeast India road network linestrings",
                "minzoom": 5,
                "maxzoom": 14,
                "fields": {
                    "name": "String",
                    "highway": "String",
                    "ref": "String",
                    "surface": "String",
                    "lanes": "String",
                    "maxspeed": "String",
                    "osm_id": "String"
                }
            }
        ],
        "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    }


# ============================================================================
# 2. EXISTING GIS BOUNDARY ENDPOINTS (PRESERVED & WORKING)
# ============================================================================

@app.get("/api/gis/ner-states")
async def get_ner_states():
    dissolved_path = os.path.join(NER_DIR, "ner_states_dissolved.geojson")
    if os.path.exists(dissolved_path):
        return FileResponse(dissolved_path, media_type="application/json")
    
    combined_path = os.path.join(NER_DIR, "ner_states_combined.geojson")
    if os.path.exists(combined_path):
        return FileResponse(combined_path, media_type="application/json")
        
    return {"error": "GeoJSON file not found"}

@app.get("/api/gis/ner-districts")
async def get_ner_districts():
    combined_path = os.path.join(NER_DIR, "ner_states_combined.geojson")
    if os.path.exists(combined_path):
        return FileResponse(combined_path, media_type="application/json")
    return {"error": "GeoJSON file not found"}

@app.get("/api/gis/ner-boundaries")
async def get_ner_boundaries():
    return await get_ner_states()

# Legacy GeoJSON road endpoint (kept for offline GIS / ML preprocessing)
@app.get("/api/gis/roads")
async def get_roads():
    roads_path = os.path.join(ROADS_DIR, "ner_roads.geojson")
    if not os.path.exists(roads_path):
        roads_path = os.path.abspath(os.path.join(BASE_DIR, "..", "data", "roads", "roads.geojson"))
    if os.path.exists(roads_path):
        return FileResponse(roads_path, media_type="application/json")
    return {"error": "roads.geojson not found"}


# ============================================================================
# 3. PMTILES — HISTORICAL LANDSLIDE VECTOR TILES
# ============================================================================

@app.get("/data/tiles/historical_landslides.pmtiles")
async def serve_landslide_pmtiles(request: Request):
    """
    Serve historical_landslides.pmtiles with HTTP Range request support.

    The PMTiles JS protocol (in the browser) issues HTTP Range requests to read
    only the tile data it needs for the current viewport — the entire file is
    never transferred.  FastAPI's FileResponse handles Range headers natively.
    """
    if not os.path.exists(LANDSLIDES_PMTILES):
        return JSONResponse(
            {"error": "historical_landslides.pmtiles not found. Run backend/build_landslide_tiles.py first."},
            status_code=404
        )

    return FileResponse(
        LANDSLIDES_PMTILES,
        media_type="application/octet-stream",
        headers={
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Range",
            "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
            "Cache-Control": "public, max-age=3600",
        }
    )


@app.get("/api/gis/landslides/info")
async def get_landslide_info():
    """Debug endpoint: returns PMTiles file status and basic info."""
    exists = os.path.exists(LANDSLIDES_PMTILES)
    if not exists:
        return {
            "status": "missing",
            "message": "Run python build_landslide_tiles.py to generate the PMTiles file.",
            "path": LANDSLIDES_PMTILES
        }
    size_mb = os.path.getsize(LANDSLIDES_PMTILES) / (1024 * 1024)
    return {
        "status": "ok",
        "path": LANDSLIDES_PMTILES,
        "size_mb": round(size_mb, 2),
        "pmtiles_url": "/data/tiles/historical_landslides.pmtiles",
        "source_layer": "landslides",
        "maplibre_source_url": "pmtiles:///data/tiles/historical_landslides.pmtiles"
    }


# ============================================================================
# 4. SUSCEPTIBILITY RASTER TILE ENDPOINT
# ============================================================================

def _tile_bounds_epsg4326(z: int, x: int, y: int):
    """
    Convert XYZ tile indices to geographic bounds in EPSG:4326 (lon/lat).
    MapLibre uses the standard Web Mercator tile scheme (XYZ / Slippy map).
    """
    n = 2.0 ** z
    lon_min = x / n * 360.0 - 180.0
    lon_max = (x + 1) / n * 360.0 - 180.0
    lat_max_rad = math.atan(math.sinh(math.pi * (1.0 - 2.0 * y / n)))
    lat_min_rad = math.atan(math.sinh(math.pi * (1.0 - 2.0 * (y + 1) / n)))
    lat_min = math.degrees(lat_min_rad)
    lat_max = math.degrees(lat_max_rad)
    return lon_min, lat_min, lon_max, lat_max


@app.get("/tiles/susceptibility/{z}/{x}/{y}.png")
async def get_susceptibility_tile(z: int, x: int, y: int):
    """
    Serve a 256x256 RGBA PNG tile for the Model A landslide susceptibility raster.

    Values (0-1 probability) are mapped to a 5-class green->red colormap.
    Only the geographic window corresponding to the requested tile is read
    from the COG — the full raster is never transferred to the browser.
    """
    png_headers = {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
    }

    if not _RASTER_DEPS:
        return Response(content=_make_transparent_tile(), media_type="image/png", headers=png_headers)

    if not os.path.exists(SUSCEPTIBILITY_COG):
        return Response(content=_make_transparent_tile(), media_type="image/png", headers=png_headers)

    TILE_SIZE = 256

    try:
        lon_min, lat_min, lon_max, lat_max = _tile_bounds_epsg4326(z, x, y)

        with rasterio.open(SUSCEPTIBILITY_COG) as ds:
            rb = ds.bounds  # raster bounding box in EPSG:4326

            # ── Overlap check ─────────────────────────────────────────────────
            # Tile must intersect the raster in BOTH lon and lat dimensions.
            if lon_max <= rb.left or lon_min >= rb.right \
                    or lat_max <= rb.bottom or lat_min >= rb.top:
                return Response(
                    content=_make_transparent_tile(),
                    media_type="image/png",
                    headers=png_headers,
                )

            # ── Clamp tile bbox to raster extent ──────────────────────────────
            clamp_left   = max(lon_min, rb.left)
            clamp_right  = min(lon_max, rb.right)
            clamp_bottom = max(lat_min, rb.bottom)
            clamp_top    = min(lat_max, rb.top)

            # After clamping, the region must still be valid (can degenerate on
            # edge tiles that only partially overlap the raster).
            if clamp_right <= clamp_left or clamp_top <= clamp_bottom:
                return Response(
                    content=_make_transparent_tile(),
                    media_type="image/png",
                    headers=png_headers,
                )

            # ── Build rasterio window ─────────────────────────────────────────
            window = window_from_bounds(
                clamp_left, clamp_bottom, clamp_right, clamp_top,
                transform=ds.transform,
            )

            # ── Output pixel dimensions (proportional to overlap fraction) ────
            lon_frac = (clamp_right - clamp_left) / (lon_max - lon_min)
            lat_frac = (clamp_top - clamp_bottom) / (lat_max - lat_min)
            out_w = max(1, round(TILE_SIZE * lon_frac))
            out_h = max(1, round(TILE_SIZE * lat_frac))

            # ── Read the window (COG overviews provide appropriate zoom level) ─
            raw = ds.read(
                1,
                window=window,
                out_shape=(out_h, out_w),
                resampling=rasterio.enums.Resampling.bilinear,
                masked=True,
            )  # numpy MaskedArray, shape (out_h, out_w)

        # ── Expand scalar mask to array if needed ─────────────────────────────
        mask_arr = np.ma.getmaskarray(raw)   # always returns a bool array
        data_arr = np.asarray(raw)           # underlying float32 values

        # ── Build full 256x256 RGBA canvas (transparent background) ──────────
        rgba = np.zeros((TILE_SIZE, TILE_SIZE, 4), dtype=np.uint8)

        # Pixel offsets: where the clamped sub-region sits within the tile
        off_x = round((clamp_left - lon_min) / (lon_max - lon_min) * TILE_SIZE)
        off_y = round((lat_max - clamp_top)  / (lat_max - lat_min)  * TILE_SIZE)

        # ── Vectorized colormap application ───────────────────────────────────
        # Work on the out_h x out_w sub-array and paste it into the tile canvas.
        valid = (~mask_arr) & np.isfinite(data_arr)  # boolean valid pixels

        if valid.any():
            v = data_arr.copy()
            v[~valid] = 0.0  # safe dummy value for masked pixels

            # Build RGBA sub-image using piecewise conditions
            r_ch = np.zeros(v.shape, dtype=np.uint8)
            g_ch = np.zeros(v.shape, dtype=np.uint8)
            b_ch = np.zeros(v.shape, dtype=np.uint8)
            a_ch = np.zeros(v.shape, dtype=np.uint8)

            # Apply 5-class colormap (thresholds on 0-1 scale)
            # Very Low  0.0-0.2  #1a9641  green
            m0 = valid & (v <= 0.20)
            r_ch[m0], g_ch[m0], b_ch[m0], a_ch[m0] = 0x1a, 0x96, 0x41, 200

            # Low  0.2-0.4  #a6d96a  light green
            m1 = valid & (v > 0.20) & (v <= 0.40)
            r_ch[m1], g_ch[m1], b_ch[m1], a_ch[m1] = 0xa6, 0xd9, 0x6a, 200

            # Moderate  0.4-0.6  #ffffbf  yellow
            m2 = valid & (v > 0.40) & (v <= 0.60)
            r_ch[m2], g_ch[m2], b_ch[m2], a_ch[m2] = 0xff, 0xff, 0xbf, 200

            # High  0.6-0.8  #fdae61  orange
            m3 = valid & (v > 0.60) & (v <= 0.80)
            r_ch[m3], g_ch[m3], b_ch[m3], a_ch[m3] = 0xfd, 0xae, 0x61, 200

            # Very High  0.8-1.0  #d7191c  red
            m4 = valid & (v > 0.80)
            r_ch[m4], g_ch[m4], b_ch[m4], a_ch[m4] = 0xd7, 0x19, 0x1c, 200

            # Stack into (out_h, out_w, 4)
            sub = np.stack([r_ch, g_ch, b_ch, a_ch], axis=-1)

            # Paste into the tile canvas at the correct offset
            end_y = min(off_y + out_h, TILE_SIZE)
            end_x = min(off_x + out_w, TILE_SIZE)
            src_h = end_y - off_y
            src_w = end_x - off_x

            if src_h > 0 and src_w > 0 and off_y >= 0 and off_x >= 0:
                rgba[off_y:end_y, off_x:end_x] = sub[:src_h, :src_w]

        img = Image.fromarray(rgba, mode="RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return Response(
            content=buf.getvalue(),
            media_type="image/png",
            headers=png_headers,
        )

    except Exception as exc:
        print(f"[Susceptibility] Tile {z}/{x}/{y} error: {exc}")
        import traceback
        traceback.print_exc()
        return Response(
            content=_make_transparent_tile(),
            media_type="image/png",
            headers=png_headers,
        )



@app.get("/api/gis/susceptibility/info")
async def get_susceptibility_info():
    """Debug endpoint: returns susceptibility COG status and metadata."""
    if not os.path.exists(SUSCEPTIBILITY_COG):
        return JSONResponse(
            {
                "status": "missing",
                "message": "Run python create_susceptibility_cog.py to generate the COG.",
                "cog_path": SUSCEPTIBILITY_COG,
                "original_tiff": os.path.join(MODEL1_DIR, "modelA_NER_only_susceptibility.tif"),
            },
            status_code=404,
        )

    info = {"status": "ok", "cog_path": SUSCEPTIBILITY_COG}
    info["size_mb"] = round(os.path.getsize(SUSCEPTIBILITY_COG) / 1_048_576, 2)
    info["tile_url_template"] = "/tiles/susceptibility/{z}/{x}/{y}.png"

    if _RASTER_DEPS:
        try:
            with rasterio.open(SUSCEPTIBILITY_COG) as ds:
                info["crs"] = str(ds.crs)
                b = ds.bounds
                info["bounds"] = {
                    "left": round(b.left, 6),
                    "bottom": round(b.bottom, 6),
                    "right": round(b.right, 6),
                    "top": round(b.top, 6),
                }
                info["width"]  = ds.width
                info["height"] = ds.height
                nd = ds.nodata
                # NaN is not JSON-serializable; convert to string
                import math
                if nd is not None and isinstance(nd, float) and math.isnan(nd):
                    info["nodata"] = "nan"
                else:
                    info["nodata"] = nd
                info["overviews"] = ds.overviews(1)
                info["compression"] = str(ds.compression)
                info["block_shapes"] = str(ds.block_shapes)
        except Exception as e:
            info["raster_read_error"] = str(e)

    info["classification"] = [
        {"class": "Very Low",  "min": 0.0,  "max": 0.2,  "color": "#1a9641"},
        {"class": "Low",       "min": 0.2,  "max": 0.4,  "color": "#a6d96a"},
        {"class": "Moderate",  "min": 0.4,  "max": 0.6,  "color": "#ffffbf"},
        {"class": "High",      "min": 0.6,  "max": 0.8,  "color": "#fdae61"},
        {"class": "Very High", "min": 0.8,  "max": 1.0,  "color": "#d7191c"},
    ]
    return JSONResponse(info)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

