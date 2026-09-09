import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Send,
  Navigation,
} from 'lucide-react';
import { FieldIncidentReport } from '../types';

interface FieldReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: FieldIncidentReport) => void;
  isOfflineMode: boolean;
}

export const FieldReportModal: React.FC<FieldReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  isOfflineMode,
}) => {
  const [reporterName, setReporterName] = useState('');
  const [reporterRole, setReporterRole] = useState<'citizen' | 'field_official'>('citizen');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('Aizawl');
  const [state, setState] = useState('Mizoram');
  const [category, setCategory] = useState<FieldIncidentReport['category']>('tension_crack');
  const [severity, setSeverity] = useState<FieldIncidentReport['severity']>('HIGH');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [coords, setCoords] = useState<[number, number]>([23.7785, 92.7312]);

  if (!isOpen) return null;

  const categories = [
    { id: 'tension_crack', label: 'Tension Crack', desc: 'Ground fissure widening' },
    { id: 'slope_movement', label: 'Slope Creep / Slump', desc: 'Tilting trees or poles' },
    { id: 'road_blockage', label: 'Road Blockage', desc: 'Debris covering highway' },
    { id: 'rockfall', label: 'Rockfall / Boulders', desc: 'Detached stone debris' },
    { id: 'culvert_overflow', label: 'Culvert Choked', desc: 'Drainage blockage' },
    { id: 'mudflow', label: 'Mudflow / Sludge', desc: 'Rapid liquid soil surge' },
  ];

  const samplePhotos = [
    {
      label: 'Ground Crack',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Road Debris',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Slope Slump',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Hill Drainage',
      url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleFetchCurrentGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([Number(pos.coords.latitude.toFixed(4)), Number(pos.coords.longitude.toFixed(4))]);
        },
        () => {
          // Fallback to random offset in NER
          setCoords([23.78 + Math.random() * 0.05, 92.73 + Math.random() * 0.05]);
        }
      );
    } else {
      setCoords([23.7821, 92.7345]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newReport: FieldIncidentReport = {
      id: `rep-${Date.now()}`,
      reporterName: reporterName || (reporterRole === 'field_official' ? 'Field Officer (NER-PWD)' : 'Concerned Citizen'),
      reporterRole,
      locationName: locationName || 'Hill Slope Mile Post 4, Near Transit Route',
      district,
      state,
      coordinates: coords,
      timestamp: 'Just now',
      category: category as FieldIncidentReport['category'],
      severity,
      description:
        description ||
        'Observed noticeable tension cracks and soil displacement along the upper bench following persistent rainfall.',
      photoUrl: photoPreview,
      status: reporterRole === 'field_official' ? 'VERIFIED' : 'PENDING_VERIFICATION',
      synced: !isOfflineMode,
    };

    setTimeout(() => {
      onSubmitReport(newReport);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/20 rounded-3xl p-6 sm:p-8 text-left shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code uppercase tracking-widest text-emerald-400 font-bold block">
                NER FIELD TELEMETRY UPLINK
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading uppercase tracking-tight">
                Report Hazard or Road Blockage
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOfflineMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono-code font-bold">
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE QUEUE ACTIVE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono-code font-bold">
                <Wifi className="w-3 h-3" />
                <span>ONLINE SYNC READY</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-16 text-center my-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-white font-heading uppercase tracking-tight mb-2">
              {isOfflineMode ? 'Report Cached to Offline Storage!' : 'Report Successfully Dispatched!'}
            </h3>
            <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              {isOfflineMode
                ? 'Your geo-tagged hazard observation has been safely saved to device cache and will automatically upload once network connectivity returns.'
                : 'Your geo-tagged incident report is now live on the Incident Command GIS map and prioritized for quick response deployment.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 pt-4 text-xs font-mono-code">
            {/* Reporter Profile Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/50 uppercase block mb-1">Reporter Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReporterRole('citizen')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reporterRole === 'citizen'
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    Local Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setReporterRole('field_official')}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      reporterRole === 'field_official'
                        ? 'bg-emerald-400 text-black border-emerald-400 font-bold'
                        : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    Field Officer
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase block mb-1">Your Name / Call Sign</label>
                <input
                  type="text"
                  placeholder={reporterRole === 'citizen' ? 'e.g., Lalthanmawii' : 'e.g., Engr. T. Jamir (PWD)'}
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-[10px] text-white/50 uppercase block mb-1.5">Incident Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as FieldIncidentReport['category'])}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      category === cat.id
                        ? 'bg-white/15 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <span className="font-bold block text-[11px] text-white">{cat.label}</span>
                    <span className="text-[9px] text-white/40 block mt-0.5">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="text-[10px] text-white/50 uppercase block mb-1">Hazard Severity Rating</label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-xl font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                      severity === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-500 text-white border border-red-400'
                          : lvl === 'HIGH'
                          ? 'bg-amber-500 text-black border border-amber-400'
                          : 'bg-emerald-500 text-black border border-emerald-400'
                        : 'bg-white/[0.03] text-white/50 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & GPS Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-white/50 uppercase block mb-1">Specific Location / Landmark</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g., NH-54 Km 118, Near Sairang Cliff"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/50 uppercase block mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-[#111624] border border-white/10 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="Mizoram">Mizoram</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Assam">Assam</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Tripura">Tripura</option>
                </select>
              </div>
            </div>

            {/* GPS coordinates & auto-detect */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-white/80 font-mono-code">
                  GEO-TAG: {coords[0].toFixed(4)}° N, {coords[1].toFixed(4)}° E
                </span>
              </div>
              <button
                type="button"
                onClick={handleFetchCurrentGps}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors cursor-pointer"
              >
                Acquire Device GPS
              </button>
            </div>

            {/* Photo / Visual Evidence Upload & Sample Selector */}
            <div>
              <label className="text-[10px] text-white/50 uppercase block mb-1.5">
                Visual Evidence (Photo / Video Frame)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Photo Preview Card */}
                <div className="relative rounded-2xl overflow-hidden border border-white/15 h-36 bg-black/40 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Hazard evidence"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-white/40">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span>No visual attached</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] text-white/70 font-mono-code">
                    GEO-STAMPED
                  </span>
                </div>

                {/* Upload or Preset Evidence */}
                <div className="space-y-2">
                  <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/30 hover:border-emerald-400 bg-white/[0.02] hover:bg-white/[0.04] text-white text-center cursor-pointer flex items-center justify-center gap-2 transition-all">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>Upload Local File / Take Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <div>
                    <span className="text-[9px] text-white/40 uppercase block mb-1">Or choose sample evidence:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {samplePhotos.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setPhotoPreview(item.url)}
                          className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[9.5px] truncate text-left cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-white/50 uppercase block mb-1">Field Observation Details</label>
              <textarea
                rows={2}
                placeholder="Describe ground cracks, rockfalls, drainage blockage, or visible slope shifts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 text-xs font-mono-code"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="text-[10px] text-white/40">
                {isOfflineMode
                  ? 'Will be stored locally in browser queue'
                  : 'Instant dispatch to District Disaster Management (DDMA)'}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-white text-black hover:bg-emerald-400 font-extrabold text-xs uppercase tracking-[0.16em] flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>DISPATCHING...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isOfflineMode ? 'SAVE TO OFFLINE QUEUE' : 'TRANSMIT HAZARD REPORT'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
