import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Video,
  MapPin,
  Bell,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  PhoneCall,
  Navigation,
  Info,
  LogOut,
  Smartphone,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Car,
  CloudRain,
  Layers,
  Trash2,
  Lock,
  RefreshCw,
  Wifi,
  WifiOff,
  FlaskConical,
  Map,
  Activity,
  Send,
  Radio,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { UserRole, CitizenLocationState, GeoTaggedPhoto, GeoTaggedVideo } from '../types';
import { CitizenCameraModal } from './CitizenCameraModal';
import { OfficerOperationalService } from '../services/officerOperationalService';
import MapComponent from './MapComponent';
import { getLocationMode, getRandomNerLocation, isWithinNer } from '../utils/nerLocations';
import { useAuth } from './auth/AuthContext';
import { AlertService, AlertStatus, AlertHistoryItem } from '../services/alertService';
import { submitCitizenHazardReport } from '../services/districtAdminService';
import { RiskBadge } from './ui/RiskBadge';

const LAND_COVER_LABELS: Record<string | number, string> = {
  10: 'Cropland (Rainfed)',
  20: 'Cropland (Irrigated)',
  30: 'Mosaic Cropland / Highland Veg',
  40: 'Broadleaved Deciduous Forest',
  50: 'Broadleaved Evergreen Forest',
  60: 'Open Deciduous Forest',
  80: 'Needleleaved Forest',
  100: 'Mosaic Tree & Shrub',
  110: 'Mosaic Herbaceous',
  120: 'Shrubland',
  130: 'Grassland',
  190: 'Urban / Settlement',
};

function getDominantSoilType(features?: RiskAssessmentData['static_features']): string {
  if (!features) return 'Terrain Profile Pending';
  const clayey = features.soil_clayey ?? 0;
  const skeletal = features.soil_clayskeletal ?? 0;
  const loamy = features.soil_loamy ?? 0;
  const sandy = features.soil_sandy ?? 0;

  const max = Math.max(clayey, skeletal, loamy, sandy);
  if (max === 0) return 'Mountainous Colluvium';
  if (max === skeletal) return 'Clayey Skeletal (High Slip Risk)';
  if (max === clayey) return 'Clayey Soil (Expansive / Saturated)';
  if (max === loamy) return 'Loamy Silt (Moderate Stability)';
  if (max === sandy) return 'Sandy Loam (Porous / High Drainage)';
  return 'Mixed Hillside Soil';
}

interface RiskAssessmentData {
  latitude: number;
  longitude: number;
  susceptibility_score: number | null;
  risk_score: number | null;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Outside Coverage';
  susceptibility_level?: 'Low' | 'Moderate' | 'High' | 'Critical';
  severity?: string;
  live_risk_available: boolean;
  is_outside_ner?: boolean;
  rainfall_24hr: number | null;
  rainfall_7day: number | null;
  soil_moisture: number | null;
  is_live_data_mocked?: boolean;
  data_source?: string;
  grid_match_distance_m: number;
  coverage_warning?: string | null;
  computed_at: string;
  static_features?: {
    elevation?: number;
    slope?: number;
    aspect?: number;
    curvature?: number;
    tpi?: number;
    tri?: number;
    roughness?: number;
    soil_clayey?: number;
    soil_clayskeletal?: number;
    soil_loamy?: number;
    soil_sandy?: number;
    land_cover_class?: number;
  };
}

interface CitizenDashboardProps {
  user: { role: UserRole; name: string };
  onLogout: () => void;
  onSwitchRole?: (newRole: UserRole) => void;
}

