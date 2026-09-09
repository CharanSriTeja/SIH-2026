#!/bin/bash
# =========================================================================
# Tippecanoe Vector Tile Generator for Northeast India Road Network
# =========================================================================

INPUT_GEOJSON="../data/roads/roads.geojson"
OUTPUT_MBTILES="../data/roads/roads.mbtiles"

if [ ! -f "$INPUT_GEOJSON" ]; then
    echo "Error: $INPUT_GEOJSON not found!"
    exit 1
fi

echo "Generating roads.mbtiles with Tippecanoe..."
tippecanoe \
  -o "$OUTPUT_MBTILES" \
  -z 14 \
  -Z 5 \
  -l roads \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  --include=name \
  --include=highway \
  --include=ref \
  --include=surface \
  --include=lanes \
  --include=maxspeed \
  --include=osm_id \
  --force \
  "$INPUT_GEOJSON"

echo "MBTiles generation complete: $OUTPUT_MBTILES"
