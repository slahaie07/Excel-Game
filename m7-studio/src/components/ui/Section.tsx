import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  dark?: boolean;
};

export function Section({ children, id, className = "", dark = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${dark ? "bg-m7-charcoal" : ""} ${className}`}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  label: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
};

export function SectionHeader({ label, title, subtitle, centered = true }: SectionHeaderProps) {
  return (
    <div className={`mb-14 md:mb-20 reveal ${centered ? "text-center" : ""}`}>
      <p className="text-m7-gold text-xs tracking-[0.3em] uppercase mb-3">{label}</p>
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-m7-muted text-base md:text-lg max-w-2xl ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
      <div className="gold-line w-24 mt-6 mx-auto" />
    </div>
  );
}
