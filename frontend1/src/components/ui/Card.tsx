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
    flat: 'bg-[#FFFFFF] border border-[#C9C0AD] shadow-xs',
    raised: 'bg-[#FFFFFF] border border-[#C9C0AD] shadow-md',
    floating: 'bg-[#FFFFFF] border border-[#BCB29E] shadow-xl',
  }[elevation];

  const interactiveClasses = interactive
    ? 'hover:border-[#1E4B33] hover:shadow-lg transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 ${elevationClasses} ${interactiveClasses} text-[#141712] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
