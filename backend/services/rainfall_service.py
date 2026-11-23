"""
Service: rainfall_service.py
Purpose: Live 24-hour regional rainfall pipeline for Northeast India (NER).
Product: MOSDAC INSAT-3DR IMAGER Indian Multispectral Rainfall (3RIMG_L2G_IMR).

Pipeline steps:
1. Discover and parse half-hourly HDF5 files for target 24h window
2. HDF5 reading and validation (squeeze (1,801,901) -> (801,901), mask -999 as NaN)
3. Convert rate (mm/hr) to 30-min depth (mm) and accumulate across valid observations
4. Clip and bilinearly resample onto Model B 200m analysis grid (3921, 4904)
5. Mask output to official NER dissolved state boundaries
6. Save standard COG-compatible GeoTIFF with full metadata
7. Generate Quality Control (QC) report (COMPLETE / PARTIAL / FAILED)
8. Prepare Model B batch input (rainfall populated, soil moisture explicitly stubbed)
"""

import os
import re
import json
import glob
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Tuple

import h5py
import numpy as np
import rasterio
from rasterio.transform import Affine
from rasterio.warp import reproject, Resampling
from rasterio.features import geometry_mask
import shapely.geometry

logger = logging.getLogger("rainfall_service")

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "INSAT3DR_IMR")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed", "rainfall")
NER_GEOJSON_PATH = os.path.join(BASE_DIR, "data", "NER_Boundaries", "ner_states_dissolved.geojson")
MODEL_A_COG_PATH = os.path.join(BASE_DIR, "data", "Model 1 Datasets", "modelA_NER_only_susceptibility_cog.tif")

# INSAT-3DR IMAGER Global Grid Coordinates
# latitude: 801 cells from 40.05 descending to -39.95 (step -0.10 deg)
# longitude: 901 cells from 30.05 ascending to 120.05 (step +0.10 deg)
INSAT_SRC_TRANSFORM = Affine.translation(30.0, 40.1) * Affine.scale(0.1, -0.1)
INSAT_SRC_CRS = "EPSG:4326"
INSAT_HEIGHT = 801
INSAT_WIDTH = 901

# NER Bounding Box (West, South, East, North)
NER_BBOX = [88.0, 21.5, 97.5, 28.5]

# Expected half-hourly observation count for a full 24-hour cycle
EXPECTED_OBSERVATIONS_24H = 48
COMPLETENESS_COMPLETE_THRESHOLD = 80.0  # >= 80% (>= 39 files)
COMPLETENESS_PARTIAL_THRESHOLD = 60.0   # 60% - 79% (29 - 38 files)


def parse_filename_timestamp(filename: str) -> Optional[datetime]:
    """
    Parses timestamp from INSAT-3DR filename.
    Example: 3RIMG_10SEP2026_0015_L2G_IMR_V01R00.h5 -> 2026-09-10 00:15:00
    """
    base = os.path.basename(filename)
    match = re.search(r"3RIMG_(\d{2})([A-Z]{3})(\d{4})_(\d{2})(\d{2})_", base, re.IGNORECASE)
    if match:
        day, month_str, year, hour, minute = match.groups()
        try:
            dt = datetime.strptime(f"{day}{month_str.upper()}{year}_{hour}{minute}", "%d%b%Y_%H%M")
            return dt
        except ValueError:
            pass
    return None


