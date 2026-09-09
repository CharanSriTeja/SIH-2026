import os
import json
import sqlite3
import gzip as gzip_module
import time
import mercantile
import mapbox_vector_tile
from collections import defaultdict

def generate():
    start_time = time.time()
    print("=== Vector Tile Generation: Northeast India Road Network ===\n")

    # Locate roads.geojson
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    geojson_paths = [
        os.path.join(base_dir, "data", "roads", "roads.geojson"),
        os.path.join(base_dir, "backend", "data", "roads", "ner_roads.geojson"),
        os.path.join(base_dir, "backend", "data", "roads", "roads.geojson")
    ]

    geojson_path = None
    for p in geojson_paths:
        if os.path.exists(p):
            geojson_path = p
            break

    if not geojson_path:
        print("Error: Source roads.geojson not found in data/roads/ or backend/data/roads/")
        return

    print(f"[1/5] Loading source GeoJSON: {geojson_path}")
    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    total_features = len(features)
    print(f"      Loaded {total_features:,} road features.")

    # Validate CRS & calculate bounds
    print("[2/5] Validating Coordinate Reference System (CRS) & geometry bounds...")
    min_lon, min_lat = float("inf"), float("inf")
    max_lon, max_lat = float("-inf"), float("-inf")

    # Road classification tiers
    tier1_types = {'motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link'}
    tier2_types = {'secondary', 'secondary_link'}
    tier3_types = {'tertiary', 'tertiary_link'}
    
    parsed_roads = []
    for f in features:
        geom = f.get("geometry", {})
        coords = geom.get("coordinates", [])
        if not coords or len(coords) < 2:
            continue

        props = f.get("properties", {})
        hw = props.get("highway", "unclassified")

        # Determine road hierarchy tier
        if hw in tier1_types:
            tier = 1
        elif hw in tier2_types:
            tier = 2
        elif hw in tier3_types:
            tier = 3
        else:
            tier = 4

        f_min_lon = min(pt[0] for pt in coords)
        f_max_lon = max(pt[0] for pt in coords)
        f_min_lat = min(pt[1] for pt in coords)
        f_max_lat = max(pt[1] for pt in coords)

        if f_min_lon < min_lon: min_lon = f_min_lon
        if f_max_lon > max_lon: max_lon = f_max_lon
        if f_min_lat < min_lat: min_lat = f_min_lat
        if f_max_lat > max_lat: max_lat = f_max_lat

        # Keep clean attributes
        clean_props = {
            "name": str(props.get("name", "Unnamed Road")),
            "highway": str(hw),
            "ref": str(props.get("ref", "")),
            "surface": str(props.get("surface", "")),
            "lanes": str(props.get("lanes", "")),
            "maxspeed": str(props.get("maxspeed", "")),
            "osm_id": str(props.get("osm_id", props.get("id", "")))
        }

        parsed_roads.append({
            "tier": tier,
            "min_lon": f_min_lon,
            "max_lon": f_max_lon,
            "min_lat": f_min_lat,
            "max_lat": f_max_lat,
            "geometry": geom,
            "properties": clean_props
        })

    is_wgs84 = (-180 <= min_lon <= 180) and (-90 <= min_lat <= 90) and (-180 <= max_lon <= 180) and (-90 <= max_lat <= 90)
    print(f"      Confirmed WGS84 EPSG:4326: {is_wgs84}")
    print(f"      Dataset Bounding Box: [{min_lon:.4f}, {min_lat:.4f}] to [{max_lon:.4f}, {max_lat:.4f}]")

    # Target MBTiles output
    out_dir = os.path.join(base_dir, "data", "roads")
    os.makedirs(out_dir, exist_ok=True)
    mbtiles_path = os.path.join(out_dir, "roads.mbtiles")

    if os.path.exists(mbtiles_path):
        try:
            os.remove(mbtiles_path)
        except Exception:
            pass

    print(f"[3/5] Initializing MBTiles SQLite database at: {mbtiles_path}")
    conn = sqlite3.connect(mbtiles_path)
    cur = conn.cursor()

    cur.execute("CREATE TABLE metadata (name TEXT, value TEXT);")
    cur.execute("CREATE TABLE tiles (zoom_level INTEGER, tile_column INTEGER, tile_row INTEGER, tile_data BLOB);")
    cur.execute("CREATE UNIQUE INDEX tile_index ON tiles (zoom_level, tile_column, tile_row);")

    # Metadata
    metadata = [
        ("name", "roads"),
        ("type", "overlay"),
        ("version", "2"),
        ("description", "Northeast India Road Network Vector Tiles"),
        ("format", "pbf"),
        ("minzoom", "5"),
        ("maxzoom", "14"),
        ("bounds", f"{min_lon:.5f},{min_lat:.5f},{max_lon:.5f},{max_lat:.5f}"),
        ("center", "93.0,26.0,7"),
        ("json", json.dumps({
            "vector_layers": [{
                "id": "roads",
                "description": "Northeast India OSM Road Network",
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
            }]
        }))
    ]
    cur.executemany("INSERT INTO metadata (name, value) VALUES (?, ?);", metadata)
    conn.commit()

    # Generate vector tiles per zoom level
    print("[4/5] Generating vector tiles (zooms 5 to 14)...")
    total_tiles = 0

    for z in range(5, 15):
        z_start = time.time()
        # Filter features based on zoom hierarchy
        if z <= 7:
            active_roads = [r for r in parsed_roads if r["tier"] == 1]
        elif z <= 9:
            active_roads = [r for r in parsed_roads if r["tier"] in (1, 2)]
        elif z <= 11:
            active_roads = [r for r in parsed_roads if r["tier"] in (1, 2, 3)]
        else:
            active_roads = parsed_roads

        # Build tile to road mapping
        tile_roads = defaultdict(list)
        for r in active_roads:
            try:
                for tile in mercantile.tiles(r["min_lon"], r["min_lat"], r["max_lon"], r["max_lat"], [z]):
                    tile_roads[(tile.x, tile.y)].append(r)
            except Exception:
                continue

        # Insert tiles for zoom z
        tile_inserts = []
        for (x, y), r_list in tile_roads.items():
            if not r_list:
                continue
            tile_features = []
            for r in r_list:
                tile_features.append({
                    "geometry": r["geometry"],
                    "properties": r["properties"]
                })

            try:
                # Encode tile with source-layer name 'roads'
                tile_bounds = mercantile.bounds(x, y, z)
                pbf_data = mapbox_vector_tile.encode(
                    [{'name': 'roads', 'features': tile_features}],
                    default_options={'quantize_bounds': (tile_bounds.west, tile_bounds.south, tile_bounds.east, tile_bounds.north)}
                )
                # Compress with gzip for standard MBTiles storage (Content-Encoding: gzip, 0x1f 0x8b header)
                # NOTE: zlib.compress() produces deflate (0x78 0x9c) which MapLibre does NOT support.
                #       gzip_module.compress() produces proper gzip (0x1f 0x8b) which MapLibre decodes natively.
                gzipped_tile = gzip_module.compress(pbf_data)
                # MBTiles uses TMS y: (1 << z) - 1 - y
                tms_y = (1 << z) - 1 - y
                tile_inserts.append((z, x, tms_y, gzipped_tile))
            except Exception as e:
                print(f"Error encoding tile {z}/{x}/{y}: {e}")
                continue

        if tile_inserts:
            cur.executemany("INSERT OR REPLACE INTO tiles (zoom_level, tile_column, tile_row, tile_data) VALUES (?, ?, ?, ?);", tile_inserts)
            conn.commit()
            total_tiles += len(tile_inserts)
            print(f"      Zoom {z:2d}: {len(tile_inserts):,d} tiles ({time.time() - z_start:.2f}s)")

    conn.close()

    file_size_mb = os.path.getsize(mbtiles_path) / (1024 * 1024)
    print(f"\n[5/5] SUCCESS! Generated {total_tiles:,} vector tiles in {time.time() - start_time:.1f}s.")
    print(f"      MBTiles file: {mbtiles_path} ({file_size_mb:.2f} MB)")
    print("      Source-layer name in vector tiles: 'roads'")

if __name__ == "__main__":
    generate()
