import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ 
  value, 
  onChange, 
  error, 
  onErrorChange, 
  placeholder = "Enter your password",
  disabled 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const validate = (val: string) => {
    if (!val) {
      onErrorChange?.("Password is required");
    } else {
      onErrorChange?.(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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
    <div className="w-full relative">
      <div
        className={`flex items-center rounded-xl border-2 bg-[#FFFFFF] transition-all shadow-xs ${
          error
            ? 'border-[#8A2418] focus-within:ring-4 focus-within:ring-[#8A2418]/20'
            : 'border-[#BCB29E] focus-within:border-[#1E4B33] focus-within:ring-4 focus-within:ring-[#1E4B33]/20'
        }`}
      >
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-[#141712] font-semibold px-3.5 py-2.5 text-sm focus:outline-none focus:ring-0 placeholder:text-[#6B7263]"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="px-3.5 text-[#6B7263] hover:text-[#141712] transition-colors cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && touched && (
        <p className="mt-1 text-xs text-[#8A2418] font-bold">{error}</p>
      )}
    </div>
  );
};