def read_hdf5_rainfall(file_path: str) -> Tuple[np.ndarray, Optional[datetime]]:
    """
    Reads an INSAT-3DR HDF5 file per confirmed structure:
      IMR: shape (1, 801, 901), float32, _FillValue = -999.0, units = mm/hr
      latitude: shape (801,)
      longitude: shape (901,)
      time: shape (1,)
    
    Returns:
      rainfall_rate: (801, 901) float32 array with -999 masked as np.nan
      timestamp: datetime of the observation
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"HDF5 file not found: {file_path}")

    dt = parse_filename_timestamp(file_path)

    with h5py.File(file_path, "r") as f:
        if "IMR" not in f:
            raise KeyError(f"Dataset 'IMR' not found in HDF5 file {file_path}")

        imr = f["IMR"][:]  # shape (1, 801, 901)
        
        # Squeeze leading dimension
        imr_2d = np.squeeze(imr, axis=0).astype(np.float32)  # shape (801, 901)

        # Mask _FillValue (-999) as NaN immediately
        fill_mask = (imr_2d <= -900.0) | np.isnan(imr_2d)
        imr_2d[fill_mask] = np.nan

        # If timestamp wasn't in filename, parse from time dataset if available
        if dt is None and "time" in f:
            try:
                time_val = float(f["time"][0])
                # INSAT time dataset is typically minutes since 2000-01-01 00:00:00
                dt = datetime(2000, 1, 1) + timedelta(minutes=time_val)
            except Exception as e:
                logger.warning(f"Could not parse HDF5 time dataset in {file_path}: {e}")

    return imr_2d, dt


def discover_rainfall_files(
    target_date: str,
    data_dir: str = RAW_DATA_DIR
) -> Dict[str, Any]:
    """
    Discovers all HDF5 files for target 24-hour calendar window (00:00 - 23:59).
    Sorts chronologically, compares against expected 48 half-hour slots,
    and identifies missing intervals.
    """
    target_dt = datetime.strptime(target_date, "%Y-%m-%d")
    start_window = target_dt.replace(hour=0, minute=0, second=0)
    end_window = target_dt.replace(hour=23, minute=59, second=59)

    pattern = os.path.join(data_dir, "**", "*.h5")
    all_files = glob.glob(pattern, recursive=True)

    matched_files = []
    for fp in all_files:
        dt = parse_filename_timestamp(fp)
        if dt and start_window <= dt <= end_window:
            matched_files.append((dt, fp))

    # Sort chronologically
    matched_files.sort(key=lambda x: x[0])

    available_slots = [dt.strftime("%H:%M") for dt, _ in matched_files]
    
    # Generate expected slots: 00:15, 00:45, 01:15, ..., 23:45
    expected_slots = []
    cur = start_window + timedelta(minutes=15)
    while cur <= end_window:
        expected_slots.append(cur.strftime("%H:%M"))
        cur += timedelta(minutes=30)

    missing_slots = [s for s in expected_slots if s not in available_slots]

    file_paths = [fp for _, fp in matched_files]
    count = len(file_paths)
    completeness_pct = round((count / EXPECTED_OBSERVATIONS_24H) * 100.0, 2)

    return {
        "target_date": target_date,
        "window_start": start_window.isoformat(),
        "window_end": end_window.isoformat(),
        "total_files": count,
        "expected_files": EXPECTED_OBSERVATIONS_24H,
        "completeness_pct": completeness_pct,
        "available_slots": available_slots,
        "missing_slots": missing_slots,
        "file_paths": file_paths
    }


def aggregate_24h_rainfall(file_paths: List[str]) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Aggregates half-hourly rainfall rate (mm/hr) into 24-hour accumulated depth (mm).
    
    ACCUMULATION FORMULA:
      depth_mm (per file) = IMR_rate (mm/hr) * 0.5 hours
      accumulation_24h_mm = sum(depth_mm across valid files)
    
    PER-PIXEL MISSING VALUE HANDLING:
      - We do NOT assume missing observations equal zero rainfall.
      - We track the number of valid observations per pixel (valid_count).
      - If a pixel has valid observations in some files but NaN in others,
        we accumulate depth across the valid observations for that pixel.
      - If a pixel has 0 valid observations across the entire window (valid_count == 0),
        the accumulated value is assigned np.nan.
      - mm/hr rates are NEVER averaged across rasters; rates are converted to depth first.
    """
    if not file_paths:
        raise ValueError("No files provided for rainfall accumulation.")

    # Initialize 2D accumulators
    acc_depth = np.zeros((INSAT_HEIGHT, INSAT_WIDTH), dtype=np.float32)
    valid_count = np.zeros((INSAT_HEIGHT, INSAT_WIDTH), dtype=np.int32)

    processed_files = []
    
    for fp in file_paths:
        try:
            imr_rate, dt = read_hdf5_rainfall(fp)
            
            # Rate (mm/hr) to 30-min depth (mm): depth = rate * 0.5
            depth_mm = imr_rate * 0.5
            
            # Identify valid (non-NaN) pixels
            valid_mask = ~np.isnan(depth_mm)
            
            # Accumulate depth and valid observation counts
            acc_depth[valid_mask] += depth_mm[valid_mask]
            valid_count[valid_mask] += 1
            
            processed_files.append(fp)
        except Exception as e:
            logger.error(f"Failed to read file {fp} during accumulation: {e}")

    # Where no valid observations occurred for a pixel, set to NaN
    acc_depth[valid_count == 0] = np.nan

    stats = {
        "processed_file_count": len(processed_files),
        "min_valid_obs_per_pixel": int(np.min(valid_count)),
        "max_valid_obs_per_pixel": int(np.max(valid_count)),
        "mean_valid_obs_per_pixel": float(np.mean(valid_count)),
    }

    return acc_depth, stats


