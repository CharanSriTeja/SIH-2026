import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'raised' | 'floating';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'flat',
  interactive = false,
  className = '',
  ...props
}) => {
  const elevationClasses = {
    flat: 'bg-[#FFFDF8] border border-[#DDD6C4] shadow-xs',
    raised: 'bg-[#FFFDF8] border border-[#DDD6C4] shadow-md',
    floating: 'bg-[#FFFDF8] border border-[#DDD6C4] shadow-xl',
  }[elevation];

  const interactiveClasses = interactive
    ? 'hover:border-[#2E4A3D] hover:shadow-lg transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 ${elevationClasses} ${interactiveClasses} text-[#23261F] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
