import React from "react";

export type CardVariant = "sand" | "blush" | "sage";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  title: string;
  subtitle: string;
}

const variantStyles: Record<CardVariant, string> = {
  sand: "bg-[#efe5d2]/90 border-[#e1d3bc] hover:bg-[#ebe0cc]",
  blush: "bg-[#f5e3df]/90 border-[#ebd2ce] hover:bg-[#f0dbd7]",
  sage: "bg-[#dbe7df]/90 border-[#c7d8cf] hover:bg-[#d0dfd7]",
};

export function Card({
  variant = "sand",
  title,
  subtitle,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 sm:py-3.5 lg:rounded-[14px] transition-all duration-150 cursor-pointer text-right shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <h3 className="font-semibold text-[#1a352f] text-xs sm:text-[12px] leading-[1.3]">
        {title}
      </h3>
      <p className="text-[9px] sm:text-[10px] text-[#4a635a] mt-1.5 font-normal leading-[1.3]">
        {subtitle}
      </p>
    </div>
  );
}
