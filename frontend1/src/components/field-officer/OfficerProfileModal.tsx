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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-earth-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFDF8] border border-earth-300 rounded-3xl p-6 shadow-2xl text-left my-8 text-earth-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-earth-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-700/10 border border-brand-700/30 flex items-center justify-center text-brand-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10.5px] font-mono uppercase font-bold text-brand-700 block">
                AUTHORIZED PERSONNEL PROFILE
              </span>
              <h3 className="text-base font-bold font-serif text-earth-900">
                Field Officer Credentials
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-earth-500 hover:text-earth-900 hover:bg-earth-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="space-y-4 text-xs font-mono">
          {/* Official Role Banner */}
          <div className="p-3.5 rounded-2xl bg-brand-700/10 border border-brand-700/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-brand-700 font-bold block uppercase">
                SYSTEM ROLE IDENTIFICATION
              </span>
              <span className="text-sm font-bold text-earth-900 tracking-wide font-serif">
                FIELD OFFICER
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>APPROVED &amp; ACTIVE</span>
            </span>
          </div>

          {/* Identity & Officer Info */}
          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-earth-500 text-[10px] uppercase font-bold">OFFICER NAME</span>
              <span className="text-earth-900 font-bold text-sm font-sans">{name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-earth-500 text-[10px] uppercase font-bold">OFFICIAL ID / BADGE</span>
              <span className="text-brand-800 font-bold">{badgeId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-earth-500 text-[10px] uppercase font-bold">OFFICIAL DESIGNATION</span>
              <span className="text-earth-800 font-sans">{designation}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-earth-500 text-[10px] uppercase font-bold">ORGANIZATION</span>
              <span className="text-earth-800 font-sans">{department}</span>
            </div>
          </div>

          {/* Work Area & Assigned Jurisdiction */}
          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-2 shadow-xs">
            <span className="text-earth-500 text-[10px] uppercase font-bold block">
              OPERATIONAL JURISDICTION
            </span>

            <div className="flex items-start gap-2 text-earth-800 font-sans">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Assigned District:</strong> {district}
              </div>
            </div>

            <div className="flex items-start gap-2 text-earth-800 font-sans">
              <Layers className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
              <div>
                <strong>Operational Area / Sector:</strong> {sector}
              </div>
            </div>
          </div>

          {/* Official Contact & Frequency */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-earth-50 border border-earth-200">
              <span className="text-[9.5px] text-earth-500 uppercase block">CONTACT PHONE</span>
              <span className="text-earth-900 font-bold">{phone}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-earth-50 border border-earth-200">
              <span className="text-[9.5px] text-earth-500 uppercase block">OFFICIAL EMAIL</span>
              <span className="text-earth-900 font-bold truncate block">{email}</span>
            </div>
          </div>

          {/* Actions: Sign Out */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 border border-earth-300 font-bold cursor-pointer shadow-xs transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut?.();
              }}
              className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
            >
              Sign Out of Officer Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
