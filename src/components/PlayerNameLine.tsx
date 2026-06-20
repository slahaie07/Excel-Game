import { getEquippedTitleLabel } from "../lib/playerDisplay";

export function PlayerNameLine({
  name,
  titleId,
  subtitle,
  className = "text-white text-sm",
}: {
  name: string;
  titleId?: string | null;
  subtitle?: string;
  className?: string;
}) {
  const title = getEquippedTitleLabel(titleId);
  return (
    <div>
      <p className={className}>
        {title && <span className="text-crystal-gold">{title.icon} </span>}
        {name}
      </p>
      {title && <p className="text-crystal-gold text-[10px]">{title.name}</p>}
      {subtitle && <p className="text-aether-500 text-xs">{subtitle}</p>}
    </div>
  );
}
