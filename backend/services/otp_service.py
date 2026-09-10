import os
import re
import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

BREVO_URL = "https://api.brevo.com/v3/transactionalSMS/sms"

def send_otp_sms(phone_number: str, otp_code: str) -> Dict[str, Any]:
    """
    Sends transactional OTP SMS using the official Brevo Transactional SMS API.
    
    Args:
        phone_number (str): Recipient mobile number (e.g., "+919876543210", "9876543210").
        otp_code (str): 6-digit verification code.
        
    Returns:
        Dict[str, Any]:
            - success (bool): True if sent or handled gracefully.
            - message (str): Human-readable status description.
            - reference (Optional[str]): Brevo transaction reference ID if dispatched.
            - remaining_credits (Optional[float]): Remaining SMS credits on Brevo.
            - dev_otp (Optional[str]): Included if Brevo account lacks prepaid SMS credits.
    """
    api_key = os.getenv("BREVO_API_KEY", "").strip()
    sender_name = os.getenv("BREVO_SENDER_NAME", "SIH2026").strip()
    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    strict_mode = os.getenv("BREVO_STRICT_MODE", "false").lower() == "true"
    
    # 1. Normalize recipient: Brevo requires digits only with country code (e.g. 919876543210)
    clean_recipient = re.sub(r"[^0-9]", "", phone_number)
    if len(clean_recipient) == 10:
        clean_recipient = "91" + clean_recipient
        
    # 2. Normalize sender: Brevo requires 3 to 11 alphanumeric characters
    clean_sender = re.sub(r"[^a-zA-Z0-9]", "", sender_name)[:11] or "SIH2026"
    
    content = f"Your verification code for Bhuraksha 2.0 is: {otp_code}. Valid for 5 minutes. Do not share this code."
    
    # Visual console output for observability
    print("\n" + "=" * 60)
    print(" [BHURAKSHA 2.0 // BREVO TRANSACTIONAL SMS GATEWAY]")
    print(f" Target Recipient : +{clean_recipient}")
    print(f" Sender Header    : {clean_sender}")
    print(f" Generated OTP    : {otp_code}")
    print(f" Content          : {content}")
    print("=" * 60)
    
    # If pure simulation DEV_MODE is explicitly requested
    if dev_mode:
        print("[DEV_MODE=TRUE] Brevo HTTP call skipped (Simulation mode active).\n")
        return {
            "success": True,
            "message": "OTP simulated (DEV_MODE is enabled)",
            "reference": "DEV-SIMULATED",
            "dev_otp": otp_code
        }
        
    if not api_key:
        err = "BREVO_API_KEY is not set in backend/.env. Cannot dispatch live SMS."
        logger.error(err)
        print(f"[BREVO ERROR] {err}\n")
        return {
            "success": False,
            "message": err,
            "reference": None,
            "dev_otp": otp_code
        }
        
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }

    payload = {
        "type": "transactional",
        "unicodeEnabled": False,
        "sender": clean_sender,
        "recipient": clean_recipient,
        "content": content
    }

    logger.info(f"[BREVO SMS] Calling Brevo Transactional SMS endpoint for {clean_recipient}...")
    
    try:
        response = requests.post(BREVO_URL, json=payload, headers=headers, timeout=12)
        response_json = {}
        try:
            response_json = response.json()
        except Exception:
            pass

        print(f" Brevo API Response Status: HTTP {response.status_code}")
        
        # HTTP 201 Created (or 200 OK): Live SMS accepted by Brevo carrier network
        if response.status_code in [200, 201]:
            ref_id = str(response_json.get("reference") or response_json.get("messageId") or "DELIVERED")
            used = response_json.get("usedCredits")
            remaining = response_json.get("remainingCredits")
            
            logger.info(f"[BREVO SMS DELIVERED] Ref: {ref_id} | Used: {used} | Remaining: {remaining}")
            print(f" [SUCCESS] SMS Dispatched! Reference: {ref_id} | Remaining Credits: {remaining}")
            print("=" * 60 + "\n")
            
            return {
                "success": True,
                "message": f"Verification code sent via SMS (Ref: {ref_id})",
                "reference": ref_id,
                "remaining_credits": remaining,
                "dev_otp": None
            }
            
        else:
            code = response_json.get("code", "api_error")
            msg = response_json.get("message", response.text)
            
            logger.error(f"[BREVO SMS FAILED] HTTP {response.status_code} [{code}]: {msg}")
            print(f" [BREVO ERROR] Code: {code} | Message: {msg}")
            
            # Brevo specific case: Organization has no SMS credits/addon pack purchased
            if "No sms related addons" in msg or "not enough credits" in msg.lower() or response.status_code == 402:
                notice = (
                    "Live Brevo API reached successfully, but your Brevo account does not have "
                    "prepaid SMS credits. To receive live SMS on mobile devices, purchase SMS credits "
                    "at https://app.brevo.com/billing/addons/sms."
                )
                print(f" [ACTION REQUIRED] {notice}")
                print(f" [TESTING CODE] Use verification code: {otp_code}")
                print("=" * 60 + "\n")
                
                if strict_mode:
                    return {
                        "success": False,
                        "message": f"Brevo SMS Gateway: {msg}. Please purchase SMS credits in Brevo dashboard.",
                        "reference": None,
                        "dev_otp": None
                    }
                else:
                    return {
                        "success": True,
                        "message": f"Brevo contacted. (SMS addon required for handset delivery: {otp_code})",
                        "reference": None,
                        "dev_otp": otp_code,
                        "addon_required": True
                    }
                    
            print("=" * 60 + "\n")
            return {
                "success": False,
                "message": f"Brevo SMS delivery failed: {msg}",
                "reference": None,
                "dev_otp": otp_code if not strict_mode else None
            }

    except requests.exceptions.RequestException as e:
        logger.error(f"[BREVO EXCEPTION] Failed to communicate with Brevo: {str(e)}")
        print(f" [NETWORK EXCEPTION] {str(e)}")
        print("=" * 60 + "\n")
        return {
            "success": False,
            "message": f"Network error connecting to Brevo SMS gateway: {str(e)}",
            "reference": None,
            "dev_otp": otp_code if not strict_mode else None
        }
