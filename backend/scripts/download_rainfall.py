"""
Script: download_rainfall.py
Purpose: Download INSAT-3DR IMAGER rainfall products (3RIMG_L2G_IMR) from MOSDAC.
Supports CLI arguments for date range and bounding box.
"""

import sys
import os
import argparse
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.mdapi import download_rainfall_data

def parse_args():
    parser = argparse.ArgumentParser(description="Download INSAT-3DR rainfall data from MOSDAC")
    parser.add_argument("--date", type=str, default=None, help="Target date (YYYY-MM-DD), downloads that day to the next")
    parser.add_argument("--start-date", type=str, default=None, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", type=str, default=None, help="End date (YYYY-MM-DD)")
    parser.add_argument("--output-dir", type=str, default=None, help="Output directory for HDF5 files")
    parser.add_argument("--bbox", type=str, default="88.0,21.5,97.5,28.5", help="Bounding box (West,South,East,North)")
    return parser.parse_args()

def main():
    args = parse_args()
    
    if args.date:
        start_date = args.date
        dt = datetime.strptime(args.date, "%Y-%m-%d")
        end_date = (dt + timedelta(days=1)).strftime("%Y-%m-%d")
    elif args.start_date and args.end_date:
        start_date = args.start_date
        end_date = args.end_date
    else:
        # Default: yesterday to today
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        today = datetime.now().strftime("%Y-%m-%d")
        start_date = yesterday
        end_date = today

    print(f"=== MOSDAC INSAT-3DR Rainfall Download ===")
    print(f"Start Date: {start_date}")
    print(f"End Date:   {end_date}")
    print(f"BBox:       {args.bbox}")

    result = download_rainfall_data(
        start_date=start_date,
        end_date=end_date,
        target_dir=args.output_dir,
        bounding_box=args.bbox
    )
    print(f"\nDownload Result: {result['status']}")
    print(f"Message: {result['message']}")
    print(f"Files available/downloaded: {len(result.get('files', []))}")
    return 0 if result['status'] in ("SUCCESS", "PARTIAL") else 1

if __name__ == "__main__":
    sys.exit(main())
