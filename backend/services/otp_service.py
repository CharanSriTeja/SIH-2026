import os
import re
import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

BREVO_URL = "https://api.brevo.com/v3/transactionalSMS/sms"

def send_otp_sms(phone_number: str, otp_code: str) -> Dict[str, Any]:
    """
    Simulates sending transactional OTP SMS (Disabled per request).
    """
    logger.info(f"[SMS SIMULATED] OTP for {phone_number} is {otp_code}")
    print("\n" + "=" * 60)
    print(" [BHURAKSHA 2.0 // SMS SIMULATION MODE]")
    print(f" Target Recipient : {phone_number}")
    print(f" Generated OTP    : {otp_code}")
    print("=" * 60 + "\n")
    
    return {
        "success": True,
        "message": "OTP simulated successfully",
        "reference": "SIMULATED",
        "dev_otp": otp_code
    }
