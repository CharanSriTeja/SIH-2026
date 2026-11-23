"""
Script: prepare_model_b_rainfall_input.py
Purpose: Prepares Model B dynamic model features across the 200m NER grid.
Populates rain_mm from latest 24h rainfall GeoTIFF, loads susceptibility_score,
and explicitly stubs soil_moisture_28_to_100cm as None with a TODO marker.
"""

import sys
import os
import argparse
import json
import glob

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.rainfall_service import prepare_model_b_rainfall_input, PROCESSED_DIR

def parse_args():
    parser = argparse.ArgumentParser(description="Prepare Model B regional rainfall features")
    parser.add_argument("--geotiff", type=str, default=None, help="Path to 24h rainfall GeoTIFF")
    return parser.parse_args()

def main():
    args = parse_args()
    tif_path = args.geotiff

    if not tif_path:
        # Find latest processed GeoTIFF
        candidates = sorted(glob.glob(os.path.join(PROCESSED_DIR, "rainfall_24h_*.tif")))
        if not candidates:
            print(f"[ERROR] No rainfall GeoTIFF files found in {PROCESSED_DIR}. Run aggregate_rainfall.py first.")
            return 1
        tif_path = candidates[-1]

    print(f"=== Preparing Model B Input from {tif_path} ===")
    staging = prepare_model_b_rainfall_input(tif_path)

    print(f"Total Valid Analysis Grid Cells: {staging['total_valid_grid_cells']:,}")
    print(f"Features Ordering: {staging['feature_names_order']}")
    print(f"Rainfall (rain_mm) count: {len(staging['features']['rain_mm']):,}")
    print(f"Rainfall stats (mm) -> min: {staging['features']['rain_mm'].min():.2f}, "
          f"mean: {staging['features']['rain_mm'].mean():.2f}, "
          f"max: {staging['features']['rain_mm'].max():.2f}")
    print(f"Susceptibility (susceptibility_score) count: {len(staging['features']['susceptibility_score']):,}")
    print(f"Soil Moisture (soil_moisture_28_to_100cm): {staging['features']['soil_moisture_28_to_100cm']} (STUBBED)")
    print(f"\nStatus: {staging['status']}")
    print(f"Message: {staging['message']}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
