import React from 'react';
import {
  ShieldCheck,
  Building,
  MapPin,
  FileBadge,
  Phone,
  Mail,
  User,
  X,
  Radio,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { AuthAccount } from '../../types';

interface OfficerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  officerAccount?: AuthAccount | null;
  onSignOut?: () => void;
}

export const OfficerProfileModal: React.FC<OfficerProfileModalProps> = ({
  isOpen,
  onClose,
  officerAccount,
  onSignOut,
}) => {
  if (!isOpen) return null;

  const name = officerAccount?.name || 'Officer T. Sangma';
  const badgeId = officerAccount?.officialId || officerAccount?.identifier || 'OFF-8821';
  const designation = officerAccount?.designation || 'Senior Geotechnical Surveyor';
  const department = officerAccount?.department || 'State Disaster Management Authority (SDMA)';
  const district = officerAccount?.locationOrDistrict || 'Aizawl District (Mizoram)';
  const sector = officerAccount?.assignedSector || 'Sector A & B (Durtlang Ridge - Tuirial)';
  const phone = officerAccount?.officialPhone || '+91 94361 88210';
  const email = officerAccount?.officialEmail || 't.sangma@sdma.gov.in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0B1220] border border-white/20 rounded-3xl p-6 shadow-2xl text-left my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-mono-code uppercase font-bold text-blue-400 block">
                AUTHORIZED PERSONNEL PROFILE
              </span>
              <h3 className="text-base font-bold font-heading text-white">
                Field Officer Credentials
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="space-y-4 text-xs font-mono-code">
          {/* Official Role Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-300/70 font-bold block uppercase">
                SYSTEM ROLE IDENTIFICATION
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                FIELD OFFICER
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>APPROVED &amp; ACTIVE</span>
            </span>
          </div>

          {/* Identity & Officer Info */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[10px] uppercase font-bold">OFFICER NAME</span>
              <span className="text-white font-bold text-sm font-sans">{name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[10px] uppercase font-bold">OFFICIAL ID / BADGE</span>
              <span className="text-blue-300 font-bold">{badgeId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[10px] uppercase font-bold">OFFICIAL DESIGNATION</span>
              <span className="text-white/90 font-sans">{designation}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/50 text-[10px] uppercase font-bold">ORGANIZATION</span>
              <span className="text-white/90 font-sans">{department}</span>
            </div>
          </div>

          {/* Work Area & Assigned Jurisdiction */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <span className="text-white/50 text-[10px] uppercase font-bold block">
              OPERATIONAL JURISDICTION
            </span>

            <div className="flex items-start gap-2 text-white/90 font-sans">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong>Assigned District:</strong> {district}
              </div>
            </div>

            <div className="flex items-start gap-2 text-white/90 font-sans">
              <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>Operational Area / Sector:</strong> {sector}
              </div>
            </div>
          </div>

          {/* Official Contact & Frequency */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[9.5px] text-white/40 uppercase block">CONTACT PHONE</span>
              <span className="text-white font-bold">{phone}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[9.5px] text-white/40 uppercase block">OFFICIAL EMAIL</span>
              <span className="text-white font-bold truncate block">{email}</span>
            </div>
          </div>

          {/* Actions: Sign Out */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut?.();
              }}
              className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold uppercase tracking-wider cursor-pointer"
            >
              Sign Out of Officer Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
