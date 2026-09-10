import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // 44px min touch target on mobile for accessibility
    const baseClasses =
      'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98] select-none';

    const variantClasses = {
      primary:
        'bg-[#1E4B33] text-white hover:bg-[#143524] shadow-sm focus-visible:ring-4 focus-visible:ring-[#1E4B33]/20 border border-[#143524] font-semibold',
      accent:
        'bg-[#B5551F] text-white hover:bg-[#964214] shadow-sm focus-visible:ring-4 focus-visible:ring-[#B5551F]/20 border border-[#964214] font-semibold',
      secondary:
        'bg-[#FFFFFF] text-[#141712] hover:bg-[#EDE7DC] border-2 border-[#BCB29E] shadow-2xs focus-visible:ring-4 focus-visible:ring-[#1E4B33]/20 font-semibold',
      outline:
        'bg-transparent text-[#1E4B33] hover:bg-[#EBF4EE] border-2 border-[#1E4B33] focus-visible:ring-4 focus-visible:ring-[#1E4B33]/20 font-semibold',
      danger:
        'bg-[#8A2418] text-white hover:bg-[#6D1B12] shadow-sm focus-visible:ring-4 focus-visible:ring-[#8A2418]/20 border border-[#6D1B12] font-semibold',
      ghost:
        'bg-transparent text-[#474C3F] hover:text-[#141712] hover:bg-[#EDE7DC] focus-visible:ring-4 focus-visible:ring-[#1E4B33]/20 font-semibold',
    }[variant];

    const sizeClasses = {
      sm: 'min-h-[36px] px-3 py-1.5 text-xs gap-1.5',
      md: 'min-h-[44px] px-4 py-2 text-sm gap-2',
      lg: 'min-h-[48px] px-6 py-2.5 text-base gap-2.5 font-semibold',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
