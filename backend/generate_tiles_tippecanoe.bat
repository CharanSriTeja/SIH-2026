@echo off
REM =========================================================================
REM Tippecanoe Vector Tile Generator for Northeast India Road Network
REM =========================================================================

set INPUT_GEOJSON=..\data\roads\roads.geojson
set OUTPUT_MBTILES=..\data\roads\roads.mbtiles

echo Checking roads.geojson...
if not exist "%INPUT_GEOJSON%" (
    echo Error: %INPUT_GEOJSON% not found!
    exit /b 1
)

echo Generating roads.mbtiles with Tippecanoe...
tippecanoe ^
  -o "%OUTPUT_MBTILES%" ^
  -z 14 ^
  -Z 5 ^
  -l roads ^
  --drop-densest-as-needed ^
  --extend-zooms-if-still-dropping ^
  --include=name ^
  --include=highway ^
  --include=ref ^
  --include=surface ^
  --include=lanes ^
  --include=maxspeed ^
  --include=osm_id ^
  --force ^
  "%INPUT_GEOJSON%"

echo MBTiles generation complete: %OUTPUT_MBTILES%
