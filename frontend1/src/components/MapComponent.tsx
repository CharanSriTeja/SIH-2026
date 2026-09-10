import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapComponent.css';
import axios from 'axios';
import { 
  ShieldAlert, 
  CloudRain, 
  Droplets, 
  Clock, 
  Layers, 
  X, 
  ChevronRight, 
  MapPin, 
  Activity, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Navigation
} from 'lucide-react';

// Register PMTiles protocol safely with MapLibre GL
try {
  const pmtilesProtocol = new pmtiles.Protocol();
  maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);
} catch (err) {
  // Protocol already registered in hot-reload
}

const getPmtilesUrl = (relativePath: string): string => {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'http://localhost:5173';
  return `pmtiles://${origin}${relativePath}`;
};

const LANDSLIDES_SOURCE_LAYER = 'landslides';
const VILLAGES_SOURCE_LAYER = 'villages';
const HOSPITALS_SOURCE_LAYER = 'hospitals';

// ESA CCI Land Cover classes — actual values in dataset
const LAND_COVER_LABELS: Record<string | number, string> = {
  10: 'Cropland (rainfed)',
  20: 'Cropland (irrigated)',
  30: 'Mosaic Cropland / Vegetation',
  40: 'Broadleaved Deciduous Forest',
  50: 'Broadleaved Evergreen Forest',
  60: 'Open Broadleaved Deciduous Forest',
  80: 'Open Needleleaved Forest',
  100: 'Mosaic Tree and Shrub',
};

export interface RiskDetailData {
  latitude: number;
  longitude: number;
  susceptibility_score: number | null;
  risk_score: number | null;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Outside Coverage';
  susceptibility_level?: 'Low' | 'Moderate' | 'High' | 'Critical';
  severity?: string;
  is_outside_ner?: boolean;
  rainfall_24hr: number;
  rainfall_7day: number;
  soil_moisture: number;
  is_live_data_mocked: boolean;
  grid_match_distance_m: number;
  coverage_warning?: string | null;
  computed_at: string;
}

