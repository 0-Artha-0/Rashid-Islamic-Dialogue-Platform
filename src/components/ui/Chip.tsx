import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Chip({ children, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full border border-[#ded8cb] bg-white/85 px-3 py-1 text-[11px] sm:text-xs lg:px-1.5 lg:text-[10px] lg:leading-4 font-medium text-[#2c4740] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-150 hover:bg-white hover:border-[#b8af9c] hover:shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2c4740]/25 cursor-pointer whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
