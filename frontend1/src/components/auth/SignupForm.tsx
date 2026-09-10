import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';
import { PasswordInput } from './PasswordInput';
import axios from 'axios';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface SignupFormProps {
  onSuccess: (phoneNumber: string) => void;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (val !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError(null);
    }
  };

  const isFormValid = phone.length === 10 && !phoneError && password.length >= 8 && !passwordError && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setGlobalError(null);

    try {
      const resp = await axios.post('http://localhost:8000/auth/signup', {
        phone_number: phone,
        password: password,
        name: name || undefined
      });
      if (resp.data?.dev_otp) {
        sessionStorage.setItem('bhuraksha_dev_otp', resp.data.dev_otp);
      } else {
        sessionStorage.removeItem('bhuraksha_dev_otp');
      }
      onSuccess(phone);
    } catch (err: any) {
      setGlobalError(err.response?.data?.detail || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      {globalError && (
        <div className="flex items-start gap-3 p-3 bg-[#FCEEEB] border border-[#EABEB7] rounded-lg text-[#5C170F] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#8A2418] mt-0.5" />
          <p className="font-medium">{globalError}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#2E3327] mb-1.5">
          Mobile Number (10 Digits)
        </label>
        <PhoneInput value={phone} onChange={setPhone} error={phoneError} onErrorChange={setPhoneError} disabled={loading} />
      </div>

      <div>
        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#2E3327] mb-1.5">
          Full Name (Optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          placeholder="e.g. Lalrinchhana Ralte"
          className="w-full bg-[#FFFFFF] border-2 border-[#BCB29E] focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 rounded-xl text-[#141712] font-semibold px-3.5 py-2.5 text-sm focus:outline-none transition-all placeholder:text-[#6B7263] shadow-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#2E3327] mb-1.5">
          Password (min. 8 characters)
        </label>
        <PasswordInput value={password} onChange={setPassword} error={passwordError} onErrorChange={setPasswordError} disabled={loading} />
      </div>

      <div>
        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#2E3327] mb-1.5">
          Confirm Password
        </label>
        <PasswordInput 
          value={confirmPassword} 
          onChange={handleConfirmPasswordChange} 
          error={confirmPasswordError} 
          placeholder="Re-enter password"
          disabled={loading} 
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        disabled={!isFormValid}
        className="w-full mt-2 font-bold"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Continue to Verification
      </Button>

      <div className="text-center mt-2">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs text-[#474C3F] hover:text-[#141712] transition-colors cursor-pointer"
        >
          Already registered? <span className="text-[#B5551F] font-bold underline">Sign In</span>
        </button>
      </div>
    </form>
  );
};
