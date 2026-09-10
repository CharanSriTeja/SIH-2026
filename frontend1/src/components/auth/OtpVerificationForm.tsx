import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/Button';

interface OtpVerificationFormProps {
  phoneNumber: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({ phoneNumber, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [devOtp, setDevOtp] = useState<string | null>(() => {
    return sessionStorage.getItem('bhuraksha_dev_otp');
  });
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { performLogin } = useAuth();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const maskedPhone = `+91 ${phoneNumber.substring(0, 5)} *****`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    setGlobalError(null);

    // Auto focus next
    if (index < 5 && val) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '') {
        // Go back
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setLoading(true);
    setGlobalError(null);
    try {
      const resp = await axios.post('http://localhost:8000/auth/resend-otp', {
        phone_number: phoneNumber,
        purpose: "signup"
      });
      if (resp.data?.dev_otp) {
        setDevOtp(resp.data.dev_otp);
        sessionStorage.setItem('bhuraksha_dev_otp', resp.data.dev_otp);
      } else {
        setDevOtp(null);
        sessionStorage.removeItem('bhuraksha_dev_otp');
      }
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setGlobalError(err.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) return;
    
    setLoading(true);
    setGlobalError(null);

    try {
      const response = await axios.post('http://localhost:8000/auth/verify-otp', {
        phone_number: phoneNumber,
        otp_code: otpCode,
        purpose: "signup"
      });
      const token = response.data.access_token;
      await performLogin(token);
      sessionStorage.removeItem('bhuraksha_dev_otp');
      onSuccess();
    } catch (err: any) {
      setGlobalError(err.response?.data?.detail || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5 text-center">
      <div className="w-14 h-14 bg-[#E8EFEA] border border-[#CAD7CE] rounded-full flex items-center justify-center text-[#2E4A3D] shadow-xs">
        <ShieldCheck className="w-7 h-7" />
      </div>
      
      <div>
        <h3 className="text-xl font-serif font-bold text-[#23261F] mb-1">
          Verify Mobile Identity
        </h3>
        <p className="text-xs text-[#55594C]">
          We have dispatched a 6-digit security code to <br/>
          <span className="text-[#23261F] font-mono font-semibold">{maskedPhone}</span>
        </p>
      </div>

      {devOtp && (
        <div className="w-full p-2.5 rounded-lg bg-[#FDF1EB] border border-[#F6C8B3] text-[#823B10] text-xs font-mono flex items-center justify-between shadow-2xs">
          <span>Simulation Code: <strong>{devOtp}</strong></span>
          <button
            type="button"
            onClick={() => {
              const digits = devOtp.split('').slice(0, 6);
              setOtp(digits);
              inputsRef.current[5]?.focus();
            }}
            className="px-2.5 py-1 rounded bg-[#B5551F] hover:bg-[#964214] text-[#FFFDF8] font-bold text-[10px] uppercase transition-colors cursor-pointer"
          >
            Auto-Fill
          </button>
        </div>
      )}

      {globalError && (
        <div className="w-full flex items-start gap-3 p-3 bg-[#FCEEEB] border border-[#EABEB7] rounded-lg text-[#5C170F] text-xs text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#8A2418] mt-0.5" />
          <p className="font-medium">{globalError}</p>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={loading}
            className="w-11 h-13 text-center text-xl font-mono font-bold bg-[#FFFFFF] border-2 border-[#BCB29E] focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 rounded-xl text-[#141712] focus:outline-none transition-all shadow-xs"
          />
        ))}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={loading}
        disabled={otp.join('').length < 6}
        className="w-full font-bold"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Verify Code &amp; Proceed
      </Button>

      <div className="text-xs text-[#474C3F] flex flex-col gap-2 w-full mt-1">
        <p className="font-medium">
          Code expires in: <span className="text-[#B5551F] font-mono font-bold ml-1">{formatTime()}</span>
        </p>
        <button 
          type="button" 
          onClick={handleResend}
          disabled={timeLeft > 0 || loading}
          className="text-[#1E4B33] hover:underline disabled:text-[#6B7263] disabled:no-underline disabled:cursor-not-allowed transition-colors cursor-pointer font-bold"
        >
          Didn't receive code? Resend SMS
        </button>
        <button 
          type="button" 
          onClick={onBack}
          className="text-[#474C3F] hover:text-[#141712] mt-2 transition-colors text-xs cursor-pointer font-semibold"
        >
          &larr; Change mobile number
        </button>
      </div>
    </form>
  );
};
