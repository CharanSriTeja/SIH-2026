from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseSMSProvider(ABC):
    """
    Abstract base interface for SMS gateways.
    The rest of the landslide monitoring platform interacts strictly
    through this interface, hiding all vendor-specific implementation details.
    """

    @abstractmethod
    def send_sms(
        self,
        phone_number: str,
        message: str,
        template_id: Optional[str] = None,
        variables: Optional[Dict[str, Any]] = None,
        sender_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends an SMS message to the given recipient.

        Args:
            phone_number: Recipient mobile number (e.g., "+919876543210", "919876543210").
            message: Message text or emergency alert description.
            template_id: Optional DLT template / Flow ID override.
            variables: Optional template variables dictionary (e.g., {"var1": "CRITICAL", "var2": "Aizawl"}).
            sender_id: Optional 6-character DLT Header / Sender ID override.

        Returns:
            Dict[str, Any] with standard schema:
                - success (bool): True if accepted by provider, False otherwise.
                - message (str): Status description or reason for failure.
                - provider (str): Provider identifier (e.g., "msg91").
                - reference_id (Optional[str]): Provider tracking / request ID.
                - status_code (Optional[int]): Provider HTTP response status code.
                - masked_recipient (str): Masked phone number for safe client display.
        """
        pass
