import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants = {
  primary:
    "bg-m7-gold text-m7-black hover:bg-m7-gold-light shadow-[0_0_30px_rgba(201,169,98,0.25)]",
  outline:
    "border border-m7-gold/40 text-m7-gold hover:bg-m7-gold/10 hover:border-m7-gold/70",
  ghost: "text-m7-muted hover:text-m7-gold",
};

const sizes = {
  sm: "px-4 py-2 text-xs tracking-widest uppercase",
  md: "px-6 py-3 text-sm tracking-wider uppercase",
  lg: "px-8 py-4 text-sm tracking-widest uppercase",
};

export function Button({
  children,
  to,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center font-medium transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
