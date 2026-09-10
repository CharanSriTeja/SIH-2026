# Location Mode Configuration Guide (SIH 2026 GIS)

This guide explains how to toggle between **Demo Mode** (sample Northeast Region coordinates) and **Real GPS Mode** in the `frontend1` application.

---

## 1. Overview

Because development and testing frequently occur outside the Northeast Region (NER) of India (e.g., in Andhra Pradesh, Delhi, Karnataka), `frontend1` includes a **Location Mode** toggle:

| Mode | Environment Variable Value | Behavior |
|---|---|---|
| **Demo Mode** *(Default in Local Dev)* | `VITE_LOCATION_MODE=demo` | Randomly picks from 9 realistic Northeast Region towns/cities on each session. Shows a visible **"DEMO MODE — Using sample location"** banner. Saves the location to the backend database seamlessly. |
| **Real Mode** *(Production)* | `VITE_LOCATION_MODE=real` | Uses standard browser `navigator.geolocation` to read the device's real GPS latitude and longitude. If outside NER boundaries, notifies the user and provides a fallback sample point. |

---

## 2. Configuration (`.env.local`)

In the `frontend1` root directory, create or edit `.env.local`:

### For Local Testing / Demo:
```env
VITE_LOCATION_MODE=demo
```

### For Production Deployment:
```env
VITE_LOCATION_MODE=real
```

> **Note**: Changes to `.env.local` take effect when the Vite dev server restarts or upon running `npm run build`.

---

## 3. Sample NER Locations in Demo Mode

When in Demo Mode, a random location is selected from the 8 NER states:
1. **Shillong, Meghalaya** (25.5788° N, 91.8933° E)
2. **Gangtok, Sikkim** (27.3389° N, 88.6065° E)
3. **Kohima, Nagaland** (25.6751° N, 94.1086° E)
4. **Itanagar, Arunachal Pradesh** (27.0844° N, 93.6053° E)
5. **Aizawl, Mizoram** (23.7271° N, 92.7176° E)
6. **Imphal, Manipur** (24.8170° N, 93.9368° E)
7. **Guwahati, Assam** (26.1445° N, 91.7362° E)
8. **Agartala, Tripura** (23.8315° N, 91.2868° E)
9. **Tawang, Arunachal Pradesh** (27.5861° N, 91.8594° E)

---

## 4. UI Indicators

When Demo Mode is active:
- A persistent warning badge appears at the top of the **Citizen Dashboard**:
  `DEMO MODE — Using sample location: [Location Name]`
- Weather cards and risk panels display a `(sample data)` badge to clearly communicate to evaluators and users that mocked rainfall and soil moisture data are being utilized.

---

## 5. Deployment Checklist
1. Set `VITE_LOCATION_MODE=real` in production environment / CI/CD pipeline variables.
2. Run `npm run build` to compile the production bundle.
3. Verify backend FastAPI service is running on the target server.
