"""
CLI: run_unified_daily_pipeline.py
Purpose: Command-line entry point to execute the unified daily batch landslide risk pipeline.
Usage:
  python backend/scripts/run_unified_daily_pipeline.py [--force]
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Explicitly load .env
load_dotenv(os.path.join(BASE_DIR, ".env"))

from services.unified_daily_pipeline import run_unified_daily_pipeline


def main():
    force = "--force" in sys.argv
    print("=" * 80)
    print("EXECUTING UNIFIED DAILY LANDSLIDE RISK PIPELINE (NER REGION-WIDE)")
    print("=" * 80)
    qc = run_unified_daily_pipeline(force=force)
    print("\nPIPELINE COMPLETED SUCCESSFULLY:")
    print(f"  Status: {qc.get('status')}")
    print(f"  Observation Date: {qc.get('date')}")
    print(f"  Total Valid Cells: {qc.get('risk_distribution', {}).get('total_cells', 0):,}")
    print(f"  High Risk Cells: {qc.get('risk_distribution', {}).get('high_cells', 0):,}")
    print(f"  Critical Risk Cells: {qc.get('risk_distribution', {}).get('critical_cells', 0):,}")
    print(f"  Districts at Risk: {qc.get('alerts_today', {}).get('districts_at_risk_count', 0)}")
    print(f"  Latest Risk Raster: {qc.get('artifacts', {}).get('latest_risk_tif')}")
    print(f"  Alerts JSON: {qc.get('artifacts', {}).get('alerts_json')}")
    print("=" * 80)


if __name__ == "__main__":
    main()
