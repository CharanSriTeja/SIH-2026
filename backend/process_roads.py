import os
import json
import osmium

class RoadHandler(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.roads = []
        # North-East India bounding box boundaries
        self.min_lon, self.max_lon = 87.5, 97.5
        self.min_lat, self.max_lat = 21.5, 30.0
        self.valid_highways = {
            'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
            'unclassified', 'residential', 'motorway_link', 'trunk_link',
            'primary_link', 'secondary_link', 'tertiary_link'
        }

    def way(self, w):
        hw = w.tags.get('highway')
        if not hw or hw not in self.valid_highways:
            return

        coords = []
        try:
            for node in w.nodes:
                if node.location.valid():
                    lon, lat = node.location.lon, node.location.lat
                    if self.min_lon <= lon <= self.max_lon and self.min_lat <= lat <= self.max_lat:
                        coords.append([round(lon, 5), round(lat, 5)])
        except Exception:
            return

        if len(coords) < 2:
            return

        props = {
            "name": w.tags.get('name', 'Unnamed Road'),
            "highway": hw,
            "ref": w.tags.get('ref', ''),
            "surface": w.tags.get('surface', ''),
            "lanes": w.tags.get('lanes', ''),
            "maxspeed": w.tags.get('maxspeed', ''),
            "osm_id": str(w.id)   # OSM way ID for traceability back to OpenStreetMap
        }

        self.roads.append({
            "type": "Feature",
            "properties": props,
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            }
        })

def main():
    data_dir = os.path.join(os.path.dirname(__file__), "data", "roads")
    pbf_file = None
    for name in ["north-eastern-zone.osm.pbf", "north-eastern-zone-260907.osm.pbf"]:
        path = os.path.join(data_dir, name)
        if os.path.exists(path):
            pbf_file = path
            break

    if not pbf_file:
        print("Error: PBF file not found in backend/data/roads/", flush=True)
        return

    print(f"Parsing PBF: {pbf_file}...", flush=True)
    handler = RoadHandler()
    handler.apply_file(pbf_file, locations=True, idx='sparse_mem_array')

    print(f"Extracted {len(handler.roads)} road features.", flush=True)

    output_path = os.path.join(data_dir, "ner_roads.geojson")
    geojson_data = {
        "type": "FeatureCollection",
        "features": handler.roads
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Saved road GIS dataset to {output_path} ({size_mb:.2f} MB)", flush=True)

if __name__ == "__main__":
    main()
