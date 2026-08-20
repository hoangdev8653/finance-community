import React from 'react';

export interface FlagIconProps extends React.SVGAttributes<SVGElement> {
  className?: string;
}

/**
 * Flag of Vietnam (Cờ đỏ sao vàng)
 */
export function VietnamFlag({ className = 'h-3.5 w-5', ...props }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`shrink-0 rounded-[2px] overflow-hidden shadow-2xs ${className}`}
      aria-hidden="true"
      {...props}
    >
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        points="15,4 17.35,11.23 11.2,6.76 18.8,6.76 12.65,11.23"
        fill="#FFFF00"
      />
    </svg>
  );
}

/**
 * Flag of the United States (Cờ Mỹ)
 */
export function USAFlag({ className = 'h-3.5 w-5', ...props }: FlagIconProps) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`shrink-0 rounded-[2px] overflow-hidden shadow-2xs ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* 13 Stripes */}
      <rect width="30" height="20" fill="#B22234" />
      <rect y="1.54" width="30" height="1.54" fill="#FFFFFF" />
      <rect y="4.62" width="30" height="1.54" fill="#FFFFFF" />
      <rect y="7.70" width="30" height="1.54" fill="#FFFFFF" />
      <rect y="10.78" width="30" height="1.54" fill="#FFFFFF" />
      <rect y="13.86" width="30" height="1.54" fill="#FFFFFF" />
      <rect y="16.94" width="30" height="1.54" fill="#FFFFFF" />
      {/* Blue Canton */}
      <rect width="12" height="10.77" fill="#3C3B6E" />
      {/* Mini Stars Grid */}
      <circle cx="2.5" cy="2" r="0.65" fill="#FFFFFF" />
      <circle cx="6" cy="2" r="0.65" fill="#FFFFFF" />
      <circle cx="9.5" cy="2" r="0.65" fill="#FFFFFF" />
      <circle cx="4.25" cy="4" r="0.65" fill="#FFFFFF" />
      <circle cx="7.75" cy="4" r="0.65" fill="#FFFFFF" />
      <circle cx="2.5" cy="6" r="0.65" fill="#FFFFFF" />
      <circle cx="6" cy="6" r="0.65" fill="#FFFFFF" />
      <circle cx="9.5" cy="6" r="0.65" fill="#FFFFFF" />
      <circle cx="4.25" cy="8" r="0.65" fill="#FFFFFF" />
      <circle cx="7.75" cy="8" r="0.65" fill="#FFFFFF" />
    </svg>
  );
}
