"""
Script: aggregate_rainfall.py
Purpose: Standalone CLI to execute 24-hour rainfall aggregation, bilinear resampling,
boundary masking, and GeoTIFF creation for Northeast India (NER).
"""

import sys
import os
import argparse
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.rainfall_service import run_regional_rainfall_pipeline

def parse_args():
    parser = argparse.ArgumentParser(description="Aggregate 24-hour INSAT-3DR rainfall data for NER")
    parser.add_argument("--date", type=str, default=None, help="Target date in YYYY-MM-DD format (default: latest available)")
    parser.add_argument("--raw-dir", type=str, default=None, help="Directory containing downloaded HDF5 files")
    parser.add_argument("--output-dir", type=str, default=None, help="Directory to save processed GeoTIFF")
    return parser.parse_args()

def main():
    args = parse_args()
    kwargs = {}
    if args.date:
        kwargs["target_date"] = args.date
    if args.raw_dir:
        kwargs["raw_data_dir"] = args.raw_dir
    if args.output_dir:
        kwargs["output_dir"] = args.output_dir

    print("=== Running 24-Hour Regional Rainfall Aggregation ===")
    report = run_regional_rainfall_pipeline(**kwargs)
    print(json.dumps(report, indent=2))
    return 0 if report.get("status") in ("COMPLETE", "PARTIAL") else 1

if __name__ == "__main__":
    sys.exit(main())