interface CitizenReportItem {
  id: string;
  category: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'INVESTIGATING';
  photoUrl: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  user,
  onLogout,
}) => {
  // Navigation Tabs: MY RISK | GIS MAP | REPORT HAZARD | ALERTS | PROFILE
  const [activeTab, setActiveTab] = useState<'MY RISK' | 'GIS MAP' | 'REPORT HAZARD' | 'ALERTS' | 'PROFILE'>('MY RISK');

  // Mandatory Location State
  const [locationState, setLocationState] = useState<CitizenLocationState | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'PROMPT' | 'GRANTED' | 'DENIED'>('PROMPT');
  const [isLocating, setIsLocating] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  // Camera-Only Evidence Capture State (Camera stays OFF until user explicitly requests capture)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video' | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<GeoTaggedPhoto[]>([]);
  const [capturedVideo, setCapturedVideo] = useState<GeoTaggedVideo | null>(null);

  // Interactive Report Form State
  const [reportType, setReportType] = useState('Ground Crack');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('');

  // Network & Offline Sync State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);

  // Evacuation Route Modal State
  const [showEvacuationModal, setShowEvacuationModal] = useState(false);

  // Acknowledged Alerts
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  // Auth Context user
  const { user: authUser } = useAuth();

  // Profile Edit State (Dynamic from authenticated user and verified location)
  const [profileName, setProfileName] = useState(authUser?.name || user.name);
  const [profilePhone, setProfilePhone] = useState(authUser?.phone_number || 'Linked Resident Phone');
  const [profileLocation, setProfileLocation] = useState(authUser?.address_label || 'Local Hillside Sector');
  const [profileDistrict, setProfileDistrict] = useState('Northeast Monitoring Zone');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [appAlertsEnabled, setAppAlertsEnabled] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // Sync profile when location or authUser updates
  useEffect(() => {
    if (locationState?.areaName) {
      setProfileLocation(locationState.areaName);
      setProfileDistrict(locationState.areaName);
    }
  }, [locationState]);

  useEffect(() => {
    if (authUser?.phone_number) setProfilePhone(authUser.phone_number);
    if (authUser?.name) setProfileName(authUser.name);
  }, [authUser]);

  // Citizen's Local Reports History (Starts empty or loaded from saved storage)
  const [citizenReports, setCitizenReports] = useState<CitizenReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('bhuraksha_citizen_submitted_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Live MSG91 SMS Alert State
  const [alertStatus, setAlertStatus] = useState<AlertStatus | null>(null);
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState<{ type: 'success' | 'error' | 'throttled'; message: string } | null>(null);
  const [targetPhone, setTargetPhone] = useState(authUser?.phone_number || '');

  // Load live MSG91 alert status & history on tab switch
  useEffect(() => {
    if (activeTab === 'ALERTS') {
      setIsLoadingAlerts(true);
      Promise.allSettled([
        AlertService.getStatus(),
        AlertService.getHistory(25)
      ]).then(([statusRes, histRes]) => {
        if (statusRes.status === 'fulfilled') setAlertStatus(statusRes.value);
        if (histRes.status === 'fulfilled') setAlertHistory(histRes.value);
        setIsLoadingAlerts(false);
      });
    }
  }, [activeTab]);

  useEffect(() => {
    if (authUser?.phone_number && !targetPhone) {
      setTargetPhone(authUser.phone_number);
    }
  }, [authUser]);

  const handleTriggerTestAlert = async () => {
    const phoneToUse = targetPhone || authUser?.phone_number || profilePhone;
    if (!phoneToUse || phoneToUse === 'Linked Resident Phone') {
      setAlertFeedback({ type: 'error', message: 'Please provide a valid 10-digit Indian phone number.' });
      return;
    }
    setIsSendingAlert(true);
    setAlertFeedback(null);
    try {
      const res = await AlertService.sendEmergencySms({
        phone_number: phoneToUse,
        risk_level: riskAssessment?.risk_level === 'Outside Coverage' ? 'HIGH' : (riskAssessment?.risk_level || 'HIGH'),
        location_name: locationState?.areaName || profileLocation,
        latitude: locationState?.latitude,
        longitude: locationState?.longitude,
        custom_message: 'EMERGENCY TEST WARNING: Heightened landslide hazard conditions simulated for your sector.'
      });
      if (res.success) {
        setAlertFeedback({
          type: 'success',
          message: `SMS dispatched via ${res.provider?.toUpperCase()} to ${res.masked_recipient}. Ref ID: ${res.reference_id || 'OK'}`
        });
      } else {
        setAlertFeedback({
          type: 'error',
          message: res.message || 'Alert dispatch failed.'
        });
      }
      const hist = await AlertService.getHistory(25);
      setAlertHistory(hist);
    } catch (err: any) {
      if (err.response?.status === 429) {
        const detail = err.response.data?.detail;
        const msg = typeof detail === 'object' ? detail.message : (detail || 'Alert throttled by cooldown protection.');
        setAlertFeedback({
          type: 'throttled',
          message: `${msg} Cooldown is active to prevent redundant resident SMS notifications.`
        });
      } else {
        const errorDetail = err.response?.data?.detail;
        const msg = typeof errorDetail === 'string' ? errorDetail : (errorDetail?.message || err.message || 'Failed to dispatch alert.');
        setAlertFeedback({
          type: 'error',
          message: msg
        });
      }
    } finally {
      setIsSendingAlert(false);
    }
  };

  // Real Landslide Model A Susceptibility & Risk Assessment
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentData | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);

  const fetchRiskAssessment = async (lat: number, lon: number) => {
    setIsLoadingRisk(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const resp = await axios.get<RiskAssessmentData>(`/risk/my-location?lat=${lat}&lon=${lon}`, { headers });
      setRiskAssessment(resp.data);
    } catch (e) {
      console.warn('Could not fetch real-time risk assessment:', e);
    } finally {
      setIsLoadingRisk(false);
    }
  };

  const requestLocation = (): Promise<CitizenLocationState | null> => {
    setIsLocating(true);
    setLocationErrorMsg(null);

    // 1. DEMO MODE: Auto-pick random realistic NER location
    if (getLocationMode() === 'demo') {
      const sample = getRandomNerLocation();
      const loc: CitizenLocationState = {
        latitude: sample.latitude,
        longitude: sample.longitude,
        accuracy: 10,
        timestamp: Date.now(),
        areaName: `${sample.name}, ${sample.state}`,
        isPermissionGranted: true,
        isDemo: true,
      };
      setLocationState(loc);
      setLocationPermissionStatus('GRANTED');
      setIsLocating(false);

      try {
        sessionStorage.setItem('bhuraksha_citizen_location', JSON.stringify(loc));
        const token = localStorage.getItem('access_token');
        if (token) {
          axios.post(
            '/profile/location',
            { latitude: loc.latitude, longitude: loc.longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(() => {});
        }
      } catch {}

      fetchRiskAssessment(loc.latitude, loc.longitude);
      return Promise.resolve(loc);
    }

    // 2. REAL MODE: Use real HTML5 browser geolocation
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationErrorMsg('Geolocation is not supported by your device/browser.');
        setLocationPermissionStatus('DENIED');
        setIsLocating(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          let { latitude, longitude } = pos.coords;
          let isDemo = false;
          let coordsLabel = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;

          // Handle "User is Outside NER": Fallback to random NER location
          if (!isWithinNer(latitude, longitude)) {
            const fallbackSample = getRandomNerLocation();
            latitude = fallbackSample.latitude;
            longitude = fallbackSample.longitude;
            coordsLabel = `${fallbackSample.name}, ${fallbackSample.state} (NER Sample)`;
            isDemo = true;
          }

          const loc: CitizenLocationState = {
            latitude,
            longitude,
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp || Date.now(),
            areaName: coordsLabel,
            isPermissionGranted: true,
            isDemo,
          };
          setLocationState(loc);
          setLocationPermissionStatus('GRANTED');
          setIsLocating(false);

          try {
            sessionStorage.setItem('bhuraksha_citizen_location', JSON.stringify(loc));
            const token = localStorage.getItem('access_token');
            if (token) {
              axios.post(
                '/profile/location',
                { latitude: loc.latitude, longitude: loc.longitude },
                { headers: { Authorization: `Bearer ${token}` } }
              ).catch(() => {});
            }
          } catch {}

          fetchRiskAssessment(loc.latitude, loc.longitude);
          resolve(loc);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setLocationPermissionStatus('DENIED');
          if (err.code === err.PERMISSION_DENIED) {
            setLocationErrorMsg('Location access was denied. Please allow location permissions in your browser settings.');
          } else {
            setLocationErrorMsg('Unable to obtain device location. Please check device GPS and try again.');
          }
          setIsLocating(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  useEffect(() => {
    // Check cached location or authenticate user profile location
    try {
      const cached = sessionStorage.getItem('bhuraksha_citizen_location');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setLocationState(parsed);
          setLocationPermissionStatus('GRANTED');
          fetchRiskAssessment(parsed.latitude, parsed.longitude);
          return;
        }
      }
    } catch {}

    if (authUser?.last_latitude && authUser?.last_longitude) {
      const loc: CitizenLocationState = {
        latitude: authUser.last_latitude,
        longitude: authUser.last_longitude,
        accuracy: 10,
        timestamp: Date.now(),
        areaName: authUser.address_label || 'My Location',
        isPermissionGranted: true,
      };
      setLocationState(loc);
      setLocationPermissionStatus('GRANTED');
      fetchRiskAssessment(loc.latitude, loc.longitude);
    } else {
      // Auto-request location (automatically picks realistic NER sample in demo mode or prompts GPS in real mode)
      requestLocation();
    }

    // Check offline pending count
    try {
      const raw = localStorage.getItem('bhuraksha_offline_citizen_reports');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) setOfflinePendingCount(list.length);
      }
    } catch {}

    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineReports();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineReports = async () => {
    try {
      const raw = localStorage.getItem('bhuraksha_offline_citizen_reports');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return;

      for (const item of list) {
        await fetch('/api/reports/citizen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
      localStorage.removeItem('bhuraksha_offline_citizen_reports');
      setOfflinePendingCount(0);
    } catch (e) {
      console.warn('Sync offline reports deferred:', e);
    }
  };

  const handleAcknowledgeAlert = (id: string) => {
    if (!acknowledgedAlerts.includes(id)) {
      setAcknowledgedAlerts([...acknowledgedAlerts, id]);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationState) {
      setSubmitError('Valid device GPS coordinates are required before submitting.');
      return;
    }

    if (capturedPhotos.length === 0 && !capturedVideo) {
      setSubmitError('Please capture at least one live photo or video of the hazard using your device camera.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const newId = `BR-${Math.floor(2000 + Math.random() * 8000)}`;

    const reportPayload = {
      reportId: newId,
      citizenId: user.name.replace(/\s+/g, '-').toLowerCase(),
      citizenName: user.name,
      latitude: locationState.latitude,
      longitude: locationState.longitude,
      accuracy: locationState.accuracy,
      locationTimestamp: new Date(locationState.timestamp).toISOString(),
      hazardType: reportType,
      description: description || 'Visual observation reported by resident.',
      photos: capturedPhotos,
      videos: capturedVideo ? [capturedVideo] : [],
      status: 'NEW',
    };

    // Save to local operational reports so Field Officer queue immediately reflects it
    try {
      const existingReports = OfficerOperationalService.getCitizenReports();
      const newOperationalReport: any = {
        id: newId,
        reportId: newId,
        citizenName: user.name,
        location: `${locationState.latitude.toFixed(4)}°N, ${locationState.longitude.toFixed(4)}°E (${locationState.areaName || profileLocation})`,
        district: profileDistrict,
        sector: 'Sector A',
        problemType: reportType,
        submittedDateTime: 'Just Now',
        photoUrl: capturedPhotos.length > 0 ? capturedPhotos[0].dataUrl : (capturedVideo ? capturedVideo.dataUrl : ''),
        hasPhoto: capturedPhotos.length > 0,
        videoUrl: capturedVideo ? capturedVideo.dataUrl : undefined,
        description: description || 'Visual observation reported by resident.',
        status: 'NEW',
        riskContext: {
          areaRiskLevel: 'HIGH',
          rainfall24h: '184 mm',
          soilMoisture: '89%',
          slopeContext: 'Steep hillside',
          nearbyInfrastructure: 'Lifeline Road R-204',
        },
      };
      OfficerOperationalService.saveCitizenReports([newOperationalReport, ...existingReports]);
    } catch (err) {
      console.warn('Could not save to local operational reports:', err);
    }

    let synced = false;
    let serverReportId = newId;

    if (navigator.onLine && capturedPhotos.length > 0) {
      try {
        // Convert dataUrl to blob
        const dataUrl = capturedPhotos[0].dataUrl;
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const photoBlob = new Blob([u8arr], { type: mime });

        const formData = new FormData();
        formData.append('photo', photoBlob, 'hazard_evidence.jpg');
        formData.append('latitude', locationState.latitude.toString());
        formData.append('longitude', locationState.longitude.toString());
        formData.append('hazard_type', reportType);
        formData.append('description', description || 'Visual observation reported by resident.');

        const backendResult = await submitCitizenHazardReport(formData);
        if (backendResult.success) {
          synced = true;
          serverReportId = backendResult.report_id;
        }
      } catch (err) {
        console.warn('Backend report submission error:', err);
      }
    }

    if (!synced) {
      try {
        const raw = localStorage.getItem('bhuraksha_offline_citizen_reports');
        const queue = raw ? JSON.parse(raw) : [];
        queue.push(reportPayload);
        localStorage.setItem('bhuraksha_offline_citizen_reports', JSON.stringify(queue));
        setOfflinePendingCount(queue.length);
      } catch {}
    }

    setSubmittedReportId(serverReportId);
    setIsSubmitted(true);
    setIsSubmitting(false);

    const newReport: CitizenReportItem = {
      id: newId,
      category: reportType,
      description: description || 'Visual observation reported by resident.',
      location: `GPS: ${locationState.latitude.toFixed(4)}°, ${locationState.longitude.toFixed(4)}° (${locationState.areaName || 'Local Sector'})`,
      timestamp: 'Just Now',
      status: 'PENDING_VERIFICATION',
      photoUrl: capturedPhotos.length > 0 ? capturedPhotos[0].dataUrl : (capturedVideo ? capturedVideo.dataUrl : ''),
    };

    setCitizenReports([newReport, ...citizenReports]);
  };

  const handleRemovePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemoveVideo = () => {
    setCapturedVideo(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setProfileSavedSuccess(true);
    setTimeout(() => setProfileSavedSuccess(false), 3500);
  };

  return (
    <div className="min-h-screen bg-earth-100 text-earth-900 flex flex-col font-sans">
      {/* ==================================================== */}
      {/* CITIZEN TOP NAVIGATION BAR                           */}
      {/* Contains: BHURAKSHA 2.0 | MY RISK | GIS MAP | REPORT HAZARD | ALERTS | PROFILE */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-earth-50/95 border-b border-earth-300 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand + Citizen Safety Identifier */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-800 shrink-0 shadow-xs">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-serif uppercase tracking-tight text-earth-900">
                  BHURAKSHA 2.0
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-brand-100 text-brand-800 border border-brand-300">
                  CITIZEN
                </span>
              </div>
              <span className="text-[10px] font-mono text-earth-600 uppercase block truncate max-w-[190px]">
                {locationState?.areaName || 'SAFETY PORTAL'}
              </span>
            </div>
          </div>

          {/* Center Navigation Links with Clean Spacing & Icons */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#EDE7DC] border-2 border-[#C9C0AD]">
            {[
              { id: 'MY RISK', label: 'MY RISK', icon: ShieldAlert },
              { id: 'GIS MAP', label: 'GIS MAP', icon: Map },
              { id: 'REPORT HAZARD', label: 'REPORT HAZARD', icon: Camera },
              { id: 'ALERTS', label: 'ALERTS', icon: Bell },
              { id: 'PROFILE', label: 'PROFILE', icon: User },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#1E4B33] text-white shadow-sm'
                      : 'text-[#474C3F] hover:text-[#141712] hover:bg-[#DFD8CA]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                  {id === 'ALERTS' && (riskAssessment?.risk_level === 'Critical' || riskAssessment?.risk_level === 'High') && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Section: Live Location Pill, User Profile & Log Out */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Location Status Indicator */}
            {locationState ? (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-300 text-[10px] font-mono text-brand-800">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                <span className="truncate max-w-[140px] font-semibold">{locationState.isDemo ? 'DEMO NER' : 'GPS ACTIVE'}</span>
              </div>
            ) : (
              <button
                onClick={requestLocation}
                disabled={isLocating}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-[10px] font-mono text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors font-semibold"
              >
                <MapPin className="w-3 h-3 animate-pulse" />
                <span>{isLocating ? 'Locating...' : 'ENABLE GPS'}</span>
              </button>
            )}

            {/* User Profile Badge */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-mono font-bold text-earth-900 uppercase truncate max-w-[130px]">
                {profileName}
              </span>
              <span className="text-[9px] font-mono text-brand-700 font-semibold">
                Citizen Resident
              </span>
            </div>

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-[#BCB29E] bg-[#EDE7DC] hover:bg-[#FDF2F0] hover:border-[#F2BCA0] hover:text-[#8A2418] text-[#141712] text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOG OUT</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip (All 5 Tabs) */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto py-2.5 border-t border-[#C9C0AD] no-scrollbar">
          {[
            { id: 'MY RISK', label: 'MY RISK', icon: ShieldAlert },
            { id: 'GIS MAP', label: 'GIS MAP', icon: Map },
            { id: 'REPORT HAZARD', label: 'REPORT HAZARD', icon: Camera },
            { id: 'ALERTS', label: 'ALERTS', icon: Bell },
            { id: 'PROFILE', label: 'PROFILE', icon: User },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1E4B33] text-white shadow-xs'
                    : 'text-[#474C3F] hover:text-[#141712] hover:bg-[#EDE7DC]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ==================================================== */}
      {/* MAIN CITIZEN BODY                                    */}
      {/* ==================================================== */}
      <main className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left ${activeTab === 'GIS MAP' ? 'max-w-7xl' : 'max-w-5xl'}`}>
        {/* DEMO MODE NOTICE BANNER */}
        {(getLocationMode() === 'demo' || locationState?.isDemo) && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1 border border-amber-400">
                <FlaskConical className="w-3 h-3" />
                <span>DEMO MODE</span>
              </span>
              <span className="font-semibold text-earth-900">
                Using sample location: <span className="text-amber-900 font-bold">{locationState?.areaName || 'Shillong, Meghalaya'}</span>
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] font-mono text-amber-800 uppercase font-medium">
              (DEV ENVIRONMENT // SAMPLE NER COORDINATES)
            </span>
          </div>
        )}

        {/* Subtle Demonstration Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono text-earth-600 pb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
            <span>CONNECTED TO LOCAL DISTRICT SENTINEL</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-white border border-earth-300 text-earth-700 uppercase font-semibold">
            DEMO / SYSTEM PREVIEW
          </span>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <div className="p-3 rounded-xl bg-accent-50 border border-accent-300 text-accent-900 text-xs font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-accent-700" />
              <span>OFFLINE — Evidence saved locally. It will sync when connectivity is restored.</span>
            </div>
            {offlinePendingCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-accent-700 text-white font-bold text-[10px]">
                {offlinePendingCount} PENDING
              </span>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 1. MY RISK — CITIZEN HOME / MAIN DASHBOARD           */}
        {/* ==================================================== */}
        {activeTab === 'MY RISK' && (
          locationPermissionStatus === 'DENIED' ? (
            /* Denied Location State Screen */
            <div className="p-8 rounded-3xl bg-white border border-earth-300 text-center space-y-5 max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold font-serif uppercase text-earth-900 tracking-tight">
                  LOCATION ACCESS REQUIRED
                </h2>
                <p className="text-xs text-earth-700 leading-relaxed font-sans">
                  Location access is required for BHURAKSHA 2.0 to calculate and display the landslide risk around your area.
                </p>
                <p className="text-xs text-earth-500 font-sans">
                  Please allow location access to continue using location-based risk monitoring and geo-tagged hazard reporting.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="px-8 py-3.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm border-2 border-[#143524] inline-flex items-center gap-2"
                >
                  {isLocating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  <span>TRY AGAIN</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Header / Location Bar */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#BCB29E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7263] block mb-1">
                    CURRENT AREA
                  </span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#1E4B33] shrink-0" />
                    <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#141712] uppercase tracking-tight">
                      {locationState ? (locationState.areaName || profileLocation) : (riskAssessment?.is_outside_ner ? 'Outside North East India' : profileLocation)}
                    </h1>
                  </div>
                  <p className="text-xs text-[#434A3E] mt-1 font-sans">
                    {locationState ? (
                      <span className="font-mono text-[11px] text-[#1E4A26] font-semibold">
                        GPS: {locationState.latitude.toFixed(6)}°N, {locationState.longitude.toFixed(6)}°E (±{Math.round(locationState.accuracy)}m)
                      </span>
                    ) : (
                      <span>{profileDistrict} &bull; Geofenced monitoring zone</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#D5CCA8]">
                  <button
                    type="button"
                    onClick={requestLocation}
                    disabled={isLocating}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#141712] font-mono text-[11px] uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer border-2 border-[#BCB29E] shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#1E4B33] ${isLocating ? 'animate-spin' : ''}`} />
                    <span>REFRESH LOCATION</span>
                  </button>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono uppercase text-earth-500 block">
                      LAST UPDATED
                    </span>
                    <span className="text-xs font-mono font-bold text-earth-900 flex items-center sm:justify-end gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-earth-500" />
                      <span>{riskAssessment?.computed_at ? new Date(riskAssessment.computed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (locationState ? `${Math.max(1, Math.round((Date.now() - locationState.timestamp) / 60000))} min ago` : 'Live')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Disclaimer */}
              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-start gap-2.5 text-[11px] font-mono text-earth-600">
                <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>
                  Location access is permission-based. The system does not continuously track your device in the background. Coordinates are only sampled with your explicit consent to provide local risk telemetry and geo-tag submitted hazard evidence.
                </span>
              </div>

              {/* Core Landslide Risk Status Card */}
              {(() => {
                // Check if outside NER
                if (riskAssessment?.is_outside_ner || riskAssessment?.risk_level === 'Outside Coverage') {
                  return (
                    <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-earth-300 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-200 pb-4">
                        <div>
                          <span className="text-xs font-mono uppercase tracking-widest text-earth-600 font-bold block">
                            LOCATION OUTSIDE NORTHEAST INDIA
                          </span>
                          <div className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 tracking-tight mt-1 uppercase flex items-center gap-3">
                            <span>NO LANDSLIDE RISK PREDICTION</span>
                          </div>
                          <p className="text-xs text-earth-600 mt-1 max-w-xl font-sans">
                            Your device GPS is positioned outside the 8 North East India states. Landslide susceptibility and Model B risk predictions are strictly bounded to the Northeast Region (NER) terrain dataset.
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold uppercase self-start sm:self-auto bg-earth-100 border-earth-300 text-earth-700">
                            <Info className="w-3.5 h-3.5" />
                            <span>OUTSIDE COVERAGE</span>
                          </span>
                          <span className="text-[11px] font-mono text-earth-500">
                            Model A &amp; Model B: Inactive Outside NER
                          </span>
                        </div>
                      </div>

                      {/* Environmental Readout for Outside Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-earth-500">PRECIPITATION (OPEN-METEO)</span>
                          <div className="text-base font-bold font-serif text-earth-900">
                            {riskAssessment.rainfall_24hr ?? 0} mm (24h)
                          </div>
                          <p className="text-[11px] text-earth-600">7-Day: {riskAssessment.rainfall_7day ?? 0} mm</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-earth-500">SOIL MOISTURE</span>
                          <div className="text-base font-bold font-serif text-earth-900">
                            {riskAssessment.soil_moisture ?? 0}%
                          </div>
                          <p className="text-[11px] text-earth-600">Depth: 28-100cm</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-earth-500">COVERAGE STATUS</span>
                          <div className="text-base font-bold font-serif text-earth-800">
                            Outside NER Grid
                          </div>
                          <p className="text-[11px] text-earth-600">Coverage active in 8 NER States</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                const level = riskAssessment?.risk_level || 'Moderate';
                const levelBorders = {
                  Critical: 'border-risk-critical',
                  High: 'border-risk-high',
                  Moderate: 'border-risk-moderate',
                  Low: 'border-risk-low',
                  'Outside Coverage': 'border-earth-300',
                }[level] || 'border-earth-300';

                return (
                  <div className={`p-6 sm:p-8 rounded-3xl bg-white border-2 ${levelBorders} shadow-xs space-y-6`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-200 pb-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-earth-600 font-bold block mb-1">
                          CURRENT LANDSLIDE RISK ASSESSMENT
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <RiskBadge severity={level === 'Outside Coverage' ? 'low' : (level.toLowerCase() as any)} size="lg" />
                          {riskAssessment?.risk_score != null && (
                            <span className="text-base sm:text-lg font-mono text-earth-800 font-semibold">
                              ({(riskAssessment.risk_score * 100).toFixed(1)}%)
                            </span>
                          )}
                          {riskAssessment?.susceptibility_score != null && (
                            <span className="text-xs sm:text-sm font-mono text-earth-600 font-normal">
                              &bull; Terrain Susceptibility: {riskAssessment.susceptibility_level || 'Active'} ({(riskAssessment.susceptibility_score * 100).toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1">
                        <span className="text-xs font-mono font-bold text-earth-800 uppercase">
                          {level === 'Critical' ? 'EVACUATION ALERT' : level === 'High' ? 'HEIGHTENED VIGILANCE' : level === 'Moderate' ? 'MONITOR CONDITIONS' : 'STABLE SLOPE (LOW RISK)'}
                        </span>
                        <span className="text-[11px] font-mono text-earth-500">
                          Model A Susceptibility: Active &bull; Model B Dynamic Risk: Active
                        </span>
                      </div>
                    </div>

                    {riskAssessment?.coverage_warning && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>{riskAssessment.coverage_warning}</span>
                      </div>
                    )}

                    {/* 4 Environmental & Terrain Dynamic Readings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Slope & Terrain */}
                      <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-earth-500">
                            TERRAIN SLOPE
                          </span>
                          <span className="text-xs font-mono text-brand-700 font-bold">
                            200M GRID
                          </span>
                        </div>
                        <div className="text-base font-bold font-serif text-earth-900">
                          {riskAssessment?.static_features?.slope != null 
                            ? `${riskAssessment.static_features.slope.toFixed(1)}° inclination`
                            : '—'}
                        </div>
                        <p className="text-[11px] text-earth-600">
                          Elevation: {riskAssessment?.static_features?.elevation != null ? `${Math.round(riskAssessment.static_features.elevation)} m MSL` : '—'}
                        </p>
                      </div>

                      {/* Soil & Land Cover */}
                      <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-earth-500">
                            SOIL COMPOSITION
                          </span>
                          <span className="text-xs font-mono text-brand-700 font-bold">
                            STATIC
                          </span>
                        </div>
                        <div className="text-base font-bold font-serif text-earth-900 truncate">
                          {getDominantSoilType(riskAssessment?.static_features)}
                        </div>
                        <p className="text-[11px] text-earth-600 truncate">
                          Cover: {LAND_COVER_LABELS[riskAssessment?.static_features?.land_cover_class ?? ''] || (riskAssessment?.static_features?.land_cover_class ? `Class ${riskAssessment.static_features.land_cover_class}` : 'Mountainous Hillside')}
                        </p>
                      </div>

                      {/* Live Precipitation & Moisture with (sample data) badge */}
                      <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-earth-500 flex items-center gap-1">
                            <CloudRain className="w-3 h-3 text-brand-700" />
                            <span>PRECIPITATION</span>
                          </span>
                          {riskAssessment && (
                            riskAssessment.is_live_data_mocked ? (
                              <span className="text-[8px] font-mono text-amber-800 font-semibold px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">
                                (sample data)
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono text-brand-800 font-semibold px-1.5 py-0.5 rounded bg-brand-100 border border-brand-300">
                                Live Open-Meteo
                              </span>
                            )
                          )}
                        </div>
                        <div className="text-base font-bold font-serif text-earth-900">
                          {riskAssessment?.rainfall_24hr != null ? `${riskAssessment.rainfall_24hr} mm` : '0.0 mm'} (24h)
                        </div>
                        <p className="text-[11px] text-earth-600 flex items-center justify-between">
                          <span>7-Day: {riskAssessment?.rainfall_7day != null ? `${riskAssessment.rainfall_7day} mm` : '0.0 mm'}</span>
                          <span>Moist: {riskAssessment?.soil_moisture != null ? `${riskAssessment.soil_moisture}%` : '0.0%'}</span>
                        </p>
                      </div>

                      {/* Match & Coverage */}
                      <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-earth-500">
                            GRID RESOLUTION
                          </span>
                          <span className="text-xs font-mono text-brand-700 font-bold">
                            EPSG:6933
                          </span>
                        </div>
                        <div className="text-base font-bold font-serif text-earth-900">
                          {riskAssessment?.grid_match_distance_m != null ? `${riskAssessment.grid_match_distance_m} m match` : 'Exact 200m Cell'}
                        </div>
                        <p className="text-[11px] text-earth-600">
                          Nearest 15M Northeast point
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* DEDICATED GIS MAP PROMO CARD */}
              <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#1E4A26] uppercase font-bold tracking-wider">
                    INTERACTIVE SPATIAL GIS
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#141712] uppercase">
                    EXPLORE HIGH-RESOLUTION SLOPE &amp; INFRASTRUCTURE MAP
                  </h3>
                  <p className="text-xs text-[#434A3E] font-sans">
                    Switch to the GIS Map tab to inspect hillside roads, villages, emergency hospitals, historical landslide zones, and click anywhere in Northeast India to inspect live risk.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('GIS MAP')}
                  className="px-5 py-3 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-sm border-2 border-[#143524]"
                >
                  <Map className="w-4 h-4" />
                  <span>OPEN GIS MAP &rarr;</span>
                </button>
              </div>

            {/* "WHAT SHOULD I DO?" Actionable Safety Advice */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#BCB29E] space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EAF4EC] border border-[#A8D9B2] text-[#1E4A26]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-serif text-[#141712] uppercase">
                    WHAT SHOULD YOU DO RIGHT NOW?
                  </h2>
                  <span className="text-[10px] font-mono text-[#6B7263] uppercase">
                    OFFICIAL LOCAL SAFETY GUIDELINES
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E4B33] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#141712] leading-relaxed font-sans">
                    <strong className="text-[#141712] block mb-0.5 font-bold">Stay Clear of Slopes</strong>
                    Avoid standing near steep road cuts, retaining walls, or downhill ravines.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E4B33] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#141712] leading-relaxed font-sans">
                    <strong className="text-[#141712] block mb-0.5 font-bold">Check for Warning Signs</strong>
                    Look for sudden cracks in soil, leaning utility poles, or muddy water bubbling.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E4B33] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#141712] leading-relaxed font-sans">
                    <strong className="text-[#141712] block mb-0.5 font-bold">Prepare Emergency Go-Bag</strong>
                    Keep torch, medications, important documents, and charged phones readily accessible.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1E4B33] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#141712] leading-relaxed font-sans">
                    <strong className="text-[#141712] block mb-0.5 font-bold">Monitor SMS &amp; App Alerts</strong>
                    Keep your registered mobile on loud volume for emergency broadcasts.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setShowCameraModal(true)}
                className="p-5 rounded-2xl bg-[#1E4B33] hover:bg-[#143524] border-2 border-[#143524] text-white font-bold uppercase transition-all cursor-pointer shadow-md flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-sans font-bold tracking-wider">
                      REPORT A HAZARD
                    </div>
                    <div className="text-xs font-sans font-normal text-white/90">
                      Submit observed cracks or road damage
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('ALERTS')}
                className="p-5 rounded-2xl bg-white hover:bg-[#F5F1E6] border-2 border-[#BCB29E] hover:border-[#1E4B33] text-[#141712] font-bold uppercase transition-all cursor-pointer shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#F7D8C4] border border-[#E8B291] flex items-center justify-center text-[#B5551F]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-sans font-bold tracking-wider">
                      VIEW ACTIVE ALERTS
                    </div>
                    <div className="text-xs font-sans font-normal text-[#6B7263]">
                      {riskAssessment?.risk_level === 'Critical' || riskAssessment?.risk_level === 'High'
                        ? 'Emergency hazard advisory active'
                        : riskAssessment?.risk_level === 'Outside Coverage'
                        ? 'Outside Northeast coverage'
                        : 'Normal monitoring status'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#434A3E]" />
              </button>
            </div>

            {/* Designated Evacuation Point Banner */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#BCB29E] space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#D5CCA8] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF4EC] border border-[#A8D9B2] flex items-center justify-center text-[#1E4A26] shrink-0">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#1E4A26] font-bold block">
                      DESIGNATED EVACUATION POINT
                    </span>
                    <h3 className="text-base font-bold font-serif text-[#141712] uppercase">
                      {locationState?.areaName
                        ? `DISTRICT RELIEF FACILITY // ${locationState.areaName.toUpperCase()}`
                        : 'DISTRICT EMERGENCY RELIEF SHELTER'}
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#EAF4EC] border border-[#A8D9B2] text-[#1E4A26] text-[10px] font-mono font-bold uppercase self-start sm:self-auto">
                  AUTHORITY VERIFIED SAFE SHELTER
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="text-[#434A3E]">
                  <span className="text-[#6B7263] block text-[9px] uppercase">DISTANCE:</span>
                  <span className="text-[#141712] font-bold">Nearest Designated Uphill Shelter</span>
                </div>
                <div className="text-[#434A3E]">
                  <span className="text-[#6B7263] block text-[9px] uppercase">SAFE CORRIDOR:</span>
                  <span className="text-[#1E4A26] font-bold">Uphill Ridge Crest (Away from cuts)</span>
                </div>
                <div className="text-[#434A3E]">
                  <span className="text-[#6B7263] block text-[9px] uppercase">ROUTE STATUS:</span>
                  <span className="text-[#141712] font-bold">State Disaster Mgmt Authority (SDMA)</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-[#6B7263] italic">
                  * Only authority-designated relief locations are shown. Never seek shelter in unverified sites.
                </p>
                <button
                  onClick={() => setShowEvacuationModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer w-full sm:w-auto text-center shadow-sm border-2 border-[#143524]"
                >
                  VIEW EVACUATION ROUTE &rarr;
                </button>
              </div>
            </div>
          </div>
        )
      )}

        {/* ==================================================== */}
        {/* 2. GIS MAP — DEDICATED SPATIAL HAZARD EXPLORER      */}
        {/* ==================================================== */}
        {activeTab === 'GIS MAP' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-700 font-bold block mb-1">
                  NORTHEAST INDIA SPATIAL INTELLIGENCE
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 uppercase tracking-tight">
                  INTERACTIVE GIS HAZARD MAP
                </h1>
                <p className="text-xs sm:text-sm text-earth-600 mt-1 font-sans">
                  Explore active infrastructure layers or click anywhere within Northeast India to query live AI susceptibility (Model A) &amp; risk (Model B).
                </p>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-earth-300 self-start sm:self-auto text-xs font-mono text-earth-800 shadow-xs">
                <MapPin className="w-4 h-4 text-brand-700 animate-pulse" />
                <span className="font-semibold">
                  GPS: {(locationState?.latitude ?? authUser?.last_latitude ?? 23.7271).toFixed(4)}°, {(locationState?.longitude ?? authUser?.last_longitude ?? 92.7176).toFixed(4)}°
                </span>
                <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 text-[9px] font-bold uppercase border border-brand-200">
                  {locationState?.isDemo ? 'DEMO NER' : 'LOCATED'}
                </span>
              </div>
            </div>

            {/* Full-width Map Container */}
            <div className="relative rounded-3xl border border-earth-300 bg-white h-[750px] overflow-hidden shadow-xs">
              <MapComponent
                className="h-full w-full"
                userLocation={
                  locationState
                    ? {
                        latitude: locationState.latitude,
                        longitude: locationState.longitude,
                        areaName: locationState.areaName || 'My Location',
                        isDemo: locationState.isDemo,
                      }
                    : authUser?.last_latitude && authUser?.last_longitude
                    ? {
                        latitude: authUser.last_latitude,
                        longitude: authUser.last_longitude,
                        areaName: authUser.address_label || 'My Location',
                      }
                    : {
                        latitude: 23.7271,
                        longitude: 92.7176,
                        areaName: 'Durtlang Ridge, Aizawl (Central NER)',
                        isDemo: true,
                      }
                }
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. REPORT HAZARD — CITIZEN GROUND REPORTING          */}
        {/* ==================================================== */}
        {activeTab === 'REPORT HAZARD' && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="border-b border-earth-200 pb-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-700 font-bold block mb-1">
                CITIZEN GROUND OBSERVATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 uppercase tracking-tight">
                REPORT A HAZARD
              </h1>
              <p className="text-xs sm:text-sm text-earth-600 mt-1 font-sans">
                Notice a ground crack, rockfall, or road erosion? Submit your observation to assist authorized field officers.
              </p>
            </div>

            {!locationState ? (
              /* Locked State if No Location */
              <div className="p-8 rounded-3xl bg-white border border-earth-300 text-center space-y-5 max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase text-amber-800 font-bold tracking-wider block">
                    LOCATION REQUIRED
                  </span>
                  <h3 className="text-lg font-bold font-serif uppercase text-earth-900">
                    ENABLE LOCATION ACCESS BEFORE CAPTURING HAZARD EVIDENCE
                  </h3>
                  <p className="text-xs text-earth-600 max-w-md mx-auto leading-relaxed font-sans">
                    Every hazard evidence item must be geo-associated. Please allow device location permission to unlock the camera capture and reporting workflow.
                  </p>
                </div>
                {locationErrorMsg && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
                    {locationErrorMsg}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={requestLocation}
                    disabled={isLocating}
                    className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                  >
                    {isLocating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span>ALLOW LOCATION ACCESS</span>
                  </button>
                </div>
              </div>
            ) : isSubmitted ? (
              /* Submission Confirmation State */
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-brand-300 text-center space-y-5 shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-800">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase text-brand-800 font-bold block tracking-wider">
                    REPORT SUBMITTED
                  </span>
                  <h3 className="text-xl font-bold font-serif uppercase text-earth-900">
                    REFERENCE ID: {submittedReportId}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold uppercase my-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>STATUS: NEW (PENDING VERIFICATION)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-earth-700 max-w-md mx-auto font-sans">
                    Your report with verified device coordinates and live camera evidence has been sent to the Field Officer for verification.
                  </p>
                </div>

                {/* Important Realism Disclaimer */}
                <div className="p-4 rounded-xl bg-earth-50 border border-earth-200 text-left max-w-lg mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-earth-800 uppercase">
                    <Info className="w-4 h-4 shrink-0 text-brand-700" />
                    <span>IMPORTANT FIELD VERIFICATION PROTOCOL</span>
                  </div>
                  <p className="text-xs text-earth-700 leading-relaxed font-sans">
                    A citizen report is ground-level supporting evidence. A photo or video submission does <strong>not</strong> automatically alter official regional hazard risk ratings. An authorized Field Officer must inspect and verify the report before it becomes operational intelligence.
                  </p>
                </div>

                {/* Action to submit another or view alerts */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setDescription('');
                      setCapturedPhotos([]);
                      setCapturedVideo(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#141712] font-mono text-xs uppercase font-bold transition-all cursor-pointer border-2 border-[#BCB29E] shadow-2xs"
                  >
                    SUBMIT ANOTHER REPORT
                  </button>
                  <button
                    onClick={() => setActiveTab('MY RISK')}
                    className="px-6 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-sm border-2 border-[#143524]"
                  >
                    RETURN TO MY RISK
                  </button>
                </div>
              </div>
            ) : (
              /* Report Input Form */
              <form onSubmit={handleSubmitReport} className="rounded-3xl border-2 border-[#BCB29E] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                {/* 1. Report Location (Mandatory & Verified) */}
                <div className="p-4 rounded-2xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5CCA8] pb-2.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1E4B33]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#141712]">
                        REPORT LOCATION
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={isLocating}
                      className="px-3 py-1 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#1E4B33] font-mono text-[10px] uppercase font-bold flex items-center gap-1 border-2 border-[#BCB29E] transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>REFRESH LOCATION</span>
                    </button>
                  </div>
                  <p className="text-xs text-earth-600 font-sans">
                    Your current device location will be attached to this hazard report.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                      <span className="text-earth-500 block text-[9px] uppercase">LATITUDE</span>
                      <span className="text-earth-900 font-bold">{locationState.latitude.toFixed(6)}°</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                      <span className="text-earth-500 block text-[9px] uppercase">LONGITUDE</span>
                      <span className="text-earth-900 font-bold">{locationState.longitude.toFixed(6)}°</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                      <span className="text-earth-500 block text-[9px] uppercase">ACCURACY</span>
                      <span className="text-brand-800 font-bold">~{Math.round(locationState.accuracy)} m</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                      <span className="text-earth-500 block text-[9px] uppercase">CAPTURED TIME</span>
                      <span className="text-earth-900 font-bold">{new Date(locationState.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Camera-Only Evidence Capture */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase text-earth-700 block font-bold">
                      2. CAPTURE LIVE EVIDENCE (CAMERA ONLY)
                    </label>
                    <span className="text-[10px] font-mono text-earth-500">
                      NO GALLERY UPLOAD &bull; LIVE SENSOR ONLY
                    </span>
                  </div>

                  {/* Photos Section */}
                  <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-earth-900">
                        <Camera className="w-4 h-4 text-accent-700" />
                        <span>PHOTOS: {capturedPhotos.length} / 5</span>
                      </div>
                      {capturedPhotos.length >= 5 ? (
                        <span className="text-[10px] font-mono text-accent-800">
                          Maximum of 5 photos reached.
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCameraMode('photo');
                            setIsCameraOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-accent-700 hover:bg-accent-800 text-white font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>CAPTURE PHOTO</span>
                        </button>
                      )}
                    </div>

                    {capturedPhotos.length === 0 ? (
                      <p className="text-xs text-earth-500 italic py-2 font-sans">
                        No photos captured yet. Click &quot;CAPTURE PHOTO&quot; to open the device camera.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        {capturedPhotos.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="relative rounded-xl border border-earth-200 bg-white overflow-hidden group shadow-xs"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={`Hazard Photo ${idx + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-2 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-brand-800 font-semibold">
                                <span>PHOTO {idx + 1} &bull; GEO-TAGGED</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(photo.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors p-0.5 cursor-pointer"
                                  title="Remove Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="text-[9px] font-mono text-earth-500">
                                📍 {photo.latitude.toFixed(4)}°, {photo.longitude.toFixed(4)}° (±{Math.round(photo.accuracy)}m)
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Section */}
                  <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-earth-900">
                        <Video className="w-4 h-4 text-red-600" />
                        <span>VIDEO: {capturedVideo ? 1 : 0} / 1 (MAX 10S)</span>
                      </div>
                      {capturedVideo ? (
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-red-700 font-mono text-[10px] uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer border border-earth-300"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>RETAKE VIDEO</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCameraMode('video');
                            setIsCameraOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>CAPTURE VIDEO</span>
                        </button>
                      )}
                    </div>

                    {!capturedVideo ? (
                      <p className="text-xs text-earth-500 italic py-2 font-sans">
                        No video recorded yet. Max 10 seconds auto-stop with GPS association.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-earth-200 bg-white p-3 space-y-2">
                        <video
                          src={capturedVideo.dataUrl}
                          controls
                          className="w-full max-h-48 rounded-lg bg-black"
                        />
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-brand-800 font-bold">
                            📍 GPS: {capturedVideo.latitude.toFixed(4)}°, {capturedVideo.longitude.toFixed(4)}°
                          </span>
                          <span className="text-accent-800 font-bold">
                            DURATION: {capturedVideo.durationSec.toFixed(1)}s (AUTO-STOPPED)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. What problem did you observe? */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono uppercase text-earth-700 block font-bold">
                    3. WHAT PROBLEM DID YOU OBSERVE?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      'Ground Crack',
                      'Soil Erosion',
                      'Water Seepage',
                      'Rockfall',
                      'Road Damage',
                      'Other',
                    ].map((type) => {
                      const isSelected = reportType === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setReportType(type)}
                          className={`p-3 rounded-xl border-2 text-xs font-mono font-bold uppercase transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#1E4B33] text-white border-[#143524] shadow-sm'
                              : 'bg-[#F5F1E6] border-[#D5CCA8] text-[#141712] hover:border-[#1E4B33] hover:bg-[#EDE7DC]'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Describe the Problem */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-[#434A3E] block font-bold">
                    4. DESCRIBE THE PROBLEM
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you observed (e.g., 'Large crack observed beside the road after heavy rainfall. Water is seeping through the retaining wall.')..."
                    className="w-full p-3.5 bg-white border-2 border-[#BCB29E] rounded-xl text-xs font-sans text-[#141712] placeholder:text-[#888E7F] focus:outline-none focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 transition-all"
                  />
                </div>

                {/* Error Warning if submission failed */}
                {submitError && (
                  <div className="p-3 rounded-xl bg-[#FDF2F0] border-2 border-[#F2BCA0] text-[#8A2418] text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#8A2418]" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Realism Reassurance */}
                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-2.5 text-[11px] font-mono text-[#434A3E]">
                  <Info className="w-4 h-4 text-[#1E4B33] shrink-0 mt-0.5" />
                  <span>
                    Your report acts as vital supporting ground evidence. An authorized Field Officer reviews and verifies reports before official alerts are updated.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#B5551F] hover:bg-[#964214] border-2 border-[#873A10] disabled:opacity-50 text-white font-sans font-bold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>TRANSMITTING REPORT...</span>
                    </>
                  ) : (
                    <span>SUBMIT REPORT &rarr;</span>
                  )}
                </button>
              </form>
            )}

            {/* Recent Submitted Reports History */}
            <div className="rounded-2xl border border-earth-300 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-earth-200 pb-2">
                <span className="text-xs font-mono font-bold uppercase text-earth-900">
                  YOUR RECENT CITIZEN REPORTS
                </span>
                <span className="text-[10px] font-mono text-earth-500 uppercase">
                  VERIFICATION STATUS TRACKER
                </span>
              </div>

              <div className="space-y-2.5">
                {citizenReports.length === 0 ? (
                  <div className="py-8 text-center text-earth-500 font-mono text-xs space-y-1">
                    <p className="text-earth-700 font-bold uppercase">No hazard reports submitted yet</p>
                    <p className="text-[11px] text-earth-500">Use the form above to report active cracks, rockfall, or road erosion with camera evidence.</p>
                  </div>
                ) : (
                  citizenReports.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-earth-50 border border-earth-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-earth-900 uppercase">
                            {item.id} &bull; {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              item.status === 'VERIFIED'
                                ? 'bg-brand-100 text-brand-800 border border-brand-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {item.status === 'VERIFIED' ? 'VERIFIED BY OFFICER' : 'PENDING VERIFICATION'}
                          </span>
                        </div>
                        <p className="text-xs text-earth-700 font-sans">
                          {item.description}
                        </p>
                        <div className="text-[10px] font-mono text-earth-500">
                          {item.location} &bull; {item.timestamp}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {item.status === 'VERIFIED' ? (
                          <span className="text-[10px] font-mono text-brand-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Logged in Risk Model</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-800 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Field Officer Reviewing</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. ALERTS — CITIZEN WARNINGS & NOTIFICATIONS         */}
        {/* ==================================================== */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-700 font-bold block mb-1">
                  EMERGENCY WARNINGS &bull; MSG91 SMS SENTINEL
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 uppercase tracking-tight">
                  MY ALERTS &bull; {locationState?.areaName || profileLocation}
                </h1>
                <p className="text-xs sm:text-sm text-earth-600 mt-1 font-sans">
                  Targeted disaster alerts driven by Model B live risk, dispatched via MSG91 Flow API.
                </p>
              </div>

              {/* SMS Gateway Status Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-earth-300 self-start sm:self-auto text-xs font-mono shadow-xs">
                <span className={`w-2 h-2 rounded-full ${alertStatus?.is_configured ? 'bg-brand-600 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-earth-900 font-bold">
                  {alertStatus?.is_configured ? 'MSG91 GATEWAY ACTIVE' : 'MSG91 STANDBY (SIMULATION)'}
                </span>
              </div>
            </div>

            {/* Connection Explanatory Banner */}
            <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
              <div className="text-xs text-earth-700 leading-relaxed font-sans">
                <strong className="text-earth-900 font-mono block uppercase text-[11px] mb-0.5">
                  UNIFIED MSG91 FLOW SMS + APP ALERT SYSTEM
                </strong>
                Emergency landslide notifications to <span className="text-earth-900 font-semibold font-mono">{profilePhone}</span> are dispatched directly via MSG91 Flow API v5 in strict compliance with India DLT regulations. Duplicate suppression and a {alertStatus?.cooldown_minutes || 60}-minute cooldown are automatically enforced.
              </div>
            </div>

            {/* Case 1: Outside Northeast India */}
            {riskAssessment?.risk_level === 'Outside Coverage' ? (
              <div className="p-6 rounded-3xl bg-white border border-earth-300 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-earth-100 border border-earth-200 flex items-center justify-center text-earth-700">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-earth-600">
                      COVERAGE BOUNDARY NOTICE
                    </span>
                    <h3 className="text-lg font-bold font-serif uppercase text-earth-900">
                      LOCATION OUTSIDE NORTHEAST INDIA (NER)
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-earth-700 leading-relaxed font-sans">
                  Your coordinates ({locationState?.latitude.toFixed(4)}°, {locationState?.longitude.toFixed(4)}°) are outside the 8 states of Northeast India.
                  The AI Landslide Hazard Susceptibility and Dynamic Live Risk models operate exclusively within the NER boundary. No local landslide evacuation warnings apply.
                </p>
                {riskAssessment?.rainfall_24hr !== undefined && riskAssessment?.rainfall_24hr !== null && (
                  <div className="p-3.5 rounded-xl bg-earth-50 border border-earth-200 flex flex-wrap gap-4 text-xs font-mono">
                    <span className="text-earth-700">
                      Local 24h Rain: <strong className="text-earth-900">{riskAssessment.rainfall_24hr} mm</strong>
                    </span>
                    <span className="text-earth-700">
                      Local Soil Moisture: <strong className="text-earth-900">{riskAssessment.soil_moisture !== null ? (riskAssessment.soil_moisture > 1.0 ? riskAssessment.soil_moisture.toFixed(1) : (riskAssessment.soil_moisture * 100).toFixed(1)) + '%' : 'N/A'}</strong>
                    </span>
                    <span className="text-earth-500">
                      Source: Open-Meteo Live API
                    </span>
                  </div>
                )}
              </div>
            ) : riskAssessment?.risk_level === 'Critical' || riskAssessment?.risk_level === 'High' ? (
              /* Case 2: Critical / High Risk Active Alert */
              <div className="p-6 rounded-3xl bg-red-50 border-2 border-red-300 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-800">
                          EVACUATION ALERT // READINESS ADVISORY
                        </span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-mono font-bold uppercase border border-red-300">
                          {riskAssessment.risk_level.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-serif uppercase text-red-950">
                        {locationState?.areaName ? locationState.areaName.toUpperCase() : 'REGISTERED HILLSIDE SECTOR'}
                      </h3>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-earth-600">
                    <span>
                      TELEMETRY: {riskAssessment.computed_at ? new Date(riskAssessment.computed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-red-950 font-medium leading-relaxed font-sans">
                  Your coordinates have triggered a heightened landslide risk assessment (Risk Score: {riskAssessment.risk_score ? (riskAssessment.risk_score * 100).toFixed(1) + '%' : 'High'}).
                  Continuous precipitation ({riskAssessment.rainfall_24hr ?? 0} mm 24h) and elevated soil moisture ({riskAssessment.soil_moisture ? (riskAssessment.soil_moisture > 1.0 ? riskAssessment.soil_moisture.toFixed(1) : (riskAssessment.soil_moisture * 100).toFixed(1)) + '%' : 'Saturated'}) have saturated slopes. Follow instructions from local disaster-management authorities.
                </p>

                {/* Designated Evacuation Point & Route */}
                <div className="p-4 rounded-2xl bg-white border border-earth-300 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-earth-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-brand-700" />
                      <span className="text-xs font-mono font-bold text-brand-800 uppercase">
                        DESIGNATED EVACUATION POINT: {locationState?.areaName ? locationState.areaName.toUpperCase() : 'LOCAL SECTOR'} RELIEF CENTRE
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-brand-800 font-bold uppercase">
                      ROUTE STATUS: VERIFIED SAFE CORRIDOR
                    </span>
                  </div>

                  <div className="text-xs text-earth-700 space-y-1 font-sans">
                    <div>
                      <strong className="text-earth-900">Safe Route:</strong> Follow uphill ridge access roads. Stay along designated safety corridors away from deep cuts and slope edges.
                    </div>
                    <div className="text-earth-500 text-[11px]">
                      * Only authority-designated relief locations are shown. Never seek shelter in unverified sites.
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEvacuationModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer w-full sm:w-auto text-center shadow-sm border-2 border-[#143524]"
                  >
                    VIEW EVACUATION ROUTE &rarr;
                  </button>
                </div>

                {/* Acknowledge Button */}
                <div className="pt-1 flex items-center justify-end">
                  {acknowledgedAlerts.includes('alert-evac') ? (
                    <span className="text-xs font-mono text-[#1E4A26] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1E4B33]" />
                      <span>ACKNOWLEDGED BY YOU</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledgeAlert('alert-evac')}
                      className="px-5 py-2.5 rounded-xl bg-[#8A2418] hover:bg-[#6D1B12] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm border-2 border-[#6D1B12]"
                    >
                      ACKNOWLEDGE WARNING &rarr;
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Case 3: Low or Moderate Normal Monitoring */
              <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] space-y-3 shadow-sm">
                <div className="flex items-center gap-3 border-b-2 border-[#D5CCA8] pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF4EC] border border-[#A8D9B2] flex items-center justify-center text-[#1E4A26] shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E4A26]">
                      NORMAL MONITORING &bull; NO EVACUATION ORDER
                    </span>
                    <h3 className="text-lg font-bold font-serif uppercase text-[#141712]">
                      ALL CLEAR // {locationState?.areaName || 'YOUR AREA'}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#434A3E] leading-relaxed font-sans">
                  Live risk telemetry indicates {riskAssessment?.risk_level || 'LOW'} hazard level (Risk score: {riskAssessment?.risk_score ? (riskAssessment.risk_score * 100).toFixed(1) + '%' : 'Nominal'}). Precipitation and soil moisture levels remain within stable thresholds.
                </p>
              </div>
            )}

            {/* Real Open-Meteo Weather Surge Alert Card */}
            {riskAssessment && (riskAssessment.rainfall_24hr !== null || riskAssessment.soil_moisture !== null) && (
              <div className="p-5 rounded-2xl bg-white border-2 border-[#BCB29E] space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#D5CCA8] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#EAF4EC] text-[#1E4A26]">
                      <CloudRain className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase text-[#1E4A26]">
                        LIVE WEATHER TELEMETRY // OPEN-METEO
                      </span>
                      <h3 className="text-sm font-bold font-serif uppercase text-[#141712]">
                        {(riskAssessment.rainfall_24hr ?? 0) > 40
                          ? 'HEAVY MONSOON PRECIPITATION DETECTED'
                          : (riskAssessment.rainfall_24hr ?? 0) > 15
                          ? 'MODERATE MONSOON SHOWER ACTIVITY'
                          : 'STABLE ATMOSPHERIC CONDITIONS'}
                      </h3>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#6B7263]">
                    <span>
                      UPDATED: {riskAssessment.computed_at ? new Date(riskAssessment.computed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LIVE'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8]">
                    <span className="text-[#6B7263] block text-[9px] uppercase">24H RAINFALL:</span>
                    <span className="text-[#141712] font-bold">{riskAssessment.rainfall_24hr ?? 0} mm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8]">
                    <span className="text-[#6B7263] block text-[9px] uppercase">SOIL MOISTURE:</span>
                    <span className="text-[#141712] font-bold">{riskAssessment.soil_moisture !== null ? (riskAssessment.soil_moisture * 100).toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8]">
                    <span className="text-[#6B7263] block text-[9px] uppercase">SUSCEPTIBILITY:</span>
                    <span className="text-[#141712] font-bold">{riskAssessment.susceptibility_score !== null ? (riskAssessment.susceptibility_score * 100).toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8]">
                    <span className="text-[#6B7263] block text-[9px] uppercase">STATUS:</span>
                    <span className="text-[#1E4A26] font-bold">Synchronized</span>
                  </div>
                </div>

                <p className="text-xs text-[#434A3E] leading-relaxed font-sans">
                  Real-time precipitation and root-zone soil saturation are ingested directly from Open-Meteo API to dynamically drive Landslide Model B.
                </p>
              </div>
            )}

            {/* ==================================================== */}
            {/* EMERGENCY SMS DISPATCH CONSOLE (MSG91 INTEGRATION)   */}
            {/* ==================================================== */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#D5CCA8] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7D8C4] border border-[#E8B291] flex items-center justify-center text-[#B5551F] shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B5551F]">
                      EMERGENCY SMS SENTINEL // CITIZEN DISPATCH
                    </span>
                    <h3 className="text-lg font-bold font-serif uppercase text-[#141712]">
                      DISPATCH SMS EARLY WARNING
                    </h3>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#434A3E]">
                  <span>DLT SENDER ID: <strong className="text-[#141712]">{alertStatus?.sender_id || 'LANDSL'}</strong></span>
                </div>
              </div>

              <p className="text-xs text-[#434A3E] font-sans leading-relaxed">
                Test or trigger an immediate high-priority SMS advisory to your registered or specified Indian mobile number. The dispatch pipeline routes through the FastAPI Alert Service and MSG91 Flow API v5.
              </p>

              {/* Input and Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="Enter Indian Mobile (e.g. 9862044102)"
                    className="w-full px-4 py-3 bg-white border-2 border-[#BCB29E] rounded-xl text-xs font-mono text-[#141712] focus:outline-none focus:border-[#1E4B33] focus:ring-4 focus:ring-[#1E4B33]/20 transition-all"
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-mono text-[#6B7263] uppercase">
                    INDIA (+91)
                  </span>
                </div>

                <button
                  onClick={handleTriggerTestAlert}
                  disabled={isSendingAlert}
                  className="px-6 py-3 rounded-xl bg-[#B5551F] hover:bg-[#964214] border-2 border-[#873A10] disabled:opacity-50 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  {isSendingAlert ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>DISPATCHING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SEND EMERGENCY SMS</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback Banner */}
              {alertFeedback && (
                <div className={`p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 transition-all ${
                  alertFeedback.type === 'success'
                    ? 'bg-brand-50 border border-brand-300 text-brand-900'
                    : alertFeedback.type === 'throttled'
                    ? 'bg-amber-50 border border-amber-300 text-amber-900'
                    : 'bg-red-50 border border-red-200 text-red-900'
                }`}>
                  {alertFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-brand-700" />
                  ) : alertFeedback.type === 'throttled' ? (
                    <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  )}
                  <span className="leading-relaxed">{alertFeedback.message}</span>
                </div>
              )}
            </div>

            {/* ==================================================== */}
            {/* LIVE ALERT AUDIT LOG                                 */}
            {/* ==================================================== */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#BCB29E] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-[#D5CCA8] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EDE7DC] border border-[#BCB29E] flex items-center justify-center text-[#141712]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif uppercase text-[#141712]">
                      OFFICIAL DISPATCH AUDIT LOG
                    </h3>
                    <span className="text-[10px] font-mono text-[#6B7263] block">
                      IMMUTABLE TRANSACTION TRAIL // MSG91 DISPATCH RECORDS
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsLoadingAlerts(true);
                    AlertService.getHistory(25).then(hist => {
                      setAlertHistory(hist);
                      setIsLoadingAlerts(false);
                    });
                  }}
                  disabled={isLoadingAlerts}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] border-2 border-[#BCB29E] text-[11px] font-mono font-bold text-[#141712] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
                  <span>REFRESH</span>
                </button>
              </div>

              {alertHistory.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-earth-400" />
                  <p className="text-xs font-mono text-earth-700 uppercase font-semibold">
                    NO DISPATCH RECORDS LOGGED YET
                  </p>
                  <p className="text-[11px] text-earth-500 font-sans">
                    Dispatched emergency notifications will be securely registered here with masked recipient identifiers.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-earth-800">
                    <thead>
                      <tr className="border-b border-earth-200 text-earth-600 uppercase text-[10px]">
                        <th className="py-2.5 px-3">RECIPIENT</th>
                        <th className="py-2.5 px-3">RISK LEVEL</th>
                        <th className="py-2.5 px-3">LOCATION</th>
                        <th className="py-2.5 px-3">STATUS</th>
                        <th className="py-2.5 px-3">GATEWAY</th>
                        <th className="py-2.5 px-3">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-earth-100">
                      {alertHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-earth-50 transition-colors">
                          <td className="py-2.5 px-3 text-earth-900 font-bold whitespace-nowrap">
                            {item.recipient_masked}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.risk_level === 'CRITICAL' || item.risk_level === 'Critical'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : item.risk_level === 'HIGH' || item.risk_level === 'High'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-brand-100 text-brand-800 border border-brand-200'
                            }`}>
                              {item.risk_level}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-earth-800 max-w-[150px] truncate">
                            {item.location_name || 'Northeast Region'}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.status === 'SENT' || item.status === 'SUBMITTED'
                                ? 'bg-brand-100 text-brand-800 border border-brand-200'
                                : item.status === 'THROTTLED'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-earth-500 uppercase text-[10px]">
                            {item.provider}
                          </td>
                          <td className="py-2.5 px-3 text-earth-500 text-[10px] whitespace-nowrap">
                            {new Date(item.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 4. PROFILE — CITIZEN ACCOUNT & PREFERENCES           */}
        {/* ==================================================== */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div className="border-b border-earth-200 pb-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-700 font-bold block mb-1">
                CITIZEN ACCOUNT
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-earth-900 uppercase tracking-tight">
                PROFILE &bull; {profileName}
              </h1>
              <p className="text-xs sm:text-sm text-earth-600 mt-1 font-sans">
                Manage your registered residential location and emergency notification preferences.
              </p>
            </div>

            {profileSavedSuccess && (
              <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile information updated successfully!</span>
              </div>
            )}

            {isEditingProfile ? (
              /* Profile Edit Form */
              <form onSubmit={handleSaveProfile} className="rounded-3xl border border-earth-300 bg-white p-6 space-y-4 shadow-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-earth-700 block font-semibold">
                    FULL NAME:
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-3 bg-earth-50 border border-earth-300 rounded-xl text-xs font-mono text-earth-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-earth-700 block font-semibold">
                    PHONE (SMS ALERTS):
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full p-3 bg-earth-50 border border-earth-300 rounded-xl text-xs font-mono text-earth-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-earth-700 block font-semibold">
                    REGISTERED LOCATION / AREA:
                  </label>
                  <input
                    type="text"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full p-3 bg-earth-50 border border-earth-300 rounded-xl text-xs font-mono text-earth-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-earth-700 block font-semibold">
                    DISTRICT / STATE:
                  </label>
                  <input
                    type="text"
                    value={profileDistrict}
                    onChange={(e) => setProfileDistrict(e.target.value)}
                    className="w-full p-3 bg-earth-50 border border-earth-300 rounded-xl text-xs font-mono text-earth-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white border-2 border-[#143524] font-mono font-bold text-xs uppercase cursor-pointer shadow-sm"
                  >
                    SAVE CHANGES
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-5 py-3 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#141712] font-mono font-bold text-xs uppercase cursor-pointer border-2 border-[#BCB29E] shadow-2xs"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Display Card */
              <div className="rounded-3xl border-2 border-[#BCB29E] bg-white p-6 space-y-4 shadow-sm text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-[#D5CCA8]">
                  <span className="text-[#6B7263] uppercase">FULL NAME:</span>
                  <span className="text-[#141712] font-bold">{profileName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#D5CCA8]">
                  <span className="text-[#6B7263] uppercase">PHONE (SMS ALERTS):</span>
                  <span className="text-[#1E4A26] font-bold">{profilePhone}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#D5CCA8]">
                  <span className="text-[#6B7263] uppercase">REGISTERED LOCATION:</span>
                  <span className="text-[#141712] font-bold">{profileLocation}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#D5CCA8]">
                  <span className="text-[#6B7263] uppercase">DISTRICT / STATE:</span>
                  <span className="text-[#141712] font-bold">{profileDistrict}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#D5CCA8]">
                  <span className="text-[#6B7263] uppercase">ACCOUNT ROLE:</span>
                  <span className="text-[#1E4A26] font-bold">CITIZEN (SAFETY TIER 1)</span>
                </div>

                <div className="flex justify-between py-2 border-b border-[#D5CCA8]">
                  <span className="text-[#6B7263] uppercase">DEVICE LOCATION PERMISSION:</span>
                  <span className="text-[#1E4A26] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E4B33]" />
                    <span>GRANTED FOR HAZARD REPORTS</span>
                  </span>
                </div>

                {/* Notification Preferences */}
                <div className="pt-2 space-y-2">
                  <span className="text-[#434A3E] uppercase block text-[10px] font-semibold">
                    NOTIFICATION PREFERENCES:
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] cursor-pointer">
                      <span className="text-[#141712]">SMS Emergency Warnings</span>
                      <input
                        type="checkbox"
                        checked={smsAlertsEnabled}
                        onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#1E4B33] cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] cursor-pointer">
                      <span className="text-[#141712]">App Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={appAlertsEnabled}
                        onChange={(e) => setAppAlertsEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[#1E4B33] cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-3">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full py-3 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#141712] font-mono font-bold text-xs uppercase transition-all cursor-pointer border-2 border-[#BCB29E] shadow-2xs"
                  >
                    EDIT PROFILE INFORMATION
                  </button>
                </div>
              </div>
            )}

            {/* Strict Role Security Notice */}
            <div className="p-4 rounded-xl bg-earth-50 border border-earth-200 text-[11px] font-mono text-earth-600 space-y-1">
              <div className="text-earth-800 font-bold uppercase">SECURITY NOTICE:</div>
              <p>
                This account operates under the Citizen Access Tier. Administrative controls, Field Officer verification tools, and full GIS spatial layers are restricted to authorized disaster-management personnel.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* EVACUATION ROUTE GUIDANCE MODAL                      */}
      {/* ==================================================== */}
      {showEvacuationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141712]/75 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-lg bg-white border-2 border-[#BCB29E] rounded-3xl p-6 shadow-2xl space-y-5 text-[#141712]">
            <div className="flex items-center justify-between border-b-2 border-[#D5CCA8] pb-3">
              <div className="flex items-center gap-2.5 text-[#1E4A26]">
                <Navigation className="w-5 h-5" />
                <h3 className="text-base font-bold font-serif text-[#141712] uppercase">
                  AUTHORITY EVACUATION ROUTE
                </h3>
              </div>
              <button
                onClick={() => setShowEvacuationModal(false)}
                className="w-8 h-8 rounded-xl border border-[#BCB29E] bg-[#EDE7DC] flex items-center justify-center text-[#141712] hover:bg-[#DED7C8] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shelter & Corridor Summary */}
            <div className="p-4 rounded-2xl bg-[#EAF4EC] border border-[#A8D9B2] space-y-1.5">
              <span className="text-[10px] font-mono text-[#1E4A26] font-bold uppercase">
                DESIGNATED DESTINATION:
              </span>
              <div className="text-sm font-bold font-serif text-[#141712] uppercase">
                {locationState?.areaName
                  ? `COMMUNITY RELIEF FACILITY (${locationState.areaName.toUpperCase()})`
                  : 'DISTRICT DESIGNATED RELIEF FACILITY'}
              </div>
              <div className="text-xs text-[#434A3E]">
                Ridge Crest Sector &bull; Authority Verified Safe Elevation Corridor
              </div>
            </div>

            {/* Step-by-Step Evacuation Steps */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-[#6B7263] font-bold block">
                SAFE STEP-BY-STEP CORRIDOR:
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#EAF4EC] text-[#1E4A26] border border-[#A8D9B2] flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-[#141712] block">Move Uphill Away From Slope Cuts &amp; Drainage Paths</strong>
                    Follow the uphill road markers away from natural drainage ravines and steep soil cuts.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#EAF4EC] text-[#1E4A26] border border-[#A8D9B2] flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-[#141712] block">Continue Along Designated Paved Arteries</strong>
                    Follow main ridge arteries monitored by district field teams. Stay clear of fresh ground fissures or sagging roadside retaining walls.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#EAF4EC] text-[#1E4A26] border border-[#A8D9B2] flex items-center justify-center text-[10px] font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-[#141712] block">Arrive at Community Relief Shelter</strong>
                    Disaster response officers will register evacuees, provide drinking water, and assign dry shelter beds.
                  </div>
                </div>
              </div>
            </div>

            {/* Helpline Contacts */}
            <div className="p-3.5 rounded-xl bg-[#F5F1E6] border border-[#D5CCA8] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#1E4B33]" />
                <span className="text-[#6B7263]">EMERGENCY ASSISTANCE:</span>
              </div>
              <span className="text-[#1E4A26] font-bold">1070 / 112</span>
            </div>

            <button
              onClick={() => setShowEvacuationModal(false)}
              className="w-full py-3 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase cursor-pointer shadow-sm border-2 border-[#143524]"
            >
              CLOSE ROUTE GUIDANCE
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* LOCATION PERMISSION EXPLANATION PROMPT MODAL        */}
      {/* ==================================================== */}
      {locationPermissionStatus === 'PROMPT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141712]/75 backdrop-blur-sm animate-fade-in text-left">
          <div className="relative w-full max-w-md bg-white border-2 border-[#BCB29E] rounded-3xl p-6 shadow-2xl space-y-5 text-[#141712]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-[#141712] uppercase tracking-tight">
                  LOCATION PERMISSION REQUIRED
                </h3>
                <span className="text-[10px] font-mono text-amber-800 uppercase tracking-wider block font-semibold">
                  Mandatory For Landslide Monitoring
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F1E6] border border-[#D5CCA8] space-y-3 text-xs text-[#434A3E] font-sans leading-relaxed">
              <p>
                To provide your local landslide risk level and allow you to report hazards, Bhuraksha 2.0 needs access to your device location.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 space-y-1">
                <div className="font-bold uppercase tracking-wider text-amber-950">How your location is used:</div>
                <ul className="list-disc pl-4 space-y-1 text-amber-900">
                  <li>Compute active slope hazard &amp; rainfall risk telemetry for your exact sector.</li>
                  <li>Tag verified GPS coordinates on submitted ground-crack and rockfall evidence.</li>
                  <li>No continuous background tracking — location is queried only with your action.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={requestLocation}
                disabled={isLocating}
                className="w-full py-3.5 rounded-xl bg-[#1E4B33] hover:bg-[#143524] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm border-2 border-[#143524] flex items-center justify-center gap-2"
              >
                {isLocating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>ALLOW LOCATION ACCESS</span>
              </button>
              <button
                type="button"
                onClick={() => setLocationPermissionStatus('DENIED')}
                className="w-full py-2.5 rounded-xl bg-[#EDE7DC] hover:bg-[#E2DBD0] text-[#141712] font-mono font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer border-2 border-[#BCB29E] shadow-2xs"
              >
                NOT NOW (LIMITED MODE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* LIVE CAMERA CAPTURE MODAL (PHOTO & 10S VIDEO)       */}
      {/* ==================================================== */}
      <CitizenCameraModal
        isOpen={isCameraOpen && cameraMode !== null}
        mode={cameraMode || 'photo'}
        onClose={() => {
          setIsCameraOpen(false);
          setCameraMode(null);
        }}
        currentLocation={locationState}
        onPhotoCaptured={(photo) => {
          setCapturedPhotos((prev) => [...prev, photo].slice(0, 5));
          setIsCameraOpen(false);
          setCameraMode(null);
        }}
        onCapturePhoto={(photo) => {
          setCapturedPhotos((prev) => [...prev, photo].slice(0, 5));
          setIsCameraOpen(false);
          setCameraMode(null);
        }}
        onVideoCaptured={(video) => {
          setCapturedVideo(video);
          setIsCameraOpen(false);
          setCameraMode(null);
        }}
        onCaptureVideo={(video) => {
          setCapturedVideo(video);
          setIsCameraOpen(false);
          setCameraMode(null);
        }}
        onRefreshLocation={async () => locationState}
      />

    </div>
  );
};