def clip_resample_and_mask(
    insat_rainfall_2d: np.ndarray,
    target_cog_path: str = MODEL_A_COG_PATH,
    geojson_path: str = NER_GEOJSON_PATH
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Clips global INSAT-3DR rainfall raster, bilinearly resamples it onto
    Model B's analysis grid (matching Model A COG: 4904x3921, EPSG:4326),
    and masks cells outside the official NER state boundaries to NaN.
    
    RESAMPLING METHOD CHOICE:
      Bilinear interpolation (Resampling.bilinear) is chosen because accumulated
      precipitation is a spatially continuous physical variable. Bilinear interpolation
      preserves gradient continuity across the 200m analysis cells without introducing
      the jagged stair-step artifacts of nearest-neighbor resampling.
    """
    if not os.path.exists(target_cog_path):
        raise FileNotFoundError(f"Model A COG not found at: {target_cog_path}")
    if not os.path.exists(geojson_path):
        raise FileNotFoundError(f"NER GeoJSON boundary not found at: {geojson_path}")

    # 1. Read target grid profile from Model A COG
    with rasterio.open(target_cog_path) as src:
        target_profile = src.profile.copy()
        dst_transform = src.transform
        dst_crs = src.crs
        dst_height = src.height
        dst_width = src.width

    # 2. Resample from INSAT (801, 901) to Target (3921, 4904) using Bilinear interpolation
    dst_array = np.full((dst_height, dst_width), np.nan, dtype=np.float32)

    reproject(
        source=insat_rainfall_2d,
        destination=dst_array,
        src_transform=INSAT_SRC_TRANSFORM,
        src_crs=INSAT_SRC_CRS,
        dst_transform=dst_transform,
        dst_crs=dst_crs,
        resampling=Resampling.bilinear,
        src_nodata=np.nan,
        dst_nodata=np.nan
    )

    # 3. Mask to actual NER state boundaries from GeoJSON
    with open(geojson_path, "r", encoding="utf-8") as f:
        gj_data = json.load(f)

    geometries = []
    if gj_data.get("type") == "FeatureCollection":
        for feat in gj_data["features"]:
            geometries.append(feat["geometry"])
    elif "geometry" in gj_data:
        geometries.append(gj_data["geometry"])

    # geometry_mask returns True for pixels OUTSIDE the geometries (invert=False)
    outside_mask = geometry_mask(
        geometries=geometries,
        out_shape=(dst_height, dst_width),
        transform=dst_transform,
        invert=False
    )

    # Mask outside pixels as NaN
    dst_array[outside_mask] = np.nan

    # Update profile for output GeoTIFF
    target_profile.update({
        "driver": "GTiff",
        "dtype": "float32",
        "nodata": np.nan,
        "width": dst_width,
        "height": dst_height,
        "count": 1,
        "crs": dst_crs,
        "transform": dst_transform,
        "compress": "lzw",
        "tiled": True,
        "blockxsize": 256,
        "blockysize": 256
    })

    return dst_array, target_profile


def generate_qc_report(
    rainfall_grid: np.ndarray,
    discovery_info: Dict[str, Any],
    accumulation_stats: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Validates data quality, completeness, and value ranges:
      - Checks finite numbers (no inf)
      - Computes min, max, mean of valid rainfall values inside NER
      - Computes NoData percentage
      - Assigns pipeline status: COMPLETE / PARTIAL / FAILED
    """
    total_cells = rainfall_grid.size
    valid_mask = ~np.isnan(rainfall_grid)
    valid_count = int(np.sum(valid_mask))
    nodata_count = total_cells - valid_count
    nodata_pct = round((nodata_count / total_cells) * 100.0, 2)

    has_inf = bool(np.isinf(rainfall_grid).any())

    if valid_count > 0:
        valid_vals = rainfall_grid[valid_mask]
        min_mm = round(float(np.min(valid_vals)), 2)
        max_mm = round(float(np.max(valid_vals)), 2)
        mean_mm = round(float(np.mean(valid_vals)), 2)
    else:
        min_mm = max_mm = mean_mm = 0.0

    completeness_pct = discovery_info["completeness_pct"]

    # Quality status thresholds
    if has_inf or valid_count == 0 or completeness_pct < COMPLETENESS_PARTIAL_THRESHOLD:
        status = "FAILED"
    elif completeness_pct >= COMPLETENESS_COMPLETE_THRESHOLD:
        status = "COMPLETE"
    else:
        status = "PARTIAL"

    report = {
        "date": discovery_info["target_date"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "completeness_pct": completeness_pct,
        "available_observations": discovery_info["total_files"],
        "expected_observations": discovery_info["expected_files"],
        "missing_observations_count": len(discovery_info["missing_slots"]),
        "missing_slots": discovery_info["missing_slots"],
        "has_inf": has_inf,
        "grid_dimensions": list(rainfall_grid.shape),
        "total_cells": total_cells,
        "valid_cells": valid_count,
        "nodata_pct": nodata_pct,
        "rainfall_min_mm": min_mm,
        "rainfall_max_mm": max_mm,
        "rainfall_mean_mm": mean_mm,
        "accumulation_stats": accumulation_stats
    }
    return report


def export_rainfall_geotiff(
    rainfall_grid: np.ndarray,
    profile: Dict[str, Any],
    output_path: str,
    metadata_tags: Dict[str, str]
) -> str:
    """
    Exports the resampled, boundary-masked 24-hour rainfall raster as a GeoTIFF.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with rasterio.open(output_path, "w", **profile) as dst:
        dst.write(rainfall_grid, 1)
        dst.update_tags(**metadata_tags)

    logger.info(f"[RainfallPipeline] Saved 24h rainfall GeoTIFF to: {output_path}")
    return output_path


def run_regional_rainfall_pipeline(
    target_date: Optional[str] = None,
    raw_data_dir: str = RAW_DATA_DIR,
    output_dir: str = PROCESSED_DIR
) -> Dict[str, Any]:
    """
    End-to-end execution of the 24-hour rainfall pipeline for NER:
      1. Determines target operational date (defaults to latest available date)
      2. Discovers matching HDF5 files and checks temporal coverage
      3. Performs rate-to-depth accumulation (mm)
      4. Bilinearly resamples onto Model B 200m grid and masks with NER boundaries
      5. Generates QC report and writes GeoTIFF output
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1. Determine target date if not provided
    if not target_date:
        # Check files in raw directory for latest date
        h5_files = glob.glob(os.path.join(raw_data_dir, "**", "*.h5"), recursive=True)
        dates = []
        for fp in h5_files:
            ts = parse_filename_timestamp(fp)
            if ts:
                dates.append(ts.strftime("%Y-%m-%d"))
        if dates:
            target_date = max(dates)
        else:
            target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    logger.info(f"[RainfallPipeline] Starting 24h rainfall pipeline for date: {target_date}")

    # 2. Discover files & evaluate temporal coverage
    discovery = discover_rainfall_files(target_date, raw_data_dir)
    file_paths = discovery["file_paths"]

    if not file_paths:
        logger.warning(f"[RainfallPipeline] No HDF5 files found for date {target_date}")
        qc_report = {
            "date": target_date,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": "FAILED",
            "completeness_pct": 0.0,
            "available_observations": 0,
            "expected_observations": EXPECTED_OBSERVATIONS_24H,
            "error": f"No INSAT-3DR HDF5 files found in {raw_data_dir} for {target_date}"
        }
        return qc_report

    # 3. Accumulate rainfall (rate mm/hr -> depth mm -> 24h sum)
    acc_depth, acc_stats = aggregate_24h_rainfall(file_paths)

    # 4. Clip, Resample to Model B 200m Grid, and Mask to NER State Boundaries
    rainfall_200m, profile = clip_resample_and_mask(acc_depth)

    # 5. Generate Quality Control Report
    qc_report = generate_qc_report(rainfall_200m, discovery, acc_stats)

    # 6. Save GeoTIFF
    date_compact = target_date.replace("-", "")
    tif_filename = f"rainfall_24h_{date_compact}.tif"
    tif_path = os.path.join(output_dir, tif_filename)

    meta_tags = {
        "PRODUCT": "INSAT-3DR IMAGER 3RIMG_L2G_IMR",
        "VARIABLE": "24-hour Accumulated Precipitation",
        "UNITS": "mm",
        "DATE": target_date,
        "OBSERVATIONS": f"{discovery['total_files']}/{EXPECTED_OBSERVATIONS_24H}",
        "STATUS": qc_report["status"],
        "PROCESSED_AT": qc_report["generated_at"],
        "CRS": "EPSG:4326",
        "RESOLUTION": "~200m"
    }

    export_rainfall_geotiff(rainfall_200m, profile, tif_path, meta_tags)

    # 7. Add file paths to QC Report and save
    qc_filename = f"rainfall_24h_{date_compact}_qc.json"
    qc_path = os.path.join(output_dir, qc_filename)
    qc_report["geotiff_path"] = tif_path
    qc_report["qc_report_path"] = qc_path

    with open(qc_path, "w", encoding="utf-8") as f:
        json.dump(qc_report, f, indent=2)

    # Also update 'latest_qc.json' pointer
    latest_qc_path = os.path.join(output_dir, "latest_qc.json")
    with open(latest_qc_path, "w", encoding="utf-8") as f:
        json.dump(qc_report, f, indent=2)

    logger.info(f"[RainfallPipeline] Completed with status: {qc_report['status']} "
                f"({discovery['total_files']}/{EXPECTED_OBSERVATIONS_24H} files, "
                f"Rainfall: min={qc_report['rainfall_min_mm']}mm, "
                f"mean={qc_report['rainfall_mean_mm']}mm, "
                f"max={qc_report['rainfall_max_mm']}mm)")

    return qc_report


def prepare_model_b_rainfall_input(
    rainfall_geotiff_path: str,
    susceptibility_cog_path: str = MODEL_A_COG_PATH
) -> Dict[str, Any]:
    """
    PART I: MODEL B INTEGRATION (Rainfall Feature Only)
    
    Model B dynamic model expects features:
      ['rain_mm', 'soil_moisture_28_to_100cm', 'susceptibility_score']
      
    This function:
      1. Loads 24h accumulated rainfall raster (rain_mm)
      2. Loads Model A static susceptibility raster (susceptibility_score)
      3. Stubs soil moisture explicitly as None / placeholder with a TODO comment
         (DO NOT fabricate fake soil moisture)
      4. Stubs dynamic risk model inference call behind a TODO comment
         until soil moisture integration is built.
    """
    if not os.path.exists(rainfall_geotiff_path):
        raise FileNotFoundError(f"Rainfall GeoTIFF not found: {rainfall_geotiff_path}")
    if not os.path.exists(susceptibility_cog_path):
        raise FileNotFoundError(f"Model A COG not found: {susceptibility_cog_path}")

    # Read rainfall raster (rain_mm)
    with rasterio.open(rainfall_geotiff_path) as src:
        rain_array = src.read(1)
        rain_profile = src.profile

    # Read Model A susceptibility raster (susceptibility_score)
    with rasterio.open(susceptibility_cog_path) as src:
        susc_array = src.read(1)

    # Valid mask where both rainfall and susceptibility exist inside NER
    valid_mask = (~np.isnan(rain_array)) & (~np.isnan(susc_array))
    valid_count = int(np.sum(valid_mask))

    rain_features = rain_array[valid_mask]
    susceptibility_features = susc_array[valid_mask]

    # =========================================================================
    # TODO: SOIL MOISTURE INTEGRATION
    # Soil moisture (soil_moisture_28_to_100cm) will be integrated in a subsequent
    # pipeline step (e.g. via NASA SMAP / SWI product).
    # DO NOT fabricate synthetic soil moisture values.
    # The feature input is cleanly stubbed as None below.
    # =========================================================================
    soil_moisture_placeholder = None

    input_staging = {
        "total_valid_grid_cells": valid_count,
        "features": {
            "rain_mm": rain_features,
            "susceptibility_score": susceptibility_features,
            "soil_moisture_28_to_100cm": soil_moisture_placeholder,  # STUBBED: Pending soil moisture step
        },
        "feature_names_order": ["rain_mm", "soil_moisture_28_to_100cm", "susceptibility_score"],
        "status": "RAINFALL_STAGED_SOIL_MOISTURE_STUBBED",
        "message": (
            "Rainfall features prepared across 200m NER grid. "
            "Model B risk inference call is stubbed pending soil moisture integration."
        )
    }

    # =========================================================================
    # TODO: MODEL B INFERENCE CALL
    # When soil moisture is integrated, Model B inference will execute across
    # all valid_grid_cells in ONE regional batch:
    #
    # X_batch = np.column_stack([rain_features, soil_moisture_features, susceptibility_features])
    # risk_probs = model_b.predict_proba(X_batch)[:, 1]
    # =========================================================================

    return input_staging
