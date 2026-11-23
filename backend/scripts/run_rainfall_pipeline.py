"""
Script: run_rainfall_pipeline.py
Purpose: End-to-end orchestrator for the live 24-hour regional rainfall pipeline.
Runs download (optional), aggregation, clipping/masking, GeoTIFF output, QC report,
and Model B feature staging across Northeast India (NER).
Suitable for on-demand manual testing, cron jobs, or Windows Task Scheduler.
"""

import sys
import os
import argparse
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.rainfall_service import (
    run_regional_rainfall_pipeline,
    prepare_model_b_rainfall_input,
    RAW_DATA_DIR,
    PROCESSED_DIR
)
try:
    from data.mdapi import download_rainfall_data
except Exception:
    try:
        from mdapi import download_rainfall_data
    except Exception:
        def download_rainfall_data(*args, **kwargs):
            return {"status": "FAILED", "message": "mdapi not available"}

def parse_args():
    parser = argparse.ArgumentParser(description="End-to-end 24-hour rainfall pipeline for NER")
    parser.add_argument("--date", type=str, default=None, help="Target date (YYYY-MM-DD)")
    parser.add_argument("--download", action="store_true", help="Download new files from MOSDAC before processing")
    parser.add_argument("--raw-dir", type=str, default=RAW_DATA_DIR, help="Directory for raw HDF5 files")
    parser.add_argument("--output-dir", type=str, default=PROCESSED_DIR, help="Directory for output GeoTIFF and QC report")
    return parser.parse_args()

def main():
    args = parse_args()
    
    # 1. Target date determination
    if args.date:
        target_date = args.date
    else:
        # Default to previous day
        target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    print("=" * 60)
    print(f"LIVE 24-HOUR REGIONAL RAINFALL PIPELINE — NORTHEAST INDIA (NER)")
    print(f"Target Date: {target_date}")
    print(f"Timestamp:   {datetime.now().isoformat()}")
    print("=" * 60)

    # 2. Download from MOSDAC if requested
    if args.download:
        print(f"\n>>> Step 1: Downloading from MOSDAC for date {target_date}...")
        dt = datetime.strptime(target_date, "%Y-%m-%d")
        end_date = (dt + timedelta(days=1)).strftime("%Y-%m-%d")
        dl_res = download_rainfall_data(
            start_date=target_date,
            end_date=end_date,
            target_dir=args.raw_dir
        )
        print(f"Download status: {dl_res['status']} — {dl_res['message']}")
    else:
        print(f"\n>>> Step 1: Using existing HDF5 files in {args.raw_dir}")

    # 3. Aggregate, Resample to 200m Grid, Mask to NER, and Generate GeoTIFF + QC
    print(f"\n>>> Step 2: Processing 24h rainfall accumulation and GIS alignment...")
    report = run_regional_rainfall_pipeline(
        target_date=target_date,
        raw_data_dir=args.raw_dir,
        output_dir=args.output_dir
    )

    status = report.get("status", "FAILED")
    print(f"\nPipeline Status: {status}")
    print(f"Completeness:    {report.get('completeness_pct', 0)}% "
          f"({report.get('available_observations', 0)}/{report.get('expected_observations', 48)} files)")
    print(f"Rainfall Depth:  min={report.get('rainfall_min_mm', 0)} mm, "
          f"mean={report.get('rainfall_mean_mm', 0)} mm, "
          f"max={report.get('rainfall_max_mm', 0)} mm")
    print(f"NoData Cells:    {report.get('nodata_pct', 0)}% (outside NER boundary masked)")

    if "geotiff_path" in report and os.path.exists(report["geotiff_path"]):
        print(f"GeoTIFF Path:    {report['geotiff_path']}")
        print(f"QC Report Path:  {report['qc_report_path']}")

        # 4. Prepare Model B Input (Rainfall populated, Soil moisture cleanly stubbed)
        print(f"\n>>> Step 3: Staging Model B batch inputs (Rainfall populated, Soil Moisture stubbed)...")
        staging = prepare_model_b_rainfall_input(report["geotiff_path"])
        print(f"Model B Grid Cells: {staging['total_valid_grid_cells']:,}")
        print(f"Features:           {staging['feature_names_order']}")
        print(f"Soil Moisture:      {staging['features']['soil_moisture_28_to_100cm']} (STUBBED)")
        print(f"Staging Status:     {staging['status']}")
    else:
        print("[ERROR] GeoTIFF was not generated due to pipeline failure.")
        return 1

    print("\n" + "=" * 60)
    print(f"PIPELINE RUN COMPLETED: {status}")
    print("=" * 60)
    return 0 if status in ("COMPLETE", "PARTIAL") else 1

if __name__ == "__main__":
    sys.exit(main())
