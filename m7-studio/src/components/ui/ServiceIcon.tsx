import type { Service } from "../../data/services";

const paths: Record<Service["icon"], string> = {
  brand: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  web: "M3 3h18v18H3zM3 9h18M9 21V9",
  dev: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  motion: "M5 3l14 9-14 9V3z",
  photo: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  strategy: "M22 12h-4l-3 9L9 3l-3 9H2",
};

export function ServiceIcon({ icon }: { icon: Service["icon"] }) {
  return (
    <div className="w-12 h-12 rounded-sm border border-m7-gold/25 flex items-center justify-center text-m7-gold">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[icon]} />
      </svg>
    </div>
  );
}