export interface MapComponentProps {
  showNERBoundaries?: boolean;
  showRoads?: boolean;
  showLandslides?: boolean;
  showSusceptibility?: boolean;
  showHospitals?: boolean;
  showVillages?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
    areaName?: string;
    isDemo?: boolean;
  } | null;
  onLocationClick?: (coords: { lat: number; lon: number }) => void;
  className?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  showNERBoundaries = true,
  showRoads = true,
  showLandslides = true,
  showSusceptibility = true,
  showHospitals = true,
  showVillages = true,
  userLocation = null,
  onLocationClick,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hasCenteredRef = useRef<boolean>(false);

  // Active layer state allowing on-map interactive controls
  const [layers, setLayers] = useState({
    boundaries: showNERBoundaries,
    roads: showRoads,
    landslides: showLandslides,
    susceptibility: showSusceptibility,
    hospitals: showHospitals,
    villages: showVillages,
  });

  // Risk Assessment Detail Panel State
  const [riskData, setRiskData] = useState<RiskDetailData | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelLocationLabel, setPanelLocationLabel] = useState<string>('My Location');

  // Sync prop changes into internal layer state
  useEffect(() => {
    setLayers({
      boundaries: showNERBoundaries,
      roads: showRoads,
      landslides: showLandslides,
      susceptibility: showSusceptibility,
      hospitals: showHospitals,
      villages: showVillages,
    });
  }, [showNERBoundaries, showRoads, showLandslides, showSusceptibility, showHospitals, showVillages]);

  // Fetch risk assessment for coordinates
  const fetchRiskForLocation = async (lat: number, lon: number, label?: string) => {
    setIsLoadingRisk(true);
    if (label) setPanelLocationLabel(label);
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get<RiskDetailData>(`/risk/my-location?lat=${lat}&lon=${lon}`, { headers });
      setRiskData(res.data);
      setIsPanelOpen(true);
    } catch (err) {
      console.warn('Could not fetch risk for location:', err);
    } finally {
      setIsLoadingRisk(false);
    }
  };

  useEffect(() => {
    if (mapRef.current) return;

    const defaultCenter: [number, number] = userLocation 
      ? [userLocation.longitude, userLocation.latitude] 
      : [92.8, 25.8];

    const map = new maplibregl.Map({
      container: mapContainerRef.current!,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: defaultCenter,
      zoom: userLocation ? 9.5 : 6.8,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

    // Handle any map errors gracefully so the map continues rendering base layers
    map.on('error', (e) => {
      console.warn('[MapComponent] MapLibre warning/error:', e.error?.message || e);
    });

    map.on('load', () => {
      // Ensure canvas properly renders to full container dimensions after mount & CSS transitions
      map.resize();
      setTimeout(() => map.resize(), 100);
      setTimeout(() => map.resize(), 300);
      // -----------------------------------------------------------------------
      // 0. LANDSLIDE SUSCEPTIBILITY RASTER LAYER (Model A)
      // Placed directly above base map raster
      // -----------------------------------------------------------------------
      map.addSource('susceptibility-raster', {
        type: 'raster',
        tiles: ['/tiles/susceptibility/{z}/{x}/{y}.png'],
        tileSize: 256,
        minzoom: 4,
        maxzoom: 13,
        attribution: 'Model A — Landslide Susceptibility (SIH 2026)',
      });

      map.addLayer({
        id: 'susceptibility-layer',
        type: 'raster',
        source: 'susceptibility-raster',
        layout: {
          visibility: layers.susceptibility ? 'visible' : 'none',
        },
        paint: {
          'raster-opacity': 0.72,
          'raster-fade-duration': 200,
        },
      });

      // -----------------------------------------------------------------------
      // 1. NER STATE & DISTRICT BOUNDARY LAYERS
      // -----------------------------------------------------------------------
      map.addSource('ner-states-source', {
        type: 'geojson',
        data: '/api/gis/ner-states',
      });

      map.addLayer({
        id: 'ner-state-fill',
        type: 'fill',
        source: 'ner-states-source',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.05,
        },
      });

      map.addLayer({
        id: 'ner-state-outline',
        type: 'line',
        source: 'ner-states-source',
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 2.8,
        },
      });

      map.addLayer({
        id: 'ner-state-labels',
        type: 'symbol',
        source: 'ner-states-source',
        maxzoom: 8.0,
        layout: {
          'text-field': ['get', 'st_nm'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 14,
          'text-anchor': 'center',
          'text-transform': 'uppercase',
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5,
        },
      });

      map.addSource('ner-districts-source', {
        type: 'geojson',
        data: '/api/gis/ner-districts',
      });

      map.addLayer(
        {
          id: 'ner-district-outline',
          type: 'line',
          source: 'ner-districts-source',
          minzoom: 6.8,
          paint: {
            'line-color': '#64748b',
            'line-width': 1.0,
            'line-dasharray': [3, 2],
          },
        },
        'ner-state-outline'
      );

      // -----------------------------------------------------------------------
      // 2. VECTOR ROADS LAYER (MBTILES)
      // -----------------------------------------------------------------------
      map.addSource('roads-vector-source', {
        type: 'vector',
        tiles: ['/tiles/roads/{z}/{x}/{y}.pbf'],
        minzoom: 5,
        maxzoom: 14,
      });

      map.addLayer({
        id: 'roads-major',
        type: 'line',
        source: 'roads-vector-source',
        'source-layer': 'roads',
        minzoom: 5,
        filter: [
          'in',
          ['get', 'highway'],
          ['literal', ['motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link']],
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['match', ['get', 'highway'], 'motorway', '#dc2626', 'trunk', '#ea580c', '#d97706'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.2, 8, 2.2, 11, 3.8, 14, 5.5],
          'line-opacity': 0.95,
        },
      });

      map.addLayer(
        {
          id: 'roads-secondary',
          type: 'line',
          source: 'roads-vector-source',
          'source-layer': 'roads',
          minzoom: 7,
          filter: ['in', ['get', 'highway'], ['literal', ['secondary', 'secondary_link']]],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#2563eb',
            'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1.0, 10, 2.0, 14, 4.0],
            'line-opacity': 0.9,
          },
        },
        'roads-major'
      );

      map.addLayer(
        {
          id: 'roads-tertiary',
          type: 'line',
          source: 'roads-vector-source',
          'source-layer': 'roads',
          minzoom: 9.5,
          filter: ['in', ['get', 'highway'], ['literal', ['tertiary', 'tertiary_link']]],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#059669',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.9, 14, 2.8],
            'line-opacity': 0.85,
          },
        },
        'roads-secondary'
      );

      map.addLayer(
        {
          id: 'roads-labels',
          type: 'symbol',
          source: 'roads-vector-source',
          'source-layer': 'roads',
          minzoom: 8.5,
          filter: ['has', 'name'],
          layout: {
            'symbol-placement': 'line',
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold'],
            'text-size': 11,
            'text-letter-spacing': 0.05,
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2.0,
          },
        },
        'roads-tertiary'
      );

      // Road Click Inspection Popup
      ['roads-major', 'roads-secondary', 'roads-tertiary'].forEach((layerId) => {
        map.on('click', layerId, (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties || {};
          const title = props.name || props.ref || 'Road Segment';
          new maplibregl.Popup({ closeButton: true, closeOnClick: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family:sans-serif;padding:6px;min-width:180px;">
                <div style="font-weight:700;color:#1e3a8a;border-bottom:2px solid #3b82f6;padding-bottom:2px;margin-bottom:4px;">
                  🛣 ${title}
                </div>
                <div style="font-size:11px;color:#475569;">Class: <b>${(props.highway || 'road').toUpperCase()}</b></div>
                ${props.surface ? `<div style="font-size:11px;color:#475569;">Surface: <b>${props.surface}</b></div>` : ''}
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      // -----------------------------------------------------------------------
      // 3. VILLAGES LAYER (PMTILES)
      // -----------------------------------------------------------------------
      map.addSource('villages-source', {
        type: 'vector',
        url: getPmtilesUrl('/data/tiles/villages_ner.pmtiles'),
      });

      map.addLayer({
        id: 'villages-layer',
        type: 'circle',
        source: 'villages-source',
        'source-layer': VILLAGES_SOURCE_LAYER,
        minzoom: 6,
        layout: {
          visibility: layers.villages ? 'visible' : 'none',
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.0, 9, 3.5, 12, 5.5, 15, 8.0],
          'circle-color': '#d97706', // warm amber for settlements
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.0,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'villages-labels',
        type: 'symbol',
        source: 'villages-source',
        'source-layer': VILLAGES_SOURCE_LAYER,
        minzoom: 9.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          visibility: layers.villages ? 'visible' : 'none',
        },
        paint: {
          'text-color': '#78350f',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.0,
        },
      });

      // Village click inspection
      map.on('click', 'villages-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties || {};
        const vName = props.name || 'Unnamed Village';
        const vState = props.state || '';
        const pop = props.population ? `<div style="font-size:11px;color:#475569;">Population: <b>${props.population}</b></div>` : '';

        new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:sans-serif;padding:6px;min-width:180px;">
              <div style="font-weight:700;color:#92400e;border-bottom:2px solid #f59e0b;padding-bottom:2px;margin-bottom:4px;">
                🏘 ${vName}
              </div>
              ${vState ? `<div style="font-size:11px;color:#475569;">State: <b>${vState}</b></div>` : ''}
              ${pop}
            </div>
          `)
          .addTo(map);

        fetchRiskForLocation(e.lngLat.lat, e.lngLat.lng, vName);
      });

      map.on('mouseenter', 'villages-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'villages-layer', () => {
        map.getCanvas().style.cursor = '';
      });

      // -----------------------------------------------------------------------
      // 4. HISTORICAL LANDSLIDES LAYER (PMTILES)
      // -----------------------------------------------------------------------
      map.addSource('historical-landslides', {
        type: 'vector',
        url: getPmtilesUrl('/data/tiles/historical_landslides.pmtiles'),
      });

      map.addLayer({
        id: 'landslides-circles',
        type: 'circle',
        source: 'historical-landslides',
        'source-layer': LANDSLIDES_SOURCE_LAYER,
        layout: {
          visibility: layers.landslides ? 'visible' : 'none',
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 2.5, 6, 3.5, 8, 5.0, 10, 7.0, 13, 9.5],
          'circle-color': [
            'match',
            ['get', 'land_cover_class'],
            10, '#ca8a04',
            20, '#f59e0b',
            30, '#84cc16',
            40, '#65a30d',
            50, '#15803d',
            60, '#4d7c0f',
            80, '#166534',
            100, '#6d28d9',
            '#dc2626',
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 1.0,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', 'landslides-circles', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties || {};
        const state = props.state ?? 'Unknown';
        const elev = props.elevation_m != null ? `${props.elevation_m} m` : 'N/A';
        const slope = props.slope_deg != null ? `${props.slope_deg}°` : 'N/A';
        const lcClass = props.land_cover_class ?? '—';
        const lcLabel = props.land_cover || LAND_COVER_LABELS[lcClass] || 'Terrain';

        new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:sans-serif;padding:6px;min-width:200px;">
              <div style="font-weight:700;color:#991b1b;border-bottom:2px solid #ef4444;padding-bottom:3px;margin-bottom:6px;">
                🏔 Historical Landslide Event
              </div>
              <table style="width:100%;font-size:11px;">
                <tr><td style="color:#64748b;">State:</td><td style="font-weight:600;text-align:right;">${state}</td></tr>
                <tr><td style="color:#64748b;">Elevation:</td><td style="font-weight:600;text-align:right;">${elev}</td></tr>
                <tr><td style="color:#64748b;">Slope:</td><td style="font-weight:600;text-align:right;">${slope}</td></tr>
                <tr><td style="color:#64748b;">Land Cover:</td><td style="font-weight:600;text-align:right;">${lcLabel}</td></tr>
              </table>
            </div>
          `)
          .addTo(map);

        fetchRiskForLocation(e.lngLat.lat, e.lngLat.lng, `Landslide Site (${state})`);
      });

      map.on('mouseenter', 'landslides-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'landslides-circles', () => {
        map.getCanvas().style.cursor = '';
      });

      // -----------------------------------------------------------------------
      // 5. HOSPITALS LAYER (PMTILES) - Fixed with robust styling and popups
      // -----------------------------------------------------------------------
      map.addSource('hospitals-source', {
        type: 'vector',
        url: getPmtilesUrl('/data/hospitals/tiles/hospitals.pmtiles'),
      });

      map.addLayer({
        id: 'hospitals-layer',
        type: 'circle',
        source: 'hospitals-source',
        'source-layer': HOSPITALS_SOURCE_LAYER,
        layout: {
          visibility: layers.hospitals ? 'visible' : 'none',
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3.2, 7, 4.8, 10, 7.0, 14, 10.0],
          'circle-color': '#059669', // Vivid emerald green
          'circle-opacity': 0.92,
          'circle-stroke-width': 1.8,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'hospitals-symbol',
        type: 'symbol',
        source: 'hospitals-source',
        'source-layer': HOSPITALS_SOURCE_LAYER,
        minzoom: 10,
        layout: {
          'text-field': '🏥',
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 14, 16],
          'text-allow-overlap': true,
          visibility: layers.hospitals ? 'visible' : 'none',
        },
      });

      map.on('click', 'hospitals-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties || {};
        const hName = props.name || 'Emergency Medical Facility';
        const hType = props.hospital_type || 'Hospital';
        const hDistrict = props.district || '';
        const hState = props.state || '';
        const hPhone = props.phone ? `<div style="font-size:11px;color:#047857;">📞 Phone: <b>${props.phone}</b></div>` : '';

        new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:sans-serif;padding:6px;min-width:220px;">
              <div style="font-weight:700;color:#065f46;border-bottom:2px solid #059669;padding-bottom:3px;margin-bottom:6px;">
                🏥 ${hName}
              </div>
              <div style="font-size:11px;color:#334155;margin-bottom:2px;">Type: <b>${hType}</b></div>
              <div style="font-size:11px;color:#64748b;">${[hDistrict, hState].filter(Boolean).join(', ')}</div>
              ${hPhone}
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'hospitals-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'hospitals-layer', () => {
        map.getCanvas().style.cursor = '';
      });

      // -----------------------------------------------------------------------
      // 6. NATIVE WEBGPU/WEBGL USER LOCATION PIN (CANVAS-LEVEL)
      // Guarantees high-contrast visibility directly rendered inside the WebGL canvas
      // -----------------------------------------------------------------------
      const initialLat = userLocation?.latitude ?? 23.7271;
      const initialLon = userLocation?.longitude ?? 92.7176;

      map.addSource('user-gps-native-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [initialLon, initialLat],
              },
              properties: {
                title: userLocation?.areaName || 'YOU ARE HERE',
              },
            },
          ],
        },
      });

      // Native Canvas Outer Pulsing Radar Ring
      map.addLayer({
        id: 'user-gps-halo-layer',
        type: 'circle',
        source: 'user-gps-native-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 18, 9, 28, 14, 42],
          'circle-color': '#2563eb',
          'circle-opacity': 0.38,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#60a5fa',
          'circle-stroke-opacity': 0.9,
        },
      });

      // Native Canvas Crisp White Ring
      map.addLayer({
        id: 'user-gps-rim-layer',
        type: 'circle',
        source: 'user-gps-native-source',
        paint: {
          'circle-radius': 11,
          'circle-color': '#ffffff',
          'circle-opacity': 1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0f172a',
        },
      });

      // Native Canvas Solid Google-Blue Dot
      map.addLayer({
        id: 'user-gps-core-layer',
        type: 'circle',
        source: 'user-gps-native-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#1a73e8',
          'circle-opacity': 1,
        },
      });

      // Map global click for arbitrary location risk inspection
      map.on('click', (e) => {
        // Only trigger if no interactive vector feature was clicked
        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [e.point.x - 4, e.point.y - 4],
          [e.point.x + 4, e.point.y + 4],
        ];
        const features = map.queryRenderedFeatures(bbox, {
          layers: ['landslides-circles', 'villages-layer', 'hospitals-layer'],
        });
        if (features.length === 0) {
          fetchRiskForLocation(e.lngLat.lat, e.lngLat.lng, 'Inspected Coordinates');
          if (onLocationClick) onLocationClick({ lat: e.lngLat.lat, lon: e.lngLat.lng });
        }
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update layer visibility when state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Boundaries
    ['ner-state-fill', 'ner-state-outline', 'ner-state-labels', 'ner-district-outline'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', layers.boundaries ? 'visible' : 'none');
    });

    // Roads
    ['roads-major', 'roads-secondary', 'roads-tertiary', 'roads-labels'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', layers.roads ? 'visible' : 'none');
    });

    // Villages
    ['villages-layer', 'villages-labels'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', layers.villages ? 'visible' : 'none');
    });

    // Landslides
    ['landslides-circles'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', layers.landslides ? 'visible' : 'none');
    });

    // Susceptibility
    if (map.getLayer('susceptibility-layer')) {
      map.setLayoutProperty('susceptibility-layer', 'visibility', layers.susceptibility ? 'visible' : 'none');
    }

    // Hospitals
    ['hospitals-layer', 'hospitals-symbol'].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', layers.hospitals ? 'visible' : 'none');
    });
  }, [layers]);

  // Synchronize and render user location on map
  const renderUserLocation = (lat: number, lon: number, areaName?: string) => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Update native WebGL GeoJSON source
    try {
      const source = map.getSource('user-gps-native-source') as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lon, lat],
              },
              properties: {
                title: areaName || 'YOU ARE HERE',
              },
            },
          ],
        });
      }
    } catch {}

    // 2. Remove any previous DOM marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // 3. Create fresh DOM marker on current map
    const labelText = areaName || 'YOU ARE HERE';
    const el = document.createElement('div');
    el.className = 'user-gps-pulse-marker';
    el.innerHTML = `
      <div class="gmaps-pulse-label">
        <span class="gmaps-pulse-label-dot"></span>
        <span>${labelText.length > 24 ? labelText.slice(0, 22) + '...' : labelText}</span>
      </div>
      <div class="gmaps-pulse-wave-1"></div>
      <div class="gmaps-pulse-wave-2"></div>
      <div class="gmaps-pulse-wave-3"></div>
      <div class="gmaps-pulse-halo"></div>
      <div class="gmaps-pulse-dot">
        <div class="gmaps-pulse-inner-core"></div>
      </div>
    `;

    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lon, lat],
          zoom: Math.max(mapRef.current.getZoom(), 12),
          speed: 1.3,
        });
      }
      fetchRiskForLocation(lat, lon, areaName || 'My Location');
    });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lon, lat])
      .addTo(map);

    marker.getElement().classList.add('user-gps-marker-wrapper');
    userMarkerRef.current = marker;
  };

  // Handle User Location Marker & Initial Risk Fetch
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    if (map.isStyleLoaded()) {
      renderUserLocation(userLocation.latitude, userLocation.longitude, userLocation.areaName);
    } else {
      map.once('load', () => {
        renderUserLocation(userLocation.latitude, userLocation.longitude, userLocation.areaName);
      });
    }

    // Initial smooth fly to user location
    if (!hasCenteredRef.current) {
      hasCenteredRef.current = true;
      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 11.5,
        speed: 1.2,
        essential: true,
      });
    }

    // Automatically fetch risk for the user location on load
    fetchRiskForLocation(userLocation.latitude, userLocation.longitude, userLocation.areaName || 'My Location');
  }, [userLocation?.latitude, userLocation?.longitude, userLocation?.areaName]);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allCleared = Object.values(layers).every((v) => !v);

  const toggleAllLayers = () => {
    const nextState = allCleared; // If all are hidden, restore all to true; otherwise hide all
    setLayers({
      boundaries: nextState,
      roads: nextState,
      landslides: nextState,
      susceptibility: nextState,
      hospitals: nextState,
      villages: nextState,
    });
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-risk-critical/15 text-risk-critical border-risk-critical/30';
      case 'High':
        return 'bg-risk-high/15 text-risk-high border-risk-high/30';
      case 'Moderate':
        return 'bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30';
      case 'Outside Coverage':
        return 'bg-earth-200 text-earth-700 border-earth-300';
      default:
        return 'bg-risk-low/15 text-risk-low border-risk-low/30';
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[450px] overflow-hidden rounded-2xl border border-earth-300 bg-earth-100 ${className}`}>
      {/* Mapbox Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Interactive Layer Toggle Header Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-60px)]">
        {/* CLEAR ALL / RESTORE ALL LAYERS BUTTON */}
        <button
          onClick={toggleAllLayers}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase font-bold transition-all border shadow-xs backdrop-blur-md cursor-pointer flex items-center gap-1.5 ${
            allCleared
              ? 'bg-brand-700 text-white border-brand-800 hover:bg-brand-800 shadow-sm'
              : 'bg-white/90 text-earth-800 border-earth-300 hover:bg-earth-100 hover:text-earth-900'
          }`}
          title={allCleared ? 'Show all spatial layers' : 'Hide all overlays to view clean map & your location'}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>{allCleared ? 'RESTORE LAYERS' : 'CLEAR ALL LAYERS'}</span>
        </button>

        {[
          { key: 'susceptibility', label: 'Heatmap' },
          { key: 'boundaries', label: 'Boundaries' },
          { key: 'roads', label: 'Roads' },
          { key: 'villages', label: 'Villages' },
          { key: 'hospitals', label: 'Hospitals' },
          { key: 'landslides', label: 'Historical' },
        ].map((item) => {
          const active = layers[item.key as keyof typeof layers];
          return (
            <button
              key={item.key}
              onClick={() => toggleLayer(item.key as keyof typeof layers)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase font-semibold transition-all border shadow-xs backdrop-blur-md cursor-pointer ${
                active
                  ? 'bg-brand-700 text-white border-brand-800 font-bold'
                  : 'bg-white/85 text-earth-700 border-earth-300 hover:text-earth-900 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* PART 4 — FLOATING RISK ASSESSMENT DETAIL PANEL */}
      {isPanelOpen && riskData && (
        <div className="absolute bottom-4 left-4 z-20 w-80 sm:w-88 rounded-2xl border border-earth-300 bg-[#FFFDF8]/95 backdrop-blur-md p-4 shadow-xl space-y-3 text-left animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-earth-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-800 font-semibold block">
                  AI RISK INTELLIGENCE
                </span>
                <span className="text-xs font-bold font-serif text-earth-900 truncate block max-w-[170px]">
                  {panelLocationLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${getRiskBadgeColor(riskData.risk_level)}`}>
                {riskData.risk_level}
              </span>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1 rounded-md hover:bg-earth-100 text-earth-400 hover:text-earth-700 transition-colors cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Core Metrics Grid or Outside Coverage Notice */}
          {riskData.is_outside_ner || riskData.risk_level === 'Outside Coverage' ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>OUTSIDE NORTHEAST INDIA</span>
              </div>
              <p className="text-[11px] text-earth-700 leading-relaxed font-sans">
                This location lies outside the 8 North East India states. Landslide risk modeling is strictly bounded to the Northeast Region (NER).
              </p>
              <div className="text-[10px] text-earth-600 pt-0.5 space-y-0.5 font-mono">
                <div>• Model A Susceptibility: <b className="text-earth-800">N/A (Outside Grid)</b></div>
                <div>• Model B Landslide Risk: <b className="text-earth-800">N/A (Outside Grid)</b></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Live Risk Score (Model B) */}
              <div className="p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                <div className="text-[10px] font-mono text-earth-600 uppercase">LIVE RISK SCORE</div>
                <div className="text-xl font-bold font-mono text-earth-900 mt-0.5">
                  {riskData.risk_score != null ? `${(riskData.risk_score * 100).toFixed(0)}%` : 'N/A'}
                </div>
                <div className="text-[10px] text-earth-500 mt-0.5">Model B Live Fusion</div>
              </div>

              {/* Susceptibility Score (Model A) */}
              <div className="p-2.5 rounded-xl border border-earth-200 bg-earth-50">
                <div className="text-[10px] font-mono text-earth-600 uppercase">SUSCEPTIBILITY</div>
                <div className="text-xl font-bold font-mono text-accent-700 mt-0.5">
                  {riskData.susceptibility_score != null ? `${(riskData.susceptibility_score * 100).toFixed(0)}%` : 'N/A'}
                </div>
                <div className="text-[10px] text-earth-500 mt-0.5">Model A Static Hazard</div>
              </div>
            </div>
          )}

          {/* Dynamic Weather & Soil Moisture Factors */}
          <div className="space-y-1.5 text-[11px] font-mono bg-earth-50 p-2.5 rounded-xl border border-earth-200">
            <div className="flex items-center justify-between text-earth-700">
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-brand-700" />
                Rainfall (24h / 7d):
              </span>
              <span className="font-bold text-earth-900 flex items-center gap-1">
                {riskData.rainfall_24hr} mm / {riskData.rainfall_7day} mm
                {riskData.is_live_data_mocked ? (
                  <span className="text-[8px] text-amber-800 font-semibold px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">
                    (sample data)
                  </span>
                ) : (
                  <span className="text-[8px] text-brand-800 font-semibold px-1.5 py-0.5 rounded bg-brand-100 border border-brand-300">
                    Live Open-Meteo
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-earth-700">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-accent-700" />
                Soil Saturation:
              </span>
              <span className="font-bold text-earth-900 flex items-center gap-1">
                {riskData.soil_moisture}%
                {riskData.is_live_data_mocked ? (
                  <span className="text-[8px] text-amber-800 font-semibold px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">
                    (sample data)
                  </span>
                ) : (
                  <span className="text-[8px] text-brand-800 font-semibold px-1.5 py-0.5 rounded bg-brand-100 border border-brand-300">
                    Live Open-Meteo
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Footer Coordinates and Timestamp */}
          <div className="flex items-center justify-between text-[10px] font-mono text-earth-500 border-t border-earth-200 pt-1.5">
            <span>
              GPS: {riskData.latitude.toFixed(3)}°N, {riskData.longitude.toFixed(3)}°E ({riskData.grid_match_distance_m}m grid)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(riskData.computed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* Collapsed Panel Toggle Button */}
      {!isPanelOpen && riskData && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-earth-300 bg-[#FFFDF8]/95 backdrop-blur-md text-xs font-mono text-earth-900 shadow-md hover:bg-earth-100 transition-colors cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-brand-700" />
          <span>VIEW RISK ASSESSMENT</span>
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${getRiskBadgeColor(riskData.risk_level)}`}>
            {riskData.risk_level}
          </span>
        </button>
      )}

      {/* Floating Recenter on My Location Button (Google Maps style) */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: Math.max(mapRef.current.getZoom(), 12),
                speed: 1.4,
                essential: true,
              });
              renderUserLocation(userLocation.latitude, userLocation.longitude, userLocation.areaName);
              fetchRiskForLocation(userLocation.latitude, userLocation.longitude, userLocation.areaName || 'My Location');
            }
          }}
          title="Recenter on My Location"
          className="absolute bottom-16 right-3 z-10 p-2.5 rounded-xl bg-[#FFFDF8]/95 hover:bg-brand-700 hover:text-white border border-earth-300 text-earth-800 shadow-lg flex items-center gap-1.5 transition-all group backdrop-blur-md cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-brand-700 group-hover:text-white transition-colors" />
          <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline text-earth-800 group-hover:text-white">
            My GPS
          </span>
        </button>
      )}

      {/* Loading Overlay */}
      {isLoadingRisk && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-earth-300 bg-[#FFFDF8]/95 backdrop-blur-md text-xs font-mono text-earth-900 shadow-lg">
          <div className="w-3.5 h-3.5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
          <span>Evaluating Terrain &amp; Live Risk...</span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
