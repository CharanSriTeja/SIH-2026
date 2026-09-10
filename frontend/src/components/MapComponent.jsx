import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapComponent.css';

const LANDSLIDES_PMTILES_URL = '/data/tiles/historical_landslides.pmtiles';
const LANDSLIDES_SOURCE_LAYER = 'landslides';

// ESA CCI Land Cover classes — actual values in modelA_positive_ner_200m.parquet
// Class 10 = 9,007 records (dominant), 30 = 974, 50 = 384, 40 = 140, 60/80 = 59 each, 100 = 6, 20 = 1
const LAND_COVER_LABELS = {
  10: 'Cropland (rainfed)',
  20: 'Cropland (irrigated)',
  30: 'Mosaic Cropland / Vegetation',
  40: 'Broadleaved Deciduous Forest',
  50: 'Broadleaved Evergreen Forest',
  60: 'Open Broadleaved Deciduous Forest',
  80: 'Open Needleleaved Forest',
  100:'Mosaic Tree and Shrub',
};

const HOSPITALS_PMTILES_URL = '/data/hospitals/tiles/hospitals.pmtiles';
const HOSPITALS_SOURCE_LAYER = 'hospitals';

const MapComponent = ({ showNERBoundaries, showRoads, showLandslides, showSusceptibility, showHospitals }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    // ── Register PMTiles protocol BEFORE creating the map ──────────────────
    // This allows MapLibre to handle pmtiles:// source URLs natively.
    // The global `pmtiles` object is loaded from the CDN in index.html.
    if (window.pmtiles) {
      const protocol = new window.pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile.bind(protocol));
    } else {
      console.warn('PMTiles JS library not found. Landslide layer will not render.');
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [93.0, 26.0], // Centered on Northeast India
      zoom: 6.5
    });

    mapRef.current = map;

    // Controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // =====================================================================
      // 0. LANDSLIDE SUSCEPTIBILITY RASTER LAYER (Model A)
      // Added FIRST so it renders beneath all vector overlays.
      // Tiles served by FastAPI: /tiles/susceptibility/{z}/{x}/{y}.png
      // =====================================================================
      map.addSource('susceptibility-raster', {
        type: 'raster',
        tiles: ['/tiles/susceptibility/{z}/{x}/{y}.png'],
        tileSize: 256,
        minzoom: 4,
        maxzoom: 13,
        attribution: 'Model A — Landslide Susceptibility (SIH 2026)'
      });

      map.addLayer({
        id: 'susceptibility-layer',
        type: 'raster',
        source: 'susceptibility-raster',
        layout: {
          // Use prop for initial visibility — layer exists now so this is safe
          'visibility': showSusceptibility ? 'visible' : 'none'
        },
        paint: {
          // 0.72 opacity lets the base map remain readable beneath the overlay
          'raster-opacity': 0.72,
          'raster-fade-duration': 200
        }
      });
      // susceptibility-layer is inserted first, so all subsequent addLayer calls
      // go on top of it automatically.

      // =====================================================================
      // 1. NER STATE & DISTRICT BOUNDARY LAYERS
      // =====================================================================
      map.addSource('ner-states-source', {
        type: 'geojson',
        data: '/api/gis/ner-states'
      });

      map.addLayer({
        id: 'ner-state-fill',
        type: 'fill',
        source: 'ner-states-source',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.08
        }
      });

      map.addLayer({
        id: 'ner-state-outline',
        type: 'line',
        source: 'ner-states-source',
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 3.5
        }
      });

      map.addLayer({
        id: 'ner-state-labels',
        type: 'symbol',
        source: 'ner-states-source',
        maxzoom: 7.5,
        layout: {
          'text-field': ['get', 'st_nm'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 15,
          'text-anchor': 'center',
          'text-transform': 'uppercase'
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5
        }
      });

      map.addSource('ner-districts-source', {
        type: 'geojson',
        data: '/api/gis/ner-districts'
      });

      map.addLayer({
        id: 'ner-district-outline',
        type: 'line',
        source: 'ner-districts-source',
        minzoom: 6.5,
        paint: {
          'line-color': '#64748b',
          'line-width': 1.2,
          'line-dasharray': [3, 2]
        }
      }, 'ner-state-outline');

      map.addLayer({
        id: 'ner-district-labels',
        type: 'symbol',
        source: 'ner-districts-source',
        minzoom: 7.5,
        layout: {
          'text-field': ['get', 'district'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 12,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5
        }
      });

      // =====================================================================
      // 2. VECTOR TILE SOURCE (SERVED BY FASTAPI)
      // =====================================================================
      map.addSource('roads-vector-source', {
        type: 'vector',
        tiles: [
          '/tiles/roads/{z}/{x}/{y}.pbf'
        ],
        minzoom: 5,
        maxzoom: 14
      });

      // Zoom 5–6: Major Highways (Motorway, Trunk, Primary)
      map.addLayer({
        id: 'roads-major',
        type: 'line',
        source: 'roads-vector-source',
        'source-layer': 'roads',
        minzoom: 5,
        filter: [
          'in',
          ['get', 'highway'],
          ['literal', ['motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link']]
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'highway'],
            'motorway', '#dc2626',
            'trunk', '#ea580c',
            '#d97706' // primary
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 1.2,
            8, 2.2,
            11, 3.8,
            14, 5.5
          ],
          'line-opacity': 0.95
        }
      });

      // Zoom 7–9: Secondary / State Highways
      map.addLayer({
        id: 'roads-secondary',
        type: 'line',
        source: 'roads-vector-source',
        'source-layer': 'roads',
        minzoom: 7,
        filter: [
          'in',
          ['get', 'highway'],
          ['literal', ['secondary', 'secondary_link']]
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#2563eb',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1.0,
            10, 2.0,
            14, 4.0
          ],
          'line-opacity': 0.9
        }
      }, 'roads-major');

      // Zoom 10–12: District & Tertiary Roads
      map.addLayer({
        id: 'roads-tertiary',
        type: 'line',
        source: 'roads-vector-source',
        'source-layer': 'roads',
        minzoom: 9.5,
        filter: [
          'in',
          ['get', 'highway'],
          ['literal', ['tertiary', 'tertiary_link']]
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#059669',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.9,
            14, 2.8
          ],
          'line-opacity': 0.85
        }
      }, 'roads-secondary');

      // Zoom 13+: Detailed Local & Residential Roads
      map.addLayer({
        id: 'roads-local',
        type: 'line',
        source: 'roads-vector-source',
        'source-layer': 'roads',
        minzoom: 12,
        filter: [
          'in',
          ['get', 'highway'],
          ['literal', ['residential', 'unclassified', 'service', 'living_street', 'road']]
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#94a3b8',
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0.7,
            15, 2.2
          ],
          'line-opacity': 0.8
        }
      }, 'roads-tertiary');

      // Zoom 7.5+: Road Names & Highway Numbers (e.g. NH27, NH2, SH1, etc.)
      map.addLayer({
        id: 'roads-labels',
        type: 'symbol',
        source: 'roads-vector-source',
        'source-layer': 'roads',
        minzoom: 7.5,
        filter: [
          'any',
          ['all', ['has', 'name'], ['!=', ['get', 'name'], ''], ['!=', ['get', 'name'], 'Unnamed Road'], ['!=', ['get', 'name'], 'null']],
          ['all', ['has', 'ref'], ['!=', ['get', 'ref'], ''], ['!=', ['get', 'ref'], 'null']]
        ],
        layout: {
          'symbol-placement': 'line',
          'text-field': [
            'case',
            ['all', ['has', 'name'], ['!=', ['get', 'name'], ''], ['!=', ['get', 'name'], 'Unnamed Road'], ['!=', ['get', 'name'], 'null']],
            [
              'case',
              ['all', ['has', 'ref'], ['!=', ['get', 'ref'], ''], ['!=', ['get', 'ref'], 'null']],
              ['concat', ['get', 'name'], ' (', ['get', 'ref'], ')'],
              ['get', 'name']
            ],
            ['get', 'ref']
          ],
          'text-font': ['Open Sans Semibold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7.5, 9.5,
            10, 11,
            13, 12.5,
            15, 14
          ],
          'text-letter-spacing': 0.05,
          'text-max-angle': 38,
          'symbol-spacing': 280,
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.2,
          'text-halo-blur': 0.5
        }
      });

      // =====================================================================
      // 3. ROAD CLICK INSPECTION POPUP
      // =====================================================================
      const roadLayerIds = ['roads-major', 'roads-secondary', 'roads-tertiary', 'roads-local', 'roads-labels'];

      roadLayerIds.forEach((layerId) => {
        map.on('click', layerId, (e) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const props = feature.properties || {};

          const hasName = props.name && props.name !== '' && props.name !== 'Unnamed Road' && props.name !== 'null';
          const hasRef = props.ref && props.ref !== '' && props.ref !== 'N/A' && props.ref !== 'null';

          let displayTitle = 'Road Segment';
          if (hasName && hasRef) {
            displayTitle = `${props.name} (${props.ref})`;
          } else if (hasName) {
            displayTitle = props.name;
          } else if (hasRef) {
            displayTitle = `${props.ref} (${props.highway ? props.highway.toUpperCase() : 'Highway'})`;
          } else if (props.highway) {
            displayTitle = `${props.highway.toUpperCase()} Road`;
          }

          const roadType = props.highway ? props.highway.toUpperCase() : 'N/A';
          const roadName = hasName ? props.name : 'Not named in OSM';
          const roadRef = hasRef ? props.ref : 'None';
          const surface = props.surface && props.surface !== 'Unknown' && props.surface !== '' ? props.surface : 'Unspecified';
          const lanes = props.lanes && props.lanes !== 'N/A' && props.lanes !== '' ? props.lanes : 'Not recorded';
          const maxspeed = props.maxspeed && props.maxspeed !== 'N/A' && props.maxspeed !== '' ? props.maxspeed : 'Standard';
          const osmId = props.osm_id && props.osm_id !== '' ? props.osm_id : (feature.id ? String(feature.id) : 'N/A');

          const popupHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; min-width: 220px;">
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; border-bottom: 2px solid #3b82f6; padding-bottom: 3px;">
                ${displayTitle}
              </div>
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">Name:</td>
                  <td style="font-weight: 600; color: #1e293b; text-align: right;">${roadName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">Reference (Ref):</td>
                  <td style="font-weight: 600; color: #2563eb; text-align: right;">${roadRef}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">Class / Type:</td>
                  <td style="font-weight: 600; color: #1e293b; text-align: right;">${roadType}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">Surface:</td>
                  <td style="font-weight: 600; color: #1e293b; text-align: right;">${surface}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">Lanes:</td>
                  <td style="font-weight: 600; color: #1e293b; text-align: right;">${lanes}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">Max Speed:</td>
                  <td style="font-weight: 600; color: #1e293b; text-align: right;">${maxspeed}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 2px 0;">OSM ID:</td>
                  <td style="font-weight: 500; color: #64748b; text-align: right; font-size: 11px;">${osmId}</td>
                </tr>
              </table>
            </div>
          `;

          new maplibregl.Popup({ closeButton: true, closeOnClick: true })
            .setLngLat(e.lngLat)
            .setHTML(popupHtml)
            .addTo(map);
        });

        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      // Initialize visibility for boundary and road layers
      updateVisibility('boundaries', showNERBoundaries);
      updateVisibility('roads', showRoads);
      // Note: landslides visibility is set via layout.visibility in addLayer below

      // =====================================================================
      // 4. HISTORICAL LANDSLIDE PMTILES LAYER
      // =====================================================================
      map.addSource('historical-landslides', {
        type: 'vector',
        url: `pmtiles://${LANDSLIDES_PMTILES_URL}`
      });

      // Circle layer — sized by zoom for visual clarity
      map.addLayer({
        id: 'landslides-circles',
        type: 'circle',
        source: 'historical-landslides',
        'source-layer': LANDSLIDES_SOURCE_LAYER,
        layout: {
          // Set initial visibility based on prop — safe because layer exists now
          'visibility': showLandslides ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            4, 2.5,
            6, 3.5,
            8, 5,
            10, 7,
            13, 9,
            16, 12
          ],
          // Colors mapped to actual ESA CCI classes in the dataset.
          // Class 10 (Cropland) dominates with 9,007 of 10,630 records.
          'circle-color': [
            'match', ['get', 'land_cover_class'],
            10,  '#ca8a04',  // Cropland (rainfed)         — amber
            20,  '#f59e0b',  // Cropland (irrigated)        — yellow-amber
            30,  '#84cc16',  // Mosaic Cropland/Vegetation  — yellow-green
            40,  '#65a30d',  // Broadleaved Deciduous Forest— green
            50,  '#15803d',  // Broadleaved Evergreen Forest— dark green
            60,  '#4d7c0f',  // Open Broadleaved Deciduous  — olive green
            80,  '#166534',  // Open Needleleaved Forest    — deep forest green
            100, '#6d28d9',  // Mosaic Tree and Shrub       — purple
            '#f97316'        // Fallback: orange
          ],
          'circle-opacity': 0.82,
          'circle-stroke-width': 0.8,
          'circle-stroke-color': '#fff'
        }
      });

      // ── Click popup ──────────────────────────────────────────────────────
      map.on('click', 'landslides-circles', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties || {};

        const state      = props.state      ?? 'Unknown';
        const elev       = props.elevation_m != null ? `${props.elevation_m} m` : 'N/A';
        const slope      = props.slope_deg  != null ? `${props.slope_deg}°`   : 'N/A';
        const lcClass    = props.land_cover_class ?? '—';
        const lcLabel    = props.land_cover || LAND_COVER_LABELS[lcClass] || 'Unknown';

        new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:6px;min-width:210px;">
              <div style="font-size:14px;font-weight:700;color:#7f1d1d;margin-bottom:6px;
                          border-bottom:2px solid #dc2626;padding-bottom:3px;">🏔 Historical Landslide</div>
              <table style="width:100%;font-size:12px;border-collapse:collapse;">
                <tr><td style="color:#64748b;padding:2px 0;">State:</td>
                    <td style="font-weight:600;color:#1e293b;text-align:right;">${state}</td></tr>
                <tr><td style="color:#64748b;padding:2px 0;">Elevation:</td>
                    <td style="font-weight:600;color:#1e293b;text-align:right;">${elev}</td></tr>
                <tr><td style="color:#64748b;padding:2px 0;">Slope:</td>
                    <td style="font-weight:600;color:#1e293b;text-align:right;">${slope}</td></tr>
                <tr><td style="color:#64748b;padding:2px 0;">Land Cover:</td>
                    <td style="font-weight:600;color:#1e293b;text-align:right;">${lcLabel}</td></tr>
                <tr><td style="color:#64748b;padding:2px 0;">LC Class:</td>
                    <td style="font-weight:500;color:#64748b;text-align:right;font-size:11px;">${lcClass}</td></tr>
              </table>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'landslides-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'landslides-circles', () => {
        map.getCanvas().style.cursor = '';
      });

      // =====================================================================
      // 5. HOSPITALS PMTILES LAYER
      // =====================================================================
      map.addSource('hospitals-source', {
        type: 'vector',
        url: `pmtiles://${HOSPITALS_PMTILES_URL}`
      });

      map.addLayer({
        id: 'hospitals-layer',
        type: 'circle',
        source: 'hospitals-source',
        'source-layer': HOSPITALS_SOURCE_LAYER,
        layout: {
          'visibility': showHospitals ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            4, 3,
            8, 4.5,
            12, 6.5,
            15, 9
          ],
          'circle-color': '#059669', // Emerald green
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.addLayer({
        id: 'hospitals-symbol',
        type: 'symbol',
        source: 'hospitals-source',
        'source-layer': HOSPITALS_SOURCE_LAYER,
        minzoom: 11,
        layout: {
          'text-field': '🏥', // Hospital emoji as icon
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            11, 10,
            15, 16
          ],
          'text-allow-overlap': true,
          'visibility': showHospitals ? 'visible' : 'none'
        }
      });

      // ── Click popup for Hospitals ──────────────────────────────────────────
      map.on('click', 'hospitals-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties || {};

        const name = props.name || 'Unnamed Hospital';
        const type = props.hospital_type || 'Hospital';
        const district = props.district;
        const state = props.state;
        const operator = props.operator;
        const emergency = props.emergency;
        const phone = props.phone;
        const address = props.address;

        let tableRows = '';
        if (type) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">Type:</td><td style="font-weight:600;color:#1e293b;text-align:right;">${type}</td></tr>`;
        if (district) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">District:</td><td style="font-weight:600;color:#1e293b;text-align:right;">${district}</td></tr>`;
        if (state) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">State:</td><td style="font-weight:600;color:#1e293b;text-align:right;">${state}</td></tr>`;
        if (operator) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">Operator:</td><td style="font-weight:600;color:#1e293b;text-align:right;">${operator}</td></tr>`;
        if (emergency) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">Emergency:</td><td style="font-weight:600;color:#1e293b;text-align:right;">${emergency}</td></tr>`;
        if (phone) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">Phone:</td><td style="font-weight:600;color:#1e293b;text-align:right;">${phone}</td></tr>`;
        if (address) tableRows += `<tr><td style="color:#64748b;padding:2px 0;">Address:</td><td style="font-weight:600;color:#1e293b;text-align:right;font-size:11px;">${address}</td></tr>`;

        new maplibregl.Popup({ closeButton: true, closeOnClick: true })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:6px;min-width:220px;">
              <div style="font-size:14px;font-weight:700;color:#065f46;margin-bottom:6px;
                          border-bottom:2px solid #059669;padding-bottom:3px;">${name}</div>
              <table style="width:100%;font-size:12px;border-collapse:collapse;">
                ${tableRows}
              </table>
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
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateVisibility = (type, isVisible) => {
    const map = mapRef.current;
    if (!map) return;
    const visibility = isVisible ? 'visible' : 'none';

    if (type === 'boundaries') {
      ['ner-state-fill','ner-state-outline','ner-state-labels',
       'ner-district-outline','ner-district-labels'].forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
      });
    } else if (type === 'roads') {
      ['roads-major','roads-secondary','roads-tertiary','roads-local','roads-labels'].forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
      });
    } else if (type === 'landslides') {
      ['landslides-circles'].forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
      });
    } else if (type === 'susceptibility') {
      if (map.getLayer('susceptibility-layer')) {
        map.setLayoutProperty('susceptibility-layer', 'visibility', visibility);
      }
    } else if (type === 'hospitals') {
      ['hospitals-layer', 'hospitals-symbol'].forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
      });
    }
  };

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    updateVisibility('boundaries', showNERBoundaries);
  }, [showNERBoundaries]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    updateVisibility('roads', showRoads);
  }, [showRoads]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    updateVisibility('landslides', showLandslides);
  }, [showLandslides]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    updateVisibility('susceptibility', showSusceptibility);
  }, [showSusceptibility]);

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    updateVisibility('hospitals', showHospitals);
  }, [showHospitals]);

  return <div className="map-container" ref={mapContainerRef} />;
};

export default MapComponent;
