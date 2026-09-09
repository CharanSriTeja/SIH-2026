import os
import json
import collections

def inspect():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "roads", "roads.geojson")
    if not os.path.exists(path):
        path = os.path.join(os.path.dirname(__file__), "data", "roads", "ner_roads.geojson")
    
    file_size_bytes = os.path.getsize(path)
    file_size_mb = file_size_bytes / (1024 * 1024)

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    feature_count = len(features)

    geom_types = collections.Counter()
    highway_counts = collections.Counter()
    all_properties = set()
    named_roads = 0
    with_ref = 0
    with_surface = 0
    with_lanes = 0
    invalid_geoms = 0
    min_lon, min_lat = float("inf"), float("inf")
    max_lon, max_lat = float("-inf"), float("-inf")

    for f in features:
        props = f.get("properties", {})
        all_properties.update(props.keys())
        hw = props.get("highway", "unknown")
        highway_counts[hw] += 1
        if props.get("name") and props.get("name") != "Unnamed Road":
            named_roads += 1
        if props.get("ref"):
            with_ref += 1
        if props.get("surface") and props.get("surface") != "Unknown":
            with_surface += 1
        if props.get("lanes") and props.get("lanes") != "N/A":
            with_lanes += 1

        geom = f.get("geometry", {})
        gtype = geom.get("type")
        geom_types[gtype] += 1

        coords = geom.get("coordinates", [])
        if not coords or len(coords) < 2:
            invalid_geoms += 1
            continue

        for pt in coords:
            lon, lat = pt[0], pt[1]
            if lon < min_lon: min_lon = lon
            if lon > max_lon: max_lon = lon
            if lat < min_lat: min_lat = lat
            if lat > max_lat: max_lat = lat

    is_wgs84 = (-180 <= min_lon <= 180) and (-90 <= min_lat <= 90) and (-180 <= max_lon <= 180) and (-90 <= max_lat <= 90)

    print("=== ROADS.GEOJSON INSPECTION REPORT ===")
    print(f"File path: {path}")
    print(f"File size: {file_size_mb:.2f} MB ({file_size_bytes:,} bytes)")
    print(f"Feature count: {feature_count:,}")
    print(f"Geometry types: {dict(geom_types)}")
    print(f"Invalid geometries: {invalid_geoms}")
    print(f"Bounding box: [{min_lon:.5f}, {min_lat:.5f}] to [{max_lon:.5f}, {max_lat:.5f}]")
    print(f"CRS: WGS84 (EPSG:4326) confirmed? {is_wgs84}")
    print(f"Available properties: {sorted(list(all_properties))}")
    print(f"Named roads count: {named_roads:,}")
    print(f"Roads with reference: {with_ref:,}")
    print(f"Roads with surface: {with_surface:,}")
    print(f"Roads with lanes: {with_lanes:,}")
    print(f"Highway classifications (all): {dict(highway_counts.most_common())}")

if __name__ == "__main__":
    inspect()
