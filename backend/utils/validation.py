import phonenumbers

def validate_indian_phone_number(phone: str) -> str:
    """
    Validates and normalizes an Indian phone number.
    Accepts formats like: "9876543210", "+919876543210", "919876543210", "09876543210"
    Returns the canonical format: "+91XXXXXXXXXX"
    Raises ValueError with a specific message if invalid.
    """
    # Pre-process common user inputs before passing to phonenumbers
    # If the user typed 10 digits without +91 or 0, phonenumbers might struggle if region is not set,
    # but we'll set region="IN". However, if they typed 12 digits starting with 91, let's prefix '+'
    stripped = phone.strip().replace(" ", "").replace("-", "")
    
    if len(stripped) == 12 and stripped.startswith("91"):
        stripped = "+" + stripped

    try:
        # Parse the number assuming IN region if no country code provided
        parsed_number = phonenumbers.parse(stripped, "IN")
        
        # Check if it is a valid mobile number
        if not phonenumbers.is_valid_number(parsed_number):
            raise ValueError("Please enter a valid 10-digit Indian mobile number")
            
        # Ensure it's specifically an Indian number (+91)
        if parsed_number.country_code != 91:
            raise ValueError("Only Indian mobile numbers (+91) are supported")
            
        # Format to E.164 (canonical format like +91XXXXXXXXXX)
        canonical_number = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        
        # Extra verification for the 10 digits starting with 6,7,8,9
        national_number = str(parsed_number.national_number)
        if len(national_number) != 10 or not national_number[0] in ['6', '7', '8', '9']:
            raise ValueError("Please enter a valid 10-digit Indian mobile number")
            
        return canonical_number
        
    except phonenumbers.NumberParseException:
        raise ValueError("Please enter a valid 10-digit Indian mobile number")
