import { getEquippedTitleLabel, getEquippedFrameStyle } from "../lib/playerDisplay";

export function ChatSenderLine({
  name,
  titleId,
  frameId,
  content,
}: {
  name: string;
  titleId?: string | null;
  frameId?: string | null;
  content: string;
}) {
  const title = getEquippedTitleLabel(titleId);
  const frame = getEquippedFrameStyle(frameId);
  return (
    <div className={`text-sm rounded-lg px-2 py-1 inline-block ${frame ? `${frame.borderClass} ${frame.glowClass}` : ""}`}>
      <span className="text-aether-300 font-semibold">
        {frame && <span className="text-aether-400 mr-1">{frame.icon}</span>}
        {title && <span className="text-crystal-gold mr-1">{title.icon}</span>}
        {name}
        {title && <span className="text-crystal-gold/80 font-normal text-xs ml-1">[{title.name}]</span>}
        :{" "}
      </span>
      <span className="text-aether-400">{content}</span>
    </div>
  );
}
