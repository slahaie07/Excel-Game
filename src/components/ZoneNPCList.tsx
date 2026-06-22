import { useState } from "react";
import { getZoneById } from "../game/data";
import { getNpcsForZone } from "../game/data/npcs";
import { getNpcPortrait } from "../game/data/assets";
import { advanceQuestOnTalk } from "../lib/questProgress";

export function ZoneNPCList({
  zoneId,
  characterId,
}: {
  zoneId: string;
  characterId: string;
}) {
  const zone = getZoneById(zoneId);
  const npcs = zone ? getNpcsForZone(zoneId, zone.npcs) : [];
  const [dialogue, setDialogue] = useState<{ name: string; text: string } | null>(null);

  if (npcs.length === 0) return null;

  const interact = (npcId: string, name: string, text: string) => {
    advanceQuestOnTalk(characterId, npcId);
    setDialogue({ name, text });
  };

  return (
    <div className="px-4 py-2 border-b border-aether-700/30">
      <p className="text-aether-500 text-[10px] uppercase tracking-wide mb-1.5">Habitants</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {npcs.map((npc) => {
          const portrait = getNpcPortrait(npc.id);
          return (
          <button
            key={npc.id}
            type="button"
            onClick={() => interact(npc.id, npc.name, npc.dialogue)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-aether-900/60 rounded-lg px-2 py-1 border border-aether-700/40 hover:border-crystal-cyan/50 active:scale-95 transition-colors"
            title={npc.title}
          >
            {portrait ? (
              <img src={portrait} alt="" className="w-8 h-8 rounded-md object-cover border border-aether-600/40" />
            ) : (
              <span className="text-sm">{npc.icon}</span>
            )}
            <div className="min-w-0 text-left">
              <p className="text-aether-200 text-[10px] font-medium truncate max-w-[90px]">{npc.name}</p>
              <p className="text-aether-600 text-[8px] truncate max-w-[90px]">{npc.title}</p>
            </div>
          </button>
        );
        })}
      </div>
      {dialogue && (
        <div className="mt-2 card-premium py-2 px-3 flex items-start justify-between gap-2">
          <p className="text-aether-300 text-xs">
            <span className="text-crystal-cyan font-semibold">{dialogue.name}</span>
            {" — "}
            {dialogue.text}
          </p>
          <button type="button" onClick={() => setDialogue(null)} className="text-aether-500 text-xs shrink-0">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
