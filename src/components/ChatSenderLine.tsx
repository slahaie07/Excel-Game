import { getEquippedTitleLabel } from "../lib/playerDisplay";

export function ChatSenderLine({
  name,
  titleId,
  content,
}: {
  name: string;
  titleId?: string | null;
  content: string;
}) {
  const title = getEquippedTitleLabel(titleId);
  return (
    <div className="text-sm">
      <span className="text-aether-300 font-semibold">
        {title && <span className="text-crystal-gold mr-1">{title.icon}</span>}
        {name}
        {title && <span className="text-crystal-gold/80 font-normal text-xs ml-1">[{title.name}]</span>}
        :{" "}
      </span>
      <span className="text-aether-400">{content}</span>
    </div>
  );
}
