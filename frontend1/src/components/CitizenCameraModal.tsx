import React, { useEffect, useRef, useState } from 'react';
import { Camera, Video, X, RotateCcw, Check, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { CitizenLocationState, GeoTaggedPhoto, GeoTaggedVideo } from '../types';

interface CitizenCameraModalProps {
  isOpen: boolean;
  mode: 'photo' | 'video';
  onClose: () => void;
  onPhotoCaptured?: (photo: GeoTaggedPhoto) => void;
  onCapturePhoto?: (photo: GeoTaggedPhoto) => void;
  onVideoCaptured?: (video: GeoTaggedVideo) => void;
  onCaptureVideo?: (video: GeoTaggedVideo) => void;
  currentLocation: CitizenLocationState | null;
  onRefreshLocation?: () => Promise<CitizenLocationState | null>;
}

export const CitizenCameraModal: React.FC<CitizenCameraModalProps> = ({
  isOpen,
  mode,
  onClose,
  onPhotoCaptured,
  onCapturePhoto,
  onVideoCaptured,
  onCaptureVideo,
  currentLocation,
  onRefreshLocation,
}) => {

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Photo Capture & Preview
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CitizenLocationState | null>(null);

  // Video Recording & Preview
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState<string | null>(null);
  const [capturedVideoDuration, setCapturedVideoDuration] = useState<number>(0);

  const [locationError, setLocationError] = useState<string | null>(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (facing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera capture is not supported on this device/browser. Please use a supported mobile browser.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: mode === 'video',
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else {
        setCameraError('Camera capture is not supported on this device/browser. Please use a supported mobile browser.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const resetState = () => {
    setCapturedPhotoUrl(null);
    setCapturedVideoUrl(null);
    setCapturedLocation(null);
    setIsRecording(false);
    setRecordingSeconds(0);
    setLocationError(null);
    setIsVerifyingLocation(false);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // -------------------------------------------------------------
  // PHOTO CAPTURE
  // -------------------------------------------------------------
  const handleCapturePhoto = async () => {
    setLocationError(null);
    setIsVerifyingLocation(true);

    // Verify / obtain location before accepting photo
    let loc = currentLocation;
    if (!loc && typeof onRefreshLocation === 'function') {
      loc = await onRefreshLocation();
    }
    setIsVerifyingLocation(false);

    if (!loc) {
      setLocationError('Photo capture requires a valid device location.');
      return;
    }

    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setCapturedPhotoUrl(dataUrl);
    setCapturedLocation({ ...loc, timestamp: Date.now() });
  };

  const handleConfirmPhoto = () => {
    if (!capturedPhotoUrl || !capturedLocation) return;

    const photoItem: GeoTaggedPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      dataUrl: capturedPhotoUrl,
      latitude: capturedLocation.latitude,
      longitude: capturedLocation.longitude,
      accuracy: capturedLocation.accuracy,
      capturedAt: capturedLocation.timestamp,
    };

    if (typeof onPhotoCaptured === 'function') {
      onPhotoCaptured(photoItem);
    }
    if (typeof onCapturePhoto === 'function') {
      onCapturePhoto(photoItem);
    }
    onClose();
  };

  const handleRetakePhoto = () => {
    setCapturedPhotoUrl(null);
    setCapturedLocation(null);
    setLocationError(null);
  };

  // -------------------------------------------------------------
  // VIDEO CAPTURE (STRICT 10-SECOND LIMIT)
  // -------------------------------------------------------------
  const handleStartRecording = async () => {
    setLocationError(null);
    setIsVerifyingLocation(true);

    let loc = currentLocation;
    if (!loc && typeof onRefreshLocation === 'function') {
      loc = await onRefreshLocation();
    }
    setIsVerifyingLocation(false);

    if (!loc) {
      setLocationError('Video recording requires a valid device location.');
      return;
    }

    if (!stream) return;

    setCapturedLocation({ ...loc, timestamp: Date.now() });
    recordedChunksRef.current = [];

    try {
      const options: MediaRecorderOptions = { mimeType: 'video/webm' };
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        // fallback
        mediaRecorderRef.current = new MediaRecorder(stream);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedVideoUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Strict 10-second timer
      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        setRecordingSeconds(Math.min(10, Math.floor(elapsedSec)));

        if (elapsedSec >= 10) {
          handleStopRecording(10.0);
        }
      }, 200);
    } catch (err) {
      console.error('Failed to start media recorder:', err);
      setLocationError('Could not start video recorder on this device.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = (finalDuration?: number) => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setCapturedVideoDuration(finalDuration ?? Math.min(10, recordingSeconds));
  };

  const handleConfirmVideo = () => {
    if (!capturedVideoUrl || !capturedLocation) return;

    const videoItem: GeoTaggedVideo = {
      id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      dataUrl: capturedVideoUrl,
      latitude: capturedLocation.latitude,
      longitude: capturedLocation.longitude,
      accuracy: capturedLocation.accuracy,
      capturedAt: capturedLocation.timestamp,
      durationSec: Math.min(10, capturedVideoDuration || 10),
    };

    if (typeof onVideoCaptured === 'function') {
      onVideoCaptured(videoItem);
    }
    if (typeof onCaptureVideo === 'function') {
      onCaptureVideo(videoItem);
    }
    onClose();
  };

  const handleRetakeVideo = () => {
    setCapturedVideoUrl(null);
    setCapturedLocation(null);
    setRecordingSeconds(0);
    setLocationError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-earth-900/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#FFFDF8] border border-earth-300 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-earth-200 bg-earth-50">
          <div className="flex items-center gap-2.5">
            {mode === 'photo' ? (
              <div className="p-2 rounded-xl bg-accent-100 text-accent-700 border border-accent-200">
                <Camera className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-risk-critical/15 text-risk-critical border border-risk-critical/30">
                <Video className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold font-serif uppercase text-earth-900 tracking-wider">
                {mode === 'photo' ? 'CAPTURE HAZARD EVIDENCE PHOTO' : 'RECORD HAZARD VIDEO (MAX 10S)'}
              </h3>
              <span className="text-[10px] font-mono text-earth-600 block">
                OFFICIAL SENSOR CAPTURE &bull; GEO-TAG ENFORCED
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white border border-earth-200 hover:bg-earth-100 text-earth-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] sm:min-h-[380px] overflow-hidden">
          {cameraError ? (
            /* Unsupported / Denied State */
            <div className="p-6 text-center space-y-3 max-w-xs mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <p className="text-xs text-red-300 font-mono leading-relaxed">
                {cameraError}
              </p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer"
              >
                RETRY CAMERA
              </button>
            </div>
          ) : capturedPhotoUrl ? (
            /* Photo Preview State */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhotoUrl}
                alt="Captured Hazard Evidence"
                className="w-full h-full object-contain max-h-[55vh]"
              />
              {/* Floating GPS Stamp */}
              {capturedLocation && (
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-earth-900/85 border border-white/20 backdrop-blur-sm text-[11px] font-mono text-earth-100 flex items-center justify-between">
                  <span>📍 GPS: {capturedLocation.latitude.toFixed(6)}°, {capturedLocation.longitude.toFixed(6)}°</span>
                  <span className="text-earth-300 ml-2">(±{Math.round(capturedLocation.accuracy)}m)</span>
                </div>
              )}
            </div>
          ) : capturedVideoUrl ? (
            /* Video Preview State */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={capturedVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain max-h-[55vh]"
              />
              {/* Floating GPS & Duration Stamp */}
              {capturedLocation && (
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-earth-900/85 border border-white/20 backdrop-blur-sm text-[11px] font-mono text-earth-100 flex justify-between items-center">
                  <span>📍 GPS: {capturedLocation.latitude.toFixed(6)}°, {capturedLocation.longitude.toFixed(6)}°</span>
                  <span className="text-accent-300 font-bold">DURATION: {capturedVideoDuration.toFixed(1)}s</span>
                </div>
              )}
            </div>
          ) : (
            /* Live Camera Viewfinder */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Crosshairs */}
              <div className="absolute inset-8 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[10px] font-mono text-white/70">
                  <span>[ LIVE SENSOR ]</span>
                  <span>{facingMode === 'environment' ? 'REAR' : 'FRONT'}</span>
                </div>
                <div className="text-center text-[10px] font-mono text-white/60 tracking-wider">
                  POINT AT CRACK, ROCKFALL, OR ROAD RUNOFF
                </div>
              </div>

              {/* Video Recording Timer Badge */}
              {isRecording && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-risk-critical text-white font-mono text-xs font-bold flex items-center gap-2 border border-white/40 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:10</span>
                </div>
              )}

              {/* Switch Camera Button (Mobile) */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 border border-white/30 text-white hover:bg-black/80 transition-colors cursor-pointer"
                title="Switch Camera"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Location Error Warning */}
        {locationError && (
          <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 text-risk-critical text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Modal Controls Footer */}
        <div className="p-4 bg-earth-50 border-t border-earth-200 flex items-center justify-between gap-3">
          {capturedPhotoUrl ? (
            /* Photo Confirmation Controls */
            <>
              <button
                type="button"
                onClick={handleRetakePhoto}
                className="px-4 py-2.5 rounded-xl bg-white border border-earth-300 hover:bg-earth-100 text-earth-800 font-mono text-xs uppercase font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETAKE</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-mono text-xs uppercase font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>ATTACH PHOTO</span>
              </button>
            </>
          ) : capturedVideoUrl ? (
            /* Video Confirmation Controls */
            <>
              <button
                type="button"
                onClick={handleRetakeVideo}
                className="px-4 py-2.5 rounded-xl bg-white border border-earth-300 hover:bg-earth-100 text-earth-800 font-mono text-xs uppercase font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETAKE</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmVideo}
                className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-mono text-xs uppercase font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>ATTACH VIDEO</span>
              </button>
            </>
          ) : mode === 'photo' ? (
            /* Live Photo Shutter Control */
            <div className="w-full flex items-center justify-between">
              <div className="text-[11px] font-mono text-earth-600">
                {currentLocation ? (
                  <span className="text-brand-800 font-semibold">📍 GPS READY (±{Math.round(currentLocation.accuracy)}m)</span>
                ) : (
                  <span className="text-amber-800 font-semibold">ACQUIRING GPS LOCK...</span>
                )}
              </div>

              <button
                type="button"
                disabled={Boolean(cameraError) || isVerifyingLocation}
                onClick={handleCapturePhoto}
                className="px-6 py-2.5 rounded-xl bg-accent-700 hover:bg-accent-800 disabled:opacity-50 text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                {isVerifyingLocation ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>CAPTURE PHOTO</span>
              </button>
            </div>
          ) : (
            /* Live Video Shutter Control */
            <div className="w-full flex items-center justify-between">
              <div className="text-[11px] font-mono text-earth-600">
                {isRecording ? (
                  <span className="text-risk-critical font-bold">RECORDING ACTIVE</span>
                ) : (
                  <span>MAX 10 SECONDS AUTO-STOP</span>
                )}
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={() => handleStopRecording()}
                  className="px-6 py-2.5 rounded-xl bg-risk-critical hover:bg-risk-critical/90 text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs animate-pulse"
                >
                  <span className="w-3 h-3 bg-white rounded-sm" />
                  <span>STOP RECORDING</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={Boolean(cameraError) || isVerifyingLocation}
                  onClick={handleStartRecording}
                  className="px-6 py-2.5 rounded-xl bg-risk-critical hover:bg-risk-critical/90 disabled:opacity-50 text-white font-mono text-xs uppercase font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {isVerifyingLocation ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  <span>START 10S VIDEO</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
