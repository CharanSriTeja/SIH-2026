import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Machine Learning Models & Master Data Paths
MODEL_A_PATH = os.getenv(
    "MODEL_A_PATH", 
    os.path.join(BASE_DIR, "data", "Models", "model_a_random_forest.pkl")
)
MODEL_A_FEATURE_INFO_PATH = os.getenv(
    "MODEL_A_FEATURE_INFO_PATH", 
    os.path.join(BASE_DIR, "data", "Models", "model_a_feature_info.pkl")
)
DEFAULT_MODEL_B = os.path.join(BASE_DIR, "data", "Models", "model_b_dynamic.pkl")
ALT_MODEL_B = os.path.join(BASE_DIR, "data", "Models", "randomforest_model_a_final.pkl")
FALLBACK_MODEL_B = os.path.join(BASE_DIR, "data", "Models", "random_forest_model_b.pkl")
MODEL_B_PATH = os.getenv(
    "MODEL_B_PATH", 
    DEFAULT_MODEL_B if os.path.exists(DEFAULT_MODEL_B) 
    else (ALT_MODEL_B if os.path.exists(ALT_MODEL_B) else FALLBACK_MODEL_B)
)
# Candidate paths for master grid parquet
DEFAULT_MASTER_GRID = os.path.join(BASE_DIR, "data", "Model 1 Datasets", "static_features_master_cleaned_v2.parquet")
FALLBACK_MASTER_GRID = os.path.join(BASE_DIR, "data", "Model 1 Datasets", "master_200m.parquet")

MASTER_GRID_PARQUET_PATH = os.getenv(
    "MASTER_GRID_PARQUET_PATH", 
    DEFAULT_MASTER_GRID if os.path.exists(DEFAULT_MASTER_GRID) else FALLBACK_MASTER_GRID
)

# Freshness window for cached user location (in hours)
LOCATION_FRESHNESS_HOURS = float(os.getenv("LOCATION_FRESHNESS_HOURS", "24.0"))

# Northeast Region (NER) rough extent coordinates for primary coverage checks
NER_LAT_MIN = 21.0
NER_LAT_MAX = 30.0
NER_LON_MIN = 88.0
NER_LON_MAX = 98.0

# Brevo (Transactional SMS) Configuration
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "").strip()
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "SIH2026").strip()
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# MSG91 SMS Gateway Configuration (India DLT / Emergency Alerts)
MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY", "").strip()
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "BHURAK").strip()
MSG91_TEMPLATE_ID = os.getenv("MSG91_TEMPLATE_ID", "").strip()
MSG91_ENABLED = os.getenv("MSG91_ENABLED", "true").lower() == "true"
ALERT_COOLDOWN_MINUTES = int(os.getenv("ALERT_COOLDOWN_MINUTES", "60"))

class Settings:
    BASE_DIR = BASE_DIR
    MODEL_A_PATH = MODEL_A_PATH
    MODEL_A_FEATURE_INFO_PATH = MODEL_A_FEATURE_INFO_PATH
    MODEL_B_PATH = MODEL_B_PATH
    MASTER_GRID_PARQUET_PATH = MASTER_GRID_PARQUET_PATH
    LOCATION_FRESHNESS_HOURS = LOCATION_FRESHNESS_HOURS
    NER_LAT_MIN = NER_LAT_MIN
    NER_LAT_MAX = NER_LAT_MAX
    NER_LON_MIN = NER_LON_MIN
    NER_LON_MAX = NER_LON_MAX
    BREVO_API_KEY = BREVO_API_KEY
    BREVO_SENDER_NAME = BREVO_SENDER_NAME
    DEV_MODE = DEV_MODE
    MSG91_AUTH_KEY = MSG91_AUTH_KEY
    MSG91_SENDER_ID = MSG91_SENDER_ID
    MSG91_TEMPLATE_ID = MSG91_TEMPLATE_ID
    MSG91_ENABLED = MSG91_ENABLED
    ALERT_COOLDOWN_MINUTES = ALERT_COOLDOWN_MINUTES

settings = Settings()


