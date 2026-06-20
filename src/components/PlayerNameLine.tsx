import { getEquippedTitleLabel, getEquippedFrameStyle } from "../lib/playerDisplay";

export function PlayerNameLine({
  name,
  titleId,
  frameId,
  subtitle,
  className = "text-white text-sm",
}: {
  name: string;
  titleId?: string | null;
  frameId?: string | null;
  subtitle?: string;
  className?: string;
}) {
  const title = getEquippedTitleLabel(titleId);
  const frame = getEquippedFrameStyle(frameId);
  return (
    <div className={`rounded-lg px-2 py-1 inline-block ${frame ? `${frame.borderClass} ${frame.glowClass}` : ""}`}>
      <p className={className}>
        {frame && <span className="text-aether-400">{frame.icon} </span>}
        {title && <span className="text-crystal-gold">{title.icon} </span>}
        {name}
      </p>
      {title && <p className="text-crystal-gold text-[10px]">{title.name}</p>}
      {frame && !title && <p className="text-aether-400 text-[10px]">{frame.name}</p>}
      {subtitle && <p className="text-aether-500 text-xs">{subtitle}</p>}
    </div>
  );
}
