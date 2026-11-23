"""
Test script: test_rainfall_pipeline.py
Validates all 10 deliverables for the 24-hour regional rainfall pipeline.
"""

import os
import sys
import json
import numpy as np
import rasterio

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.rainfall_service import (
    read_hdf5_rainfall,
    discover_rainfall_files,
    aggregate_24h_rainfall,
    clip_resample_and_mask,
    export_rainfall_geotiff,
    generate_qc_report,
    prepare_model_b_rainfall_input,
    run_regional_rainfall_pipeline,
    RAW_DATA_DIR,
    PROCESSED_DIR
)


def test_1_hdf5_reader():
    print("[TEST 1] HDF5 Reader Structure & Fill Value Masking...")
    sample_file = os.path.join(RAW_DATA_DIR, "3RIMG_L2G_IMR", "2026", "10SEP", "3RIMG_10SEP2026_0015_L2G_IMR_V01R00.h5")
    assert os.path.exists(sample_file), f"Sample file not found: {sample_file}"

    data, dt = read_hdf5_rainfall(sample_file)
    assert data.shape == (801, 901), f"Expected shape (801, 901), got {data.shape}"
    assert data.dtype == np.float32, f"Expected float32, got {data.dtype}"
    assert not (data <= -900).any(), "Found unmasked -999 fill values!"
    assert dt is not None, "Failed to parse observation timestamp"
    print(f"  PASS: Squeezed shape={data.shape}, Timestamp={dt}, Valid pixels={np.sum(~np.isnan(data))}")


def test_2_discovery_and_temporal_completeness():
    print("[TEST 2] File Discovery & Temporal Validation...")
    discovery = discover_rainfall_files("2026-09-10", RAW_DATA_DIR)
    assert discovery["total_files"] == 35, f"Expected 35 files, got {discovery['total_files']}"
    assert discovery["expected_files"] == 48
    assert round(discovery["completeness_pct"], 2) == 72.92
    assert len(discovery["missing_slots"]) == 13
    print(f"  PASS: 35/48 files discovered ({discovery['completeness_pct']}%), missing={len(discovery['missing_slots'])} slots")


def test_3_rate_to_depth_aggregation():
    print("[TEST 3] Rate-to-Depth Conversion & Accumulation...")
    discovery = discover_rainfall_files("2026-09-10", RAW_DATA_DIR)
    acc_depth, stats = aggregate_24h_rainfall(discovery["file_paths"][:5]) # Test with 5 files
    
    assert acc_depth.shape == (801, 901)
    # Check that depth is non-negative and finite where valid
    valid_acc = acc_depth[~np.isnan(acc_depth)]
    assert (valid_acc >= 0.0).all(), "Rainfall depth cannot be negative!"
    assert not np.isinf(valid_acc).any(), "Found infinite values in rainfall depth!"
    print(f"  PASS: 5-file depth accumulation max={np.max(valid_acc):.2f}mm, valid cells={len(valid_acc)}")


def test_4_resampling_and_boundary_masking():
    print("[TEST 4] Bilinear Resampling to 200m Model A Grid & Boundary Masking...")
    sample_file = os.path.join(RAW_DATA_DIR, "3RIMG_L2G_IMR", "2026", "10SEP", "3RIMG_10SEP2026_0015_L2G_IMR_V01R00.h5")
    data, _ = read_hdf5_rainfall(sample_file)
    depth = data * 0.5

    resampled, profile = clip_resample_and_mask(depth)
    assert resampled.shape == (3921, 4904), f"Expected (3921, 4904), got {resampled.shape}"
    assert profile["crs"].to_string() == "EPSG:4326"
    assert profile["width"] == 4904
    assert profile["height"] == 3921
    
    # Cells outside NER should be NaN
    outside_cells = np.isnan(resampled)
    assert np.sum(outside_cells) > 0, "No cells were masked outside the NER boundary!"
    print(f"  PASS: Resampled to {resampled.shape}, masked outside NER boundary successfully")


def test_5_geotiff_and_qc():
    print("[TEST 5] GeoTIFF Output & Quality Control Verification...")
    report = run_regional_rainfall_pipeline("2026-09-10")
    assert report["status"] in ("COMPLETE", "PARTIAL"), f"Unexpected status: {report['status']}"
    assert os.path.exists(report["geotiff_path"]), f"GeoTIFF file not found: {report['geotiff_path']}"
    assert os.path.exists(report["qc_report_path"]), f"QC file not found: {report['qc_report_path']}"

    with rasterio.open(report["geotiff_path"]) as src:
        assert src.shape == (3921, 4904)
        assert src.crs.to_string() == "EPSG:4326"
        assert src.tags().get("UNITS") == "mm"
        assert src.tags().get("PRODUCT") == "INSAT-3DR IMAGER 3RIMG_L2G_IMR"

    print(f"  PASS: GeoTIFF verified at {report['geotiff_path']}")
    print(f"  PASS: QC Report verified with status {report['status']}")


def test_6_model_b_input_preparation():
    print("[TEST 6] Model B Input Staging (Rainfall populated, Soil Moisture stubbed)...")
    tif_path = os.path.join(PROCESSED_DIR, "rainfall_24h_20260910.tif")
    staging = prepare_model_b_rainfall_input(tif_path)

    assert staging["features"]["rain_mm"] is not None
    assert len(staging["features"]["rain_mm"]) > 0
    assert staging["features"]["soil_moisture_28_to_100cm"] is None, "Soil moisture should be None / stubbed!"
    assert staging["status"] == "RAINFALL_STAGED_SOIL_MOISTURE_STUBBED"
    print(f"  PASS: Model B input staged for {staging['total_valid_grid_cells']:,} cells with soil moisture cleanly stubbed")


def main():
    print("=" * 60)
    print("RUNNING REGIONAL RAINFALL PIPELINE TEST SUITE")
    print("=" * 60)
    test_1_hdf5_reader()
    test_2_discovery_and_temporal_completeness()
    test_3_rate_to_depth_aggregation()
    test_4_resampling_and_boundary_masking()
    test_5_geotiff_and_qc()
    test_6_model_b_input_preparation()
    print("\nALL 6 TEST SUITES PASSED SUCCESSFULLY!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
