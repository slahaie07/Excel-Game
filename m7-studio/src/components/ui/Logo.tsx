import { Link } from "react-router-dom";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  light?: boolean;
};

export function Logo({ size = "md", light = true }: LogoProps) {
  const sizes = {
    sm: { mark: "text-xl", text: "text-sm" },
    md: { mark: "text-2xl", text: "text-base" },
    lg: { mark: "text-4xl", text: "text-lg" },
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span
        className={`font-display font-bold ${sizes[size].mark} gold-gradient-text transition-transform group-hover:scale-105`}
      >
        M7
      </span>
      <span
        className={`${sizes[size].text} tracking-[0.25em] uppercase font-medium ${
          light ? "text-white/90" : "text-m7-black"
        }`}
      >
        Studio
      </span>
    </Link>
  );
}
