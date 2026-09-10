import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  ShieldAlert, 
  Navigation, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  FlaskConical,
  Globe2
} from 'lucide-react';
import { 
  NER_LOCATIONS, 
  getRandomNerLocation, 
  isWithinNer, 
  NerLocation 
} from '../../utils/nerLocations';
import { Button } from '../ui/Button';

interface LocationPromptModalProps {
  isOpen: boolean;
  onLocationGranted: (coords: { 
    latitude: number; 
    longitude: number; 
    address_label?: string; 
    isDemo?: boolean 
  }) => void;
  userName?: string;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onLocationGranted,
  userName = 'Resident',
}) => {
  const [status, setStatus] = useState<'IDLE' | 'LOCATING' | 'OUTSIDE_NER' | 'DENIED' | 'UNSUPPORTED' | 'SUCCESS'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [assignedSample, setAssignedSample] = useState<NerLocation>(() => getRandomNerLocation());
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualLat, setManualLat] = useState<string>('25.5788');
  const [manualLon, setManualLon] = useState<string>('91.8933');
  const [selectedPreset, setSelectedPreset] = useState<string>(NER_LOCATIONS[0].name);
  const [isSaving, setIsSaving] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Auto-request location when modal first opens
  useEffect(() => {
    if (isOpen && status === 'IDLE') {
      handleAcquireGps();
    }
  }, [isOpen]);

  // Countdown timer for automatic progression when outside NER
  useEffect(() => {
    if (status === 'OUTSIDE_NER' && countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'OUTSIDE_NER' && countdown === 0) {
      proceedWithSampleLocation();
    }
  }, [status, countdown]);

  if (!isOpen) return null;

  const saveLocationToBackend = async (lat: number, lon: number, addressLabel?: string, isDemo: boolean = false) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post(
          '/profile/location',
          { latitude: lat, longitude: lon },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.warn('Backend location sync deferred or offline:', err);
    } finally {
      setIsSaving(false);
      onLocationGranted({ latitude: lat, longitude: lon, address_label: addressLabel, isDemo });
    }
  };

  const handleAcquireGps = () => {
    if (!navigator.geolocation) {
      setStatus('UNSUPPORTED');
      setShowManualFallback(true);
      return;
    }

    setStatus('LOCATING');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDetectedCoords({ lat: latitude, lon: longitude });

        // Check if user is inside the Northeast Region (Lat 21-30, Lon 88-98)
        if (!isWithinNer(latitude, longitude)) {
          // User is outside North East India!
          const sample = getRandomNerLocation();
          setAssignedSample(sample);
          setStatus('OUTSIDE_NER');
          setCountdown(4); // 4 second auto-advance countdown
        } else {
          // User is inside North East India
          setStatus('SUCCESS');
          setTimeout(() => {
            saveLocationToBackend(latitude, longitude, 'Current GPS Location', false);
          }, 800);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setStatus('DENIED');
        setErrorMessage(err.message || 'Location permission denied by browser.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const proceedWithSampleLocation = () => {
    saveLocationToBackend(
      assignedSample.latitude, 
      assignedSample.longitude, 
      `${assignedSample.name}, ${assignedSample.district}`,
      true // mark as demo
    );
  };

  const handlePresetSelect = (loc: NerLocation) => {
    setSelectedPreset(loc.name);
    setManualLat(loc.latitude.toString());
    setManualLon(loc.longitude.toString());
  };

  const handleConfirmManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setErrorMessage('Please enter valid numeric latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    const isDemo = !isWithinNer(lat, lon);
    saveLocationToBackend(lat, lon, selectedPreset, isDemo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="max-w-lg w-full rounded-2xl bg-[#FFFDF8] border border-[#DDD6C4] p-6 sm:p-8 text-center shadow-xl space-y-6 relative">
        {/* Status Icon Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-[#E8EFEA] border border-[#CAD7CE] flex items-center justify-center text-[#2E4A3D] shadow-xs">
            {status === 'LOCATING' ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : status === 'OUTSIDE_NER' ? (
              <Globe2 className="w-7 h-7 text-[#B5551F] animate-pulse" />
            ) : status === 'SUCCESS' ? (
              <CheckCircle2 className="w-7 h-7 text-[#4F8F5B]" />
            ) : status === 'DENIED' ? (
              <ShieldAlert className="w-7 h-7 text-[#8A2418]" />
            ) : (
              <Navigation className="w-7 h-7" />
            )}
          </div>
        </div>

        {/* OUTSIDE NORTH EAST INDIA SPECIAL VIEW */}
        {status === 'OUTSIDE_NER' ? (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-xl bg-[#FDF1EB] border border-[#F6C8B3] text-[#823B10]">
              <div className="flex items-center gap-2 font-sans font-bold text-xs uppercase mb-1">
                <AlertTriangle className="w-4 h-4 text-[#B5551F] shrink-0" />
                <span>Simulation Location Notice</span>
              </div>
              <p className="text-xs leading-relaxed font-sans text-[#55594C]">
                Your device reports a location outside the Northeast India disaster boundary
                {detectedCoords && (
                  <span className="font-mono font-semibold text-[#823B10]"> ({detectedCoords.lat.toFixed(3)}°N, {detectedCoords.lon.toFixed(3)}°E)</span>
                )}.
              </p>
              <p className="text-xs text-[#55594C] mt-1 font-sans">
                For complete system preview, we are assigning a high-vulnerability sample zone in Northeast India.
              </p>
            </div>

            {/* Assigned Sample Location Card */}
            <div className="p-4 rounded-xl bg-[#F6F3EC] border border-[#DDD6C4] space-y-1">
              <span className="text-[10px] font-sans uppercase text-[#7B8071] font-semibold block tracking-wider">
                Targeted Demonstration Zone
              </span>
              <div className="text-base font-serif font-bold text-[#23261F] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B5551F]" />
                <span>{assignedSample.name}</span>
              </div>
              <p className="text-xs text-[#55594C]">
                District: {assignedSample.district} &bull; State: {assignedSample.state}
              </p>
              <p className="text-xs font-mono text-[#2E4A3D]">
                GPS: {assignedSample.latitude.toFixed(4)}°N, {assignedSample.longitude.toFixed(4)}°E
              </p>
            </div>

            {/* Action button with countdown */}
            <Button
              variant="primary"
              size="lg"
              onClick={proceedWithSampleLocation}
              isLoading={isSaving}
              className="w-full"
              leftIcon={<FlaskConical className="w-4 h-4" />}
            >
              {isSaving
                ? 'Initializing Dashboard...'
                : `Proceed with ${assignedSample.state}${countdown !== null && countdown > 0 ? ` (${countdown}s)` : ''}`}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowManualFallback(true)}
                className="text-xs text-[#55594C] hover:text-[#23261F] underline transition-colors cursor-pointer"
              >
                Or select another Northeast district manually
              </button>
            </div>
          </div>
        ) : !showManualFallback ? (
          /* STANDARD GPS REQUEST VIEW */
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8EFEA] border border-[#CAD7CE] text-xs font-sans font-semibold text-[#2E4A3D]">
                <Navigation className="w-3.5 h-3.5 text-[#2E4A3D]" />
                <span>Geographic Precision Required</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#23261F] tracking-tight">
                {status === 'DENIED' ? 'Location Permission Required' : 'Acquiring Terrain Coordinates'}
              </h2>

              <p className="text-xs sm:text-sm text-[#55594C] leading-relaxed max-w-md mx-auto">
                Welcome {userName}. BHURAKSHA 2.0 requires your GPS coordinates to compute localized slope stability, live rainfall thresholds, and regional risk alerts for your location.
              </p>
            </div>

            {/* Denied Warning State */}
            {status === 'DENIED' && (
              <div className="p-3.5 rounded-xl bg-[#FCEEEB] border border-[#EABEB7] text-left space-y-1 text-xs">
                <div className="flex items-center gap-2 text-[#8A2418] font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>GPS Permission Was Blocked</span>
                </div>
                <p className="text-[#55594C] leading-relaxed">
                  {errorMessage || 'Browser location access was not granted. You can retry with permission enabled, or select your district manually below.'}
                </p>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAcquireGps}
                isLoading={status === 'LOCATING' || isSaving}
                className="w-full"
                leftIcon={status === 'DENIED' ? <RefreshCw className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              >
                {status === 'LOCATING' || isSaving
                  ? 'Acquiring Coordinates...'
                  : status === 'DENIED'
                  ? 'Retry GPS Acquisition'
                  : 'Share My Current Location'}
              </Button>

              <button
                type="button"
                onClick={() => setShowManualFallback(true)}
                className="text-xs text-[#55594C] hover:text-[#23261F] underline transition-colors cursor-pointer py-1"
              >
                Unable to use GPS? Select your district manually
              </button>
            </div>
          </div>
        ) : (
          /* MANUAL DISTRICT SELECTION FALLBACK */
          <div className="p-4 rounded-xl bg-[#F6F3EC] border border-[#DDD6C4] text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-bold text-[#23261F] uppercase tracking-wider">
                Select Northeast District
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowManualFallback(false);
                  if (status === 'OUTSIDE_NER') setStatus('IDLE');
                }}
                className="text-xs text-[#55594C] hover:text-[#23261F] underline cursor-pointer"
              >
                Back to GPS
              </button>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {NER_LOCATIONS.map((loc) => {
                const isSelected = selectedPreset === loc.name;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handlePresetSelect(loc)}
                    className={`w-full p-2.5 rounded-lg border text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8EFEA] border-[#2E4A3D] text-[#2E4A3D] font-semibold'
                        : 'bg-[#FFFFFF] border-[#DDD6C4] text-[#23261F] hover:bg-[#EDE8DE]'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="text-[11px] text-[#55594C] font-mono">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-sans font-medium text-[#55594C] block mb-1">Latitude</label>
                <input
                  type="text"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#DDD6C4] text-xs font-mono text-[#23261F] focus:outline-none focus:border-[#2E4A3D]"
                />
              </div>
              <div>
                <label className="text-[11px] font-sans font-medium text-[#55594C] block mb-1">Longitude</label>
                <input
                  type="text"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#DDD6C4] text-xs font-mono text-[#23261F] focus:outline-none focus:border-[#2E4A3D]"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmManualLocation}
              isLoading={isSaving}
              className="w-full"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Set Selected Location &amp; Enter
            </Button>
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-[11px] text-[#7B8071] pt-1">
          Coordinates are processed securely and strictly used for local slope stability assessment and emergency alerts.
        </p>
      </div>
    </div>
  );
};
