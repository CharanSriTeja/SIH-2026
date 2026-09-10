import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';
import { PasswordInput } from './PasswordInput';
import axios from 'axios';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onSuccess: (role?: string, name?: string) => void;
  onSwitchToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { performLogin } = useAuth();

  const isFormValid = phone.length === 10 && !phoneError && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setGlobalError(null);

    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        phone_number: phone,
        password: password
      });
      const token = response.data.access_token;
      const profile = await performLogin(token);
      onSuccess(profile?.role, profile?.name || undefined);
    } catch (err: any) {
      setGlobalError(err.response?.data?.detail || "Invalid phone number or password");
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
          Mobile Number
        </label>
        <PhoneInput value={phone} onChange={setPhone} error={phoneError} onErrorChange={setPhoneError} disabled={loading} />
      </div>

      <div>
        <div className="flex justify-between mb-1.5">
          <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#2E3327]">
            Password
          </label>
          <button type="button" className="text-xs text-[#B5551F] hover:text-[#964214] font-bold transition-colors cursor-pointer">
            Forgot password?
          </button>
        </div>
        <PasswordInput value={password} onChange={setPassword} error={passwordError} onErrorChange={setPasswordError} disabled={loading} />
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
        Sign In to Portal
      </Button>

      {onSwitchToSignup && (
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-xs text-[#474C3F] hover:text-[#141712] transition-colors cursor-pointer"
          >
            Don't have an account? <span className="text-[#B5551F] font-bold underline">Register Citizen</span>
          </button>
        </div>
      )}
    </form>
  );
};
