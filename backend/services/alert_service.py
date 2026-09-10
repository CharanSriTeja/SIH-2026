import os
import sqlite3
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
import uuid

from config import settings
from services.sms import (
    get_sms_service,
    sanitize_phone_number,
    mask_phone_number,
    is_valid_indian_mobile
)
from services.prediction_service import prediction_service

logger = logging.getLogger("landslide_sms.alert_service")

ALERTS_DB_PATH = os.path.join(settings.BASE_DIR, "data", "alerts_history.db")

def _hash_phone(phone: str) -> str:
    """Returns SHA-256 hash of sanitized phone for safe tracking & indexing."""
    sanitized = sanitize_phone_number(phone)
    return hashlib.sha256(sanitized.encode("utf-8")).hexdigest()

def init_alerts_db():
    """Initializes the alerts SQLite database and history table."""
    try:
        os.makedirs(os.path.dirname(ALERTS_DB_PATH), exist_ok=True)
        conn = sqlite3.connect(ALERTS_DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS alerts_history (
                id TEXT PRIMARY KEY,
                recipient_masked TEXT NOT NULL,
                recipient_hash TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                location_name TEXT,
                latitude REAL,
                longitude REAL,
                message TEXT,
                provider TEXT NOT NULL,
                status TEXT NOT NULL,
                reference_id TEXT,
                error_message TEXT,
                created_at TEXT NOT NULL
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_alerts_hash_created ON alerts_history(recipient_hash, created_at)")
        conn.commit()
        conn.close()
        logger.info("Alerts history database initialized at %s", ALERTS_DB_PATH)
    except Exception as e:
        logger.error("Failed to initialize alerts database: %s", str(e), exc_info=True)

class AlertService:
    """
    Central emergency alert service coordinating landslide risk evaluation,
    cooldown throttling, duplicate suppression, and SMS dispatch via MSG91.
    """

    def __init__(self):
        init_alerts_db()
        self.cooldown_minutes = settings.ALERT_COOLDOWN_MINUTES
        self.sms_provider = get_sms_service()

    def _check_cooldown(self, phone_hash: str) -> Optional[int]:
        """
        Checks if an alert was dispatched to this recipient within the cooldown window.
        Returns remaining cooldown minutes if in cooldown, None if cleared.
        """
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(minutes=self.cooldown_minutes)).isoformat()
            conn = sqlite3.connect(ALERTS_DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                SELECT created_at FROM alerts_history
                WHERE recipient_hash = ? AND status IN ('SENT', 'SUBMITTED')
                AND created_at >= ?
                ORDER BY created_at DESC LIMIT 1
            """, (phone_hash, cutoff))
            row = cur.fetchone()
            conn.close()

            if row:
                last_sent_dt = datetime.fromisoformat(row[0])
                elapsed_minutes = (datetime.now(timezone.utc) - last_sent_dt).total_seconds() / 60.0
                remaining = max(1, int(self.cooldown_minutes - elapsed_minutes))
                return remaining
        except Exception as e:
            logger.error("Error checking alert cooldown: %s", str(e))
        return None

    def _log_alert(
        self,
        alert_id: str,
        recipient_masked: str,
        recipient_hash: str,
        risk_level: str,
        location_name: Optional[str],
        latitude: Optional[float],
        longitude: Optional[float],
        message: str,
        provider: str,
        status: str,
        reference_id: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Records an alert dispatch attempt into SQLite for audit and history."""
        try:
            conn = sqlite3.connect(ALERTS_DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO alerts_history (
                    id, recipient_masked, recipient_hash, risk_level, location_name,
                    latitude, longitude, message, provider, status, reference_id,
                    error_message, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert_id,
                recipient_masked,
                recipient_hash,
                risk_level,
                location_name or "Northeast Region",
                latitude,
                longitude,
                message,
                provider,
                status,
                reference_id,
                error_message,
                datetime.now(timezone.utc).isoformat()
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error("Failed to log alert to database: %s", str(e))

    def send_alert(
        self,
        phone_number: str,
        risk_level: str = "HIGH",
        location_name: Optional[str] = None,
        custom_message: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        template_id: Optional[str] = None,
        variables: Optional[Dict[str, Any]] = None,
        bypass_cooldown: bool = False
    ) -> Dict[str, Any]:
        """
        Processes and sends an emergency SMS alert to a resident.
        Enforces cooldown and DLT template formatting.
        """
        alert_id = f"alt-{uuid.uuid4().hex[:10]}"
        masked = mask_phone_number(phone_number)
        phone_hash = _hash_phone(phone_number)

        if not is_valid_indian_mobile(phone_number):
            return {
                "success": False,
                "status": "INVALID_PHONE",
                "message": "Invalid Indian mobile number. Please supply a 10-digit number starting with 6-9.",
                "alert_id": alert_id,
                "masked_recipient": masked
            }

        # Cooldown verification
        if not bypass_cooldown:
            remaining_cooldown = self._check_cooldown(phone_hash)
            if remaining_cooldown is not None:
                logger.warning("Alert throttled for %s. Remaining cooldown: %d minutes", masked, remaining_cooldown)
                return {
                    "success": False,
                    "status": "THROTTLED",
                    "message": f"Alert already dispatched recently. In cooldown window for {remaining_cooldown} more minutes.",
                    "cooldown_remaining_minutes": remaining_cooldown,
                    "alert_id": alert_id,
                    "masked_recipient": masked
                }

        # Format alert message and DLT variables
        loc = location_name or (f"Lat: {round(latitude, 3)}, Lon: {round(longitude, 3)}" if latitude and longitude else "Northeast Region")
        action_text = custom_message or "High landslide susceptibility detected. Avoid steep slope cuttings and stay vigilant."
        
        full_text = f"LANDSLIDE ALERT [{risk_level.upper()}]: Threat detected near {loc}. {action_text} Emergency Help: 1078"

        # Construct DLT Flow template variables (var1: risk, var2: location, var3: action, var4: help)
        template_vars = variables or {
            "var1": risk_level.upper(),
            "var2": loc[:30],
            "var3": action_text[:80],
            "var4": "NDRF: 1078"
        }

        # Dispatch via configured SMS provider (MSG91)
        result = self.sms_provider.send_sms(
            phone_number=phone_number,
            message=full_text,
            template_id=template_id,
            variables=template_vars
        )

        status = "SENT" if result.get("success") else "FAILED"
        self._log_alert(
            alert_id=alert_id,
            recipient_masked=masked,
            recipient_hash=phone_hash,
            risk_level=risk_level,
            location_name=loc,
            latitude=latitude,
            longitude=longitude,
            message=full_text,
            provider=result.get("provider", "msg91"),
            status=status,
            reference_id=result.get("reference_id"),
            error_message=result.get("message") if not result.get("success") else None
        )

        return {
            "success": result.get("success", False),
            "status": status,
            "message": result.get("message", "Dispatched"),
            "alert_id": alert_id,
            "provider": result.get("provider", "msg91"),
            "reference_id": result.get("reference_id"),
            "masked_recipient": masked,
            "risk_level": risk_level,
            "location": loc
        }

    def dispatch_hazard_assessment_alert(
        self,
        latitude: float,
        longitude: float,
        phone_number: str,
        location_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs live risk assessment via Model B for the given coordinates,
        and triggers an alert if risk is elevated (High or Critical).
        """
        prediction = prediction_service.get_full_risk_assessment(latitude, longitude)

        risk_level = prediction.get("risk_level", "Unknown")
        is_outside = prediction.get("is_outside_ner", False)

        if is_outside:
            return {
                "success": False,
                "status": "OUTSIDE_COVERAGE",
                "message": "Coordinates are outside the Northeast India landslide monitoring zone. No alerts dispatched.",
                "prediction": prediction
            }

        should_alert = risk_level in ["High", "Critical"]
        alert_outcome = None

        if should_alert:
            advisory = "Live rainfall and slope sensor data indicate acute landslide hazard. Stay prepared for relocation."
            alert_outcome = self.send_alert(
                phone_number=phone_number,
                risk_level=risk_level,
                location_name=location_name,
                custom_message=advisory,
                latitude=latitude,
                longitude=longitude
            )
        else:
            alert_outcome = {
                "success": True,
                "status": "NOT_REQUIRED",
                "message": f"Assessed risk is {risk_level}. No emergency SMS required at this threshold."
            }

        return {
            "risk_level": risk_level,
            "risk_score": prediction.get("risk_score"),
            "susceptibility_score": prediction.get("susceptibility_score"),
            "rainfall_24hr": prediction.get("rainfall_24hr"),
            "soil_moisture": prediction.get("soil_moisture"),
            "alert_dispatched": should_alert,
            "alert_outcome": alert_outcome
        }

    def get_recent_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves recent alerts with privacy-masked recipient details."""
        try:
            conn = sqlite3.connect(ALERTS_DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("""
                SELECT id, recipient_masked, risk_level, location_name, latitude, longitude,
                       message, provider, status, reference_id, error_message, created_at
                FROM alerts_history
                ORDER BY created_at DESC
                LIMIT ?
            """, (max(1, min(limit, 200)),))
            rows = [dict(row) for row in cur.fetchall()]
            conn.close()
            return rows
        except Exception as e:
            logger.error("Failed to fetch alerts history: %s", str(e))
            return []

_alert_service_instance: Optional[AlertService] = None

def get_alert_service() -> AlertService:
    """Singleton getter for AlertService."""
    global _alert_service_instance
    if _alert_service_instance is None:
        _alert_service_instance = AlertService()
    return _alert_service_instance
