import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  children: React.ReactNode;
}

export function IconButton({
  "aria-label": ariaLabel,
  className = "",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/85 hover:bg-white text-[#2f4943] border border-[#ded8cb] shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2f4943]/20 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
