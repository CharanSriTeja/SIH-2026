import React from 'react';
import { ShieldCheck, Headphones, CalendarCheck, Lock } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      line1: 'Best Price',
      line2: 'Guarantee',
    },
    {
      icon: Headphones,
      line1: '24/7 Travel',
      line2: 'Support',
    },
    {
      icon: CalendarCheck,
      line1: 'Flexible',
      line2: 'Bookings',
    },
    {
      icon: Lock,
      line1: 'Secure',
      line2: 'Payments',
    },
  ];

  return (
    <div className="w-full bg-black/90 border border-white/15 rounded-xl p-4 sm:p-5 backdrop-blur-md relative z-20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center group cursor-default"
            >
              <div className="w-9 h-9 rounded-md bg-white/[0.03] border border-white/15 flex items-center justify-center text-white mb-2 group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-200">
                <Icon className="w-4 h-4 text-current" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-white leading-tight">
                {item.line1}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-white/50 font-medium leading-tight mt-0.5">
                {item.line2}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
