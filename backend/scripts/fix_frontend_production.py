import os
import re

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend1")

def fix_landscape_canvas():
    path = os.path.join(FRONTEND_DIR, "src", "components", "LandscapeCanvas.tsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # In preloadImages, only load remaining frames if firstImg loads successfully
    old_preload = """    function preloadImages() {
      // 1. Frame 0 priority for instant first paint
      const firstImg = new Image();
      firstImg.onload = () => {
        isLoaded[0] = true;
        resizeCanvas();
        drawFrame(0, true);
      };
      firstImg.src = getFramePath(0);
      images[0] = firstImg;
      if (firstImg.complete) {
        isLoaded[0] = true;
        resizeCanvas();
        drawFrame(0, true);
      }

      // 2. Preload remaining frames
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const index = i;
        img.onload = () => {
          isLoaded[index] = true;
          const currentTarget = Math.round(currentFrameFloat);
          if (currentTarget === index && drawnImageIndex !== index) {
            drawFrame(index, true);
          }
        };
        img.src = getFramePath(index);
        images[index] = img;
        if (img.complete) {
          isLoaded[index] = true;
        }
      }
    }"""

    new_preload = """    function preloadImages() {
      // 1. Frame 0 priority for instant first paint
      const firstImg = new Image();
      let framesAvailable = false;

      const loadRemainingFrames = () => {
        if (!framesAvailable) return;
        for (let i = 1; i < TOTAL_FRAMES; i++) {
          const img = new Image();
          const index = i;
          img.onload = () => {
            isLoaded[index] = true;
            const currentTarget = Math.round(currentFrameFloat);
            if (currentTarget === index && drawnImageIndex !== index) {
              drawFrame(index, true);
            }
          };
          img.src = getFramePath(index);
          images[index] = img;
          if (img.complete) {
            isLoaded[index] = true;
          }
        }
      };

      firstImg.onload = () => {
        framesAvailable = true;
        isLoaded[0] = true;
        resizeCanvas();
        drawFrame(0, true);
        loadRemainingFrames();
      };
      firstImg.onerror = () => {
        // Frames not available on server, avoid 240 missing asset 404s
        framesAvailable = false;
      };
      firstImg.src = getFramePath(0);
      images[0] = firstImg;

      if (firstImg.complete && firstImg.naturalWidth > 0) {
        framesAvailable = true;
        isLoaded[0] = true;
        resizeCanvas();
        drawFrame(0, true);
        loadRemainingFrames();
      }
    }"""

    if old_preload in content:
        content = content.replace(old_preload, new_preload)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated LandscapeCanvas.tsx")
    else:
        print("LandscapeCanvas.tsx target preload not found or already updated")

def fix_location_prompt_modal():
    path = os.path.join(FRONTEND_DIR, "src", "components", "auth", "LocationPromptModal.tsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Add API_BASE
    if "const API_BASE = " not in content:
        content = re.sub(
            r"(import.*from 'lucide-react';)",
            r"\1\n\nconst API_BASE = import.meta.env.VITE_API_URL || '';",
            content,
            count=1
        )

    # Update /profile/location
    content = content.replace("await axios.post(\n          '/profile/location',", "await axios.post(\n          `${API_BASE}/profile/location`,")
    content = content.replace("await axios.post('/profile/location',", "await axios.post(`${API_BASE}/profile/location`,")

    # Update Geolocation error fallback
    old_err = """      (err) => {
        console.warn('Geolocation error:', err.message);
        setStatus('DENIED');
        setErrorMessage(err.message || 'Location permission denied by browser.');
      },"""
    new_err = """      (err) => {
        console.warn('Geolocation error (using NER default):', err.message);
        const sample = getRandomNerLocation();
        setAssignedSample(sample);
        setStatus('OUTSIDE_NER');
        setCountdown(3);
      },"""
    if old_err in content:
        content = content.replace(old_err, new_err)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated LocationPromptModal.tsx")

def fix_citizen_dashboard():
    path = os.path.join(FRONTEND_DIR, "src", "components", "CitizenDashboard.tsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Add API_BASE
    if "const API_BASE = " not in content:
        content = re.sub(
            r"(import axios from 'axios';)",
            r"\1\n\nconst API_BASE = import.meta.env.VITE_API_URL || '';",
            content,
            count=1
        )

    # Update /risk/my-location
    content = content.replace(
        "const resp = await axios.get<RiskAssessmentData>(`/risk/my-location?lat=${lat}&lon=${lon}`",
        "const resp = await axios.get<RiskAssessmentData>(`${API_BASE}/risk/my-location?lat=${lat}&lon=${lon}`"
    )

    # Update /profile/location calls
    content = content.replace("'/profile/location'", "`${API_BASE}/profile/location`")

    # Update Geolocation timeout error in detectLocation
    old_geo_err = """        (err) => {
          console.warn('Geolocation error:', err);
          setLocationPermissionStatus('DENIED');
          if (err.code === err.PERMISSION_DENIED) {
            setLocationErrorMsg('Location access was denied. Please allow location permissions in your browser settings.');
          } else {
            setLocationErrorMsg('Unable to obtain device location. Please check device GPS and try again.');
          }
          setIsLocating(false);
          resolve(null);
        },"""

    new_geo_err = """        (err) => {
          console.warn('Geolocation error or timeout, defaulting to NER sample location:', err);
          const fallbackSample = getRandomNerLocation();
          const fallbackLoc: CitizenLocationState = {
            latitude: fallbackSample.latitude,
            longitude: fallbackSample.longitude,
            altitude: null,
            accuracy: 50,
            timestamp: Date.now(),
            areaName: `${fallbackSample.name}, ${fallbackSample.state} (NER Sample)`,
            isPermissionGranted: true,
            isDemo: true,
          };
          setLocationState(fallbackLoc);
          setLocationPermissionStatus('GRANTED');
          setIsLocating(false);
          try {
            sessionStorage.setItem('bhuraksha_citizen_location', JSON.stringify(fallbackLoc));
            const token = localStorage.getItem('access_token');
            if (token) {
              axios.post(
                `${API_BASE}/profile/location`,
                { latitude: fallbackLoc.latitude, longitude: fallbackLoc.longitude },
                { headers: { Authorization: `Bearer ${token}` } }
              ).catch(() => {});
            }
          } catch {}
          fetchRiskAssessment(fallbackLoc.latitude, fallbackLoc.longitude);
          resolve(fallbackLoc);
        },"""

    if old_geo_err in content:
        content = content.replace(old_geo_err, new_geo_err)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated CitizenDashboard.tsx")

def fix_map_component():
    path = os.path.join(FRONTEND_DIR, "src", "components", "MapComponent.tsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Ensure API_BASE
    if "const API_BASE = " not in content:
        content = re.sub(
            r"(import axios from 'axios';)",
            r"\1\n\nconst API_BASE = import.meta.env.VITE_API_URL || '';",
            content,
            count=1
        )

    # Update getPmtilesUrl to use API_BASE
    old_pmtiles = """const getPmtilesUrl = (relativePath: string): string => {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'http://localhost:8000';
  const cleanBase = origin.replace(/\/+$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `pmtiles://${cleanBase}${cleanPath}`;
};"""
    new_pmtiles = """const getPmtilesUrl = (relativePath: string): string => {
  const apiBase = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
  const cleanBase = apiBase.replace(/\/+$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `pmtiles://${cleanBase}${cleanPath}`;
};"""

    if old_pmtiles in content:
        content = content.replace(old_pmtiles, new_pmtiles)
    else:
        # regex replace
        content = re.sub(
            r"const getPmtilesUrl = \(relativePath: string\): string => \{[\s\S]*?return `pmtiles://\$\{cleanBase\}\$\{cleanPath\}`;[\s\S]*?\};",
            new_pmtiles,
            content
        )

    # Update tiles endpoints
    content = content.replace("tiles: ['/tiles/susceptibility/{z}/{x}/{y}.png']", "tiles: [`${API_BASE}/tiles/susceptibility/{z}/{x}/{y}.png`]")
    content = content.replace("tiles: ['/tiles/risk/{z}/{x}/{y}.png']", "tiles: [`${API_BASE}/tiles/risk/{z}/{x}/{y}.png`]")
    content = content.replace("tiles: ['/tiles/rainfall/{z}/{x}/{y}.png']", "tiles: [`${API_BASE}/tiles/rainfall/{z}/{x}/{y}.png`]")
    content = content.replace("tiles: ['/tiles/soil-moisture/{z}/{x}/{y}.png']", "tiles: [`${API_BASE}/tiles/soil-moisture/{z}/{x}/{y}.png`]")
    content = content.replace("tiles: ['/tiles/roads/{z}/{x}/{y}.pbf']", "tiles: [`${API_BASE}/tiles/roads/{z}/{x}/{y}.pbf`]")

    # Update alert summary and my-location calls
    content = content.replace("axios.get('/api/risk/alerts-today')", "axios.get(`${API_BASE}/api/risk/alerts-today`)")
    content = content.replace("axios.get<RiskDetailData>(`/risk/my-location?lat=${lat}&lon=${lon}`", "axios.get<RiskDetailData>(`${API_BASE}/risk/my-location?lat=${lat}&lon=${lon}`")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated MapComponent.tsx")

if __name__ == "__main__":
    fix_landscape_canvas()
    fix_location_prompt_modal()
    fix_citizen_dashboard()
    fix_map_component()
