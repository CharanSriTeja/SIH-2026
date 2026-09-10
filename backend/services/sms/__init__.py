from services.sms.base import BaseSMSProvider
from services.sms.msg91 import MSG91Provider, sanitize_phone_number, mask_phone_number, is_valid_indian_mobile

_sms_provider_instance: BaseSMSProvider = None

def get_sms_service() -> BaseSMSProvider:
    """
    Factory function providing the active SMS provider instance.
    Uses MSG91 as the primary provider.
    """
    global _sms_provider_instance
    if _sms_provider_instance is None:
        _sms_provider_instance = MSG91Provider()
    return _sms_provider_instance

__all__ = [
    "BaseSMSProvider",
    "MSG91Provider",
    "get_sms_service",
    "sanitize_phone_number",
    "mask_phone_number",
    "is_valid_indian_mobile"
]
