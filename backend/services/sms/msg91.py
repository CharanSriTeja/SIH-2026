import re
import json
import logging
import requests
from typing import Dict, Any, Optional
from config import settings
from services.sms.base import BaseSMSProvider

logger = logging.getLogger("landslide_sms.msg91")

def sanitize_phone_number(phone: str) -> str:
    """
    Sanitizes and normalizes an Indian phone number to 91XXXXXXXXXX format.
    Removes '+', spaces, hyphens, and other non-digit characters.
    """
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        return f"91{digits}"
    elif len(digits) == 11 and digits.startswith("0"):
        return f"91{digits[1:]}"
    elif len(digits) == 12 and digits.startswith("91"):
        return digits
    return digits

def mask_phone_number(phone: str) -> str:
    """
    Masks a phone number for privacy/security display.
    Example: '919876543210' -> '+91 98765*****'
    """
    clean = sanitize_phone_number(phone)
    if len(clean) == 12 and clean.startswith("91"):
        return f"+91 {clean[2:7]}*****"
    elif len(clean) >= 6:
        return f"+{clean[:4]}*****{clean[-2:]}"
    return "****"

def is_valid_indian_mobile(phone: str) -> bool:
    """
    Validates whether the sanitized number is a valid 10-digit Indian mobile with 91 prefix.
    Indian mobile numbers start with 6, 7, 8, or 9.
    """
    sanitized = sanitize_phone_number(phone)
    return bool(re.match(r"^91[6-9]\d{9}$", sanitized))

class MSG91Provider(BaseSMSProvider):
    """
    Production-ready SMS provider integrating MSG91 Flow API v5 for
    disaster early-warning and landslide notifications in compliance with DLT.
    """

    FLOW_API_URL = "https://control.msg91.com/api/v5/flow/"

    def __init__(
        self,
        auth_key: Optional[str] = None,
        sender_id: Optional[str] = None,
        default_template_id: Optional[str] = None,
        enabled: Optional[bool] = None
    ):
        self.auth_key = auth_key if auth_key is not None else settings.MSG91_AUTH_KEY
        self.sender_id = sender_id if sender_id is not None else settings.MSG91_SENDER_ID
        self.default_template_id = default_template_id if default_template_id is not None else settings.MSG91_TEMPLATE_ID
        self.enabled = enabled if enabled is not None else settings.MSG91_ENABLED

    def _is_configured(self) -> bool:
        if not self.enabled:
            return False
        if not self.auth_key or self.auth_key in ("your_msg91_auth_key_here", "dummy_auth_key"):
            return False
        return True

    def send_sms(
        self,
        phone_number: str,
        message: str,
        template_id: Optional[str] = None,
        variables: Optional[Dict[str, Any]] = None,
        sender_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatches SMS via MSG91 Flow API v5.
        """
        masked = mask_phone_number(phone_number)
        sanitized = sanitize_phone_number(phone_number)

        if not is_valid_indian_mobile(phone_number):
            logger.warning("Rejected SMS dispatch to invalid mobile format: %s", masked)
            return {
                "success": False,
                "message": f"Invalid Indian phone number format. Expected 10 digits starting with 6-9.",
                "provider": "msg91",
                "reference_id": None,
                "status_code": 400,
                "masked_recipient": masked
            }

        if not self._is_configured():
            logger.info("MSG91 SMS dispatch simulated (service not configured or disabled). Recipient: %s", masked)
            return {
                "success": False,
                "message": "MSG91 SMS service is currently disabled or API credentials are not set in environment.",
                "provider": "msg91",
                "reference_id": None,
                "status_code": 0,
                "masked_recipient": masked
            }

        active_template = template_id or self.default_template_id
        if not active_template or active_template == "your_approved_flow_template_id":
            logger.error("MSG91 Flow dispatch failed: No valid template_id configured.")
            return {
                "success": False,
                "message": "No valid MSG91 Flow template ID provided or configured.",
                "provider": "msg91",
                "reference_id": None,
                "status_code": 400,
                "masked_recipient": masked
            }

        recipient_payload: Dict[str, Any] = {
            "mobiles": sanitized
        }

        # Populate template variables (var1, var2, etc. or named variables according to template)
        if variables:
            recipient_payload.update(variables)
        else:
            # Fallback default variable mapping
            recipient_payload["var1"] = message[:30]
            recipient_payload["var2"] = message

        payload: Dict[str, Any] = {
            "template_id": active_template,
            "short_url": "0",
            "recipients": [recipient_payload]
        }

        active_sender = sender_id or self.sender_id
        if active_sender and active_sender != "LANDSL":
            payload["sender"] = active_sender

        headers = {
            "authkey": self.auth_key,
            "content-type": "application/json",
            "accept": "application/json"
        }

        logger.info("Dispatching MSG91 Flow alert to %s (template: %s)", masked, active_template)

        try:
            response = requests.post(
                self.FLOW_API_URL,
                headers=headers,
                data=json.dumps(payload),
                timeout=10
            )

            status_code = response.status_code
            try:
                res_data = response.json()
            except Exception:
                res_data = {"raw": response.text}

            # MSG91 v5 returns 200 with {"type": "success", "message": "..."} or {"status": "success"}
            is_success = False
            msg_str = "SMS dispatched"
            req_id = None

            if 200 <= status_code < 300:
                resp_type = res_data.get("type", "").lower()
                resp_status = str(res_data.get("status", "")).lower()
                req_id = str(res_data.get("request_id") or res_data.get("message") or "")
                
                if resp_type == "error" or resp_status in ("error", "failed"):
                    is_success = False
                    msg_str = res_data.get("message", "MSG91 returned an error status.")
                else:
                    is_success = True
                    msg_str = res_data.get("message", "SMS submitted successfully to MSG91.")
            else:
                msg_str = res_data.get("message", f"HTTP {status_code} error from MSG91 gateway.")

            logger.info("MSG91 response for %s: status=%d, success=%s", masked, status_code, is_success)

            return {
                "success": is_success,
                "message": msg_str,
                "provider": "msg91",
                "reference_id": req_id if is_success else None,
                "status_code": status_code,
                "masked_recipient": masked
            }

        except requests.exceptions.Timeout:
            logger.error("Timeout connecting to MSG91 Flow API for recipient %s", masked)
            return {
                "success": False,
                "message": "Gateway timeout contacting MSG91 API.",
                "provider": "msg91",
                "reference_id": None,
                "status_code": 504,
                "masked_recipient": masked
            }
        except requests.exceptions.RequestException as e:
            logger.error("Network error connecting to MSG91: %s", str(e))
            return {
                "success": False,
                "message": f"Network error during SMS dispatch: {str(e)}",
                "provider": "msg91",
                "reference_id": None,
                "status_code": 502,
                "masked_recipient": masked
            }
        except Exception as e:
            logger.error("Unexpected error in MSG91 SMS dispatch: %s", str(e), exc_info=True)
            return {
                "success": False,
                "message": "Internal error occurred while dispatching SMS alert.",
                "provider": "msg91",
                "reference_id": None,
                "status_code": 500,
                "masked_recipient": masked
            }
