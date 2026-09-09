import React from 'react';
import { MapPin, Plane } from 'lucide-react';

export const FlightPathGraphic: React.FC = () => {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden z-10">
      <svg
        className="w-full h-full"
        viewBox="0 0 1400 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Curved dotted trajectory connecting the location pin to the right */}
        <path
          d="M 640 460 Q 720 300 880 260 T 1100 220"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.8"
          strokeDasharray="6 6"
          fill="none"
        />

        {/* Second connecting trajectory arc */}
        <path
          d="M 640 460 C 580 520, 680 560, 750 540"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          fill="none"
        />
      </svg>

      {/* Origin Map Pin Marker */}
      <div className="absolute top-[448px] left-[45.5%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-8 h-8 rounded-full bg-white/10 animate-ping opacity-75" />
          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
            <MapPin className="w-4 h-4 fill-black" />
          </div>
        </div>
      </div>

      {/* Airplane along the path */}
      <div className="absolute top-[248px] left-[61.5%] -translate-x-1/2 -translate-y-1/2 text-white/90">
        <Plane className="w-5 h-5 -rotate-45 fill-white" />
      </div>
    </div>
  );
};
