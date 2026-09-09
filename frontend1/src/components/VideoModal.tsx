import React from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md border border-white/30 bg-white/5 text-white flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-white leading-tight">
                Wanderlust in Action
              </h3>
              <p className="text-[10px] uppercase tracking-[0.12em] text-white/50 mt-0.5">
                Cinematic exploration of global destinations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close video"
            className="w-8 h-8 rounded-md border border-white/20 bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Mockup / Embed */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1"
            title="Wanderlust Travel Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
