import { useState } from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [showNERBoundaries, setShowNERBoundaries] = useState(true);
  const [showRoads, setShowRoads] = useState(true);

  // Layer state
  const [showLandslides, setShowLandslides] = useState(false);
  const [showSusceptibility, setShowSusceptibility] = useState(false);
  const [showHospitals, setShowHospitals] = useState(true);

  // Future layer state placeholders (modular GIS architecture)
  const [showRivers, setShowRivers] = useState(false);
  const [showDEM, setShowDEM] = useState(false);
  const [showSlope, setShowSlope] = useState(false);
  const [showRainfall, setShowRainfall] = useState(false);
  const [showSoilMoisture, setShowSoilMoisture] = useState(false);
  const [showLandslideRisk, setShowLandslideRisk] = useState(false);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SIH 2026: Landslide GIS Application - Northeast India</h1>
        <div style={{ marginLeft: 'auto', fontSize: '13px', opacity: 0.85 }}>
          Vector Tile Architecture: Enabled
        </div>
      </header>

      <main className="main-content">
        <aside className="sidebar">
          <div className="sidebar-placeholder">
            <h2>GIS Layer Panel</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
              Vector tiles & layers streamed from FastAPI backend
            </p>

            {/* Active Layers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="layer-item">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="toggle-ner-boundaries"
                    checked={showNERBoundaries} 
                    onChange={(e) => setShowNERBoundaries(e.target.checked)} 
                  />
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>NER Boundaries</span>
                </label>
              </div>

              {/* Landslide Susceptibility — Model A raster layer */}
              <div className="layer-item">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="toggle-susceptibility"
                    checked={showSusceptibility}
                    onChange={(e) => setShowSusceptibility(e.target.checked)}
                  />
                  <span style={{ fontWeight: 600, color: '#b45309' }}>Landslide Susceptibility</span>
                </label>

                {/* Inline legend — only shown when layer is active */}
                {showSusceptibility && (
                  <div style={{
                    marginTop: '8px',
                    marginLeft: '24px',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}>
                    <div style={{ fontWeight: 700, color: '#78350f', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      LANDSLIDE SUSCEPTIBILITY
                    </div>
                    {[
                      { label: 'Very High  0.8 – 1.0', color: '#d7191c' },
                      { label: 'High       0.6 – 0.8', color: '#fdae61' },
                      { label: 'Moderate   0.4 – 0.6', color: '#ffffbf' },
                      { label: 'Low        0.2 – 0.4', color: '#a6d96a' },
                      { label: 'Very Low   0.0 – 0.2', color: '#1a9641' },
                    ].map(({ label, color }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '14px',
                          height: '14px',
                          borderRadius: '2px',
                          background: color,
                          flexShrink: 0,
                          border: '1px solid rgba(0,0,0,0.15)'
                        }} />
                        <span style={{ color: '#374151', fontFamily: 'monospace' }}>{label}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '3px', color: '#9ca3af', fontSize: '10px' }}>Model A · Values 0–1 probability</div>
                  </div>
                )}
              </div>

              <div className="layer-item">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input 
                    type="checkbox"
                    id="toggle-roads"
                    checked={showRoads} 
                    onChange={(e) => setShowRoads(e.target.checked)} 
                  />
                  <span style={{ fontWeight: 600, color: '#2563eb' }}>Roads (Vector Tiles)</span>
                </label>
              </div>

              <div className="layer-item">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input 
                    type="checkbox"
                    id="toggle-landslides"
                    checked={showLandslides} 
                    onChange={(e) => setShowLandslides(e.target.checked)} 
                  />
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>Historical Landslides</span>
                </label>
              </div>

              <div className="layer-item">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input 
                    type="checkbox"
                    id="toggle-hospitals"
                    checked={showHospitals} 
                    onChange={(e) => setShowHospitals(e.target.checked)} 
                  />
                  <span style={{ fontWeight: 600, color: '#059669' }}>Hospitals</span>
                </label>
              </div>
            </div>

            <hr style={{ margin: '18px 0', borderColor: '#e2e8f0' }} />

            {/* Modular Layer Placeholders */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Upcoming GIS Layers
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.7 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={showRivers} onChange={(e) => setShowRivers(e.target.checked)} />
                <span>Rivers</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={showDEM} onChange={(e) => setShowDEM(e.target.checked)} />
                <span>DEM</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={showSlope} onChange={(e) => setShowSlope(e.target.checked)} />
                <span>Slope</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={showRainfall} onChange={(e) => setShowRainfall(e.target.checked)} />
                <span>Rainfall</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={showSoilMoisture} onChange={(e) => setShowSoilMoisture(e.target.checked)} />
                <span>Soil Moisture</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={showLandslideRisk} onChange={(e) => setShowLandslideRisk(e.target.checked)} />
                <span>Landslide Risk</span>
              </label>
            </div>

          </div>
        </aside>

        <section className="map-area">
          <MapComponent 
            showNERBoundaries={showNERBoundaries} 
            showRoads={showRoads}
            showLandslides={showLandslides}
            showSusceptibility={showSusceptibility}
            showHospitals={showHospitals}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
