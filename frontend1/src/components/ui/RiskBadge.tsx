import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: RiskSeverity | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const norm = (level || 'low').toLowerCase();

  let config = {
    label: 'Low Risk',
    bg: 'bg-[#EEF7F0]',
    border: 'border-[#C2E3C9]',
    text: 'text-[#2D5D37]',
    icon: ShieldCheck,
  };

  if (norm.includes('crit') || norm === 'critical') {
    config = {
      label: 'Critical Hazard',
      bg: 'bg-[#FCEEEB]',
      border: 'border-[#EABEB7]',
      text: 'text-[#5C170F]',
      icon: AlertOctagon,
    };
  } else if (norm.includes('high') || norm === 'high') {
    config = {
      label: 'High Risk',
      bg: 'bg-[#FDF0EB]',
      border: 'border-[#F6C8B3]',
      text: 'text-[#823B10]',
      icon: AlertCircle,
    };
  } else if (norm.includes('mod') || norm === 'moderate') {
    config = {
      label: 'Moderate Risk',
      bg: 'bg-[#FDF6EB]',
      border: 'border-[#F4DCB0]',
      text: 'text-[#7A5215]',
      icon: AlertTriangle,
    };
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const IconComponent = config.icon;
  const iconSizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans tracking-wide ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
      role="status"
      aria-label={`Risk Level: ${config.label}`}
    >
      {showIcon && <IconComponent className={`${iconSizes} shrink-0`} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};
