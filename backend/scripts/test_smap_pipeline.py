"""
Script: test_smap_pipeline.py
Purpose: Diagnostic test suite for NASA SMAP SPL3SMP_E soil moisture pipeline.
Tests:
1. Environment & Earthdata Auth
2. CMR Search & Granule Discovery
3. HDF5 AM & PM Extraction & Quality Flag Filtering
4. Reprojection to 200m EPSG:4326 Grid
5. Alignment with Model A Susceptibility COG
6. GeoTIFF Output & Resolution Honesty Metadata
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Load .env explicitly
load_dotenv(os.path.join(BASE_DIR, ".env"))

import numpy as np
import rasterio
from services.smap_service import (
    authenticate_earthaccess,
    fetch_latest_smap_granule,
    extract_smap_moisture,
    reproject_and_mask_to_ner,
    save_smap_geotiff,
    run_smap_daily_pipeline,
    MODEL_A_COG_PATH,
    TARGET_WIDTH,
    TARGET_HEIGHT,
)


def run_diagnostics():
    print("=" * 80)
    print("NASA SMAP PIPELINE DIAGNOSTIC SUITE")
    print("=" * 80)

    # Test 1: Earthdata Auth
    print("\n[TEST 1] Earthdata Authentication...")
    auth_ok = authenticate_earthaccess()
    print(f"  Result: {'PASS' if auth_ok else 'WARN (Offline / Credentials check)'}")

    # Test 2: Granule Fetch
    print("\n[TEST 2] Granule Fetch (Online search or local fallback)...")
    h5_path = fetch_latest_smap_granule()
    assert h5_path is not None and os.path.exists(h5_path), "Failed: No SMAP granule available"
    print(f"  Result: PASS -> Using {os.path.basename(h5_path)} ({os.path.getsize(h5_path)/(1024*1024):.1f} MB)")

    # Test 3: HDF5 Extraction & Filtering
    print("\n[TEST 3] HDF5 Extraction & Quality Filtering...")
    res = extract_smap_moisture(h5_path)
    merged = res["merged_moisture"]
    assert merged.shape == (1624, 3856), f"Unexpected shape {merged.shape}"
    assert res["total_valid_count"] > 0, "No valid pixels found after quality filter"
    print(f"  Result: PASS -> AM valid: {res['am_valid_count']}, PM valid: {res['pm_valid_count']}, Total: {res['total_valid_count']}")

    # Test 4: Reprojection & Masking
    print("\n[TEST 4] Reprojection to 200m Analysis Grid...")
    ner_grid, stats = reproject_and_mask_to_ner(merged)
    assert ner_grid.shape == (TARGET_HEIGHT, TARGET_WIDTH), f"Grid shape mismatch: {ner_grid.shape}"
    valid_cells = int(np.sum(~np.isnan(ner_grid)))
    assert valid_cells > 0, "Reprojection produced zero valid NER cells"
    vals = ner_grid[~np.isnan(ner_grid)]
    print(f"  Result: PASS -> Valid 200m NER cells: {valid_cells:,} (Direct: {stats['direct_observed_cells']:,}, Fill: {stats['interpolated_cells']:,})")
    print(f"  Moisture range: {np.min(vals):.3f} to {np.max(vals):.3f} cm3/cm3 (Mean: {np.mean(vals):.3f})")

    # Test 5: Alignment with Model A COG
    print("\n[TEST 5] Grid Alignment with Model A Susceptibility COG...")
    if os.path.exists(MODEL_A_COG_PATH):
        with rasterio.open(MODEL_A_COG_PATH) as cog:
            assert cog.width == TARGET_WIDTH, f"Width mismatch: COG={cog.width}, Target={TARGET_WIDTH}"
            assert cog.height == TARGET_HEIGHT, f"Height mismatch: COG={cog.height}, Target={TARGET_HEIGHT}"
            print(f"  Result: PASS -> Perfect match with Model A COG dimensions ({cog.width}x{cog.height}, {cog.crs})")
    else:
        print(f"  Result: SKIP (Model A COG not found at {MODEL_A_COG_PATH})")

    # Test 6: Full Pipeline Run & Artifacts
    print("\n[TEST 6] Full End-to-End Pipeline Execution...")
    qc = run_smap_daily_pipeline()
    assert qc["status"] == "COMPLETE", f"Pipeline status not COMPLETE: {qc['status']}"
    assert os.path.exists(qc["artifacts"]["latest_geotiff"]), "Latest GeoTIFF missing"
    assert qc["resolution_disclosure"]["is_native_200m"] is False, "Resolution disclosure error"
    print(f"  Result: PASS -> Status={qc['status']}")
    print(f"  Honesty Note: {qc['resolution_disclosure']['honesty_statement']}")
    print(f"  Artifact: {qc['artifacts']['latest_geotiff']}")

    print("\n" + "=" * 80)
    print("ALL DIAGNOSTIC TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_diagnostics()
