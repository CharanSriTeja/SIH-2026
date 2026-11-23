from pathlib import Path
import h5py


BASE_DIR = Path(__file__).resolve().parent

file_path = (
    BASE_DIR
    / "data"
    / "soil_moisture"
    / "raw"
    / "SMAP_L3_SM_P_E_20260908_R19240_001.h5"
)


print("=" * 70)
print("SMAP HDF5 INSPECTION")
print("=" * 70)
print("File:", file_path)
print()


if not file_path.exists():
    raise FileNotFoundError(f"File not found: {file_path}")


with h5py.File(file_path, "r") as f:

    print("ROOT ATTRIBUTES")
    print("-" * 70)

    for key, value in f.attrs.items():
        print(f"{key}: {value}")

    print()
    print("DATASET / GROUP TREE")
    print("-" * 70)

    def visitor(name, obj):

        if isinstance(obj, h5py.Group):
            print(f"[GROUP]   {name}")

        elif isinstance(obj, h5py.Dataset):
            print(
                f"[DATASET] {name}"
                f" | shape={obj.shape}"
                f" | dtype={obj.dtype}"
            )

            for key, value in obj.attrs.items():

                # Keep output manageable
                if key in [
                    "units",
                    "long_name",
                    "standard_name",
                    "_FillValue",
                    "valid_min",
                    "valid_max",
                    "coordinates",
                    "grid_mapping",
                ]:
                    print(f"           {key}: {value}")

    f.visititems(visitor)


print()
print("=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)