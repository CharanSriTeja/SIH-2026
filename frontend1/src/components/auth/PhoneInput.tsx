import React, { useState } from 'react';
import { isValidPhoneNumber } from 'libphonenumber-js';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, onErrorChange, disabled }) => {
  const [touched, setTouched] = useState(false);

  const validate = (val: string) => {
    if (!val) {
      onErrorChange?.("Phone number is required");
      return;
    }
    // ensure it's exactly 10 digits and starts with 6-9
    const isValidLen = /^[6-9]\d{9}$/.test(val);
    
    // Also run libphonenumber check
    const isLibValid = isValidPhoneNumber(`+91${val}`, 'IN');
    
    if (!isValidLen || !isLibValid) {
      onErrorChange?.("Please enter a valid 10-digit Indian mobile number");
    } else {
      onErrorChange?.(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(val);
    if (touched) {
      validate(val);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center rounded-xl border-2 bg-[#FFFFFF] transition-all shadow-xs ${
          error
            ? 'border-[#8A2418] focus-within:ring-4 focus-within:ring-[#8A2418]/20'
            : 'border-[#BCB29E] focus-within:border-[#1E4B33] focus-within:ring-4 focus-within:ring-[#1E4B33]/20'
        }`}
      >
        <div className="px-3.5 py-2.5 text-[#141712] font-mono text-sm border-r-2 border-[#BCB29E] bg-[#EDE7DC] rounded-l-[10px] select-none font-bold">
          +91
        </div>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="98765 43210"
          className="flex-1 bg-transparent border-none text-[#141712] font-semibold px-3.5 py-2.5 text-sm focus:outline-none focus:ring-0 placeholder:text-[#6B7263] font-mono tracking-wide"
        />
      </div>
      {error && touched && (
        <p className="mt-1 text-xs text-[#8A2418] font-bold">{error}</p>
      )}
    </div>
  );
};
