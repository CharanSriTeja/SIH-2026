from pathlib import Path

import h5py
import numpy as np
import rasterio
from rasterio.transform import from_bounds


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "soil_moisture"
    / "raw"
    / "SMAP_L3_SM_P_E_20260908_R19240_001.h5"
)

OUTPUT_DIR = (
    BASE_DIR
    / "data"
    / "soil_moisture"
    / "processed"
)

OUTPUT_FILE = OUTPUT_DIR / "smap_20260908_ner.tif"


# Northeast India bounding box
WEST = 88.0
SOUTH = 21.5
EAST = 97.5
NORTH = 28.5


# SMAP fill value
FILL_VALUE = -9999.0


# ============================================================
# CREATE OUTPUT DIRECTORY
# ============================================================

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# HDF5 DATASET PATHS
# ============================================================

SOIL_MOISTURE_PATH = (
    "Soil_Moisture_Retrieval_Data_Polar_AM/"
    "soil_moisture"
)

LATITUDE_PATH = (
    "Soil_Moisture_Retrieval_Data_Polar_AM/"
    "latitude"
)

LONGITUDE_PATH = (
    "Soil_Moisture_Retrieval_Data_Polar_AM/"
    "longitude"
)

QUALITY_PATH = (
    "Soil_Moisture_Retrieval_Data_Polar_AM/"
    "retrieval_qual_flag"
)


# ============================================================
# OPEN HDF5
# ============================================================

print("=" * 70)
print("SMAP SOIL MOISTURE PROCESSING")
print("=" * 70)

print("Input:", INPUT_FILE)

if not INPUT_FILE.exists():
    raise FileNotFoundError(
        f"SMAP file not found:\n{INPUT_FILE}"
    )


with h5py.File(INPUT_FILE, "r") as f:

    # --------------------------------------------------------
    # Read native datasets
    # --------------------------------------------------------

    print("\nReading SMAP datasets...")

    soil_moisture = f[SOIL_MOISTURE_PATH][:]
    latitude = f[LATITUDE_PATH][:]
    longitude = f[LONGITUDE_PATH][:]
    quality = f[QUALITY_PATH][:]

    print("Soil moisture shape:", soil_moisture.shape)
    print("Latitude shape:", latitude.shape)
    print("Longitude shape:", longitude.shape)
    print("Quality shape:", quality.shape)


# ============================================================
# VALID DATA MASK
# ============================================================

print("\nApplying basic validity filtering...")

valid = (
    np.isfinite(soil_moisture)
    & (soil_moisture != FILL_VALUE)
    & (soil_moisture >= 0.02)
    & (soil_moisture <= 0.50)
)


print(
    "Valid pixels before geographic crop:",
    int(valid.sum())
)


# ============================================================
# NER GEOGRAPHIC CROP
# ============================================================

print("\nCropping to Northeast India bounding box...")

ner_mask = (
    (longitude >= WEST)
    & (longitude <= EAST)
    & (latitude >= SOUTH)
    & (latitude <= NORTH)
)


valid &= ner_mask


# ============================================================
# CHECK
# ============================================================

if not np.any(valid):
    raise RuntimeError(
        "No valid SMAP soil-moisture pixels found "
        "inside the NER bounding box."
    )


rows, cols = np.where(valid)

row_min = rows.min()
row_max = rows.max()

col_min = cols.min()
col_max = cols.max()


print("\nCrop indices:")
print("Rows:", row_min, "to", row_max)
print("Cols:", col_min, "to", col_max)


# ============================================================
# CROP ARRAYS
# ============================================================

sm_crop = soil_moisture[
    row_min:row_max + 1,
    col_min:col_max + 1
]

lat_crop = latitude[
    row_min:row_max + 1,
    col_min:col_max + 1
]

lon_crop = longitude[
    row_min:row_max + 1,
    col_min:col_max + 1
]


# ============================================================
# APPLY VALID MASK INSIDE CROP
# ============================================================

crop_valid = (
    np.isfinite(sm_crop)
    & (sm_crop != FILL_VALUE)
    & (sm_crop >= 0.02)
    & (sm_crop <= 0.50)
    & (lon_crop >= WEST)
    & (lon_crop <= EAST)
    & (lat_crop >= SOUTH)
    & (lat_crop <= NORTH)
)


output_array = sm_crop.astype(np.float32)

output_array[~crop_valid] = np.nan


# ============================================================
# DETERMINE GEOGRAPHIC EXTENT
# ============================================================

valid_lat = lat_crop[crop_valid]
valid_lon = lon_crop[crop_valid]

west = float(valid_lon.min())
east = float(valid_lon.max())
south = float(valid_lat.min())
north = float(valid_lat.max())


print("\nOutput geographic extent:")
print("West :", west)
print("South:", south)
print("East :", east)
print("North:", north)


# ============================================================
# RASTER TRANSFORM
# ============================================================

height, width = output_array.shape

transform = from_bounds(
    west,
    south,
    east,
    north,
    width,
    height
)


# ============================================================
# WRITE GEOTIFF
# ============================================================

print("\nWriting GeoTIFF...")

with rasterio.open(
    OUTPUT_FILE,
    "w",

    driver="GTiff",

    height=height,
    width=width,
    count=1,

    dtype="float32",

    crs="EPSG:4326",

    transform=transform,

    nodata=np.nan,

    compress="deflate",

) as dst:

    dst.write(
        output_array,
        1
    )

    dst.set_band_description(
        1,
        "SMAP Surface Soil Moisture"
    )

    dst.update_tags(
        product="SPL3SMP_E",
        version="006",
        variable="soil_moisture",
        units="cm3/cm3",
        source="NASA SMAP",
        processing="NER geographic crop"
    )


# ============================================================
# STATISTICS
# ============================================================

valid_output = output_array[
    np.isfinite(output_array)
]


print("\n" + "=" * 70)
print("PROCESSING COMPLETE")
print("=" * 70)

print("Output:", OUTPUT_FILE)
print("Shape:", output_array.shape)
print("Valid pixels:", valid_output.size)

print(
    "Minimum:",
    float(valid_output.min())
)

print(
    "Maximum:",
    float(valid_output.max())
)

print(
    "Mean:",
    float(valid_output.mean())
)