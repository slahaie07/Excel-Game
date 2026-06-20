import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import {
  CLASSES,
  ARCHETYPE_LABELS,
  getSpellById,
  getSpellsForClass,
  getSpellUnlockSchedule,
  getAvailableTalents,
  getTalentById,
} from "../game/data";
import { loadCharacter, saveCharacter } from "../lib/characterStorage";
import { isCloudCharacter } from "../lib/convexUtils";

function ClassSheet({
  classId,
  level,
  spells,
  talents,
  spellPoints,
  onSelectTalent,
  selecting,
}: {
  classId: string;
  level: number;
  spells: string[];
  talents: string[];
  spellPoints: number;
  onSelectTalent?: (talentId: string) => void;
  selecting?: boolean;
}) {
  const cls = CLASSES.find((c) => c.id === classId);
  if (!cls) return null;

  const allClassSpells = getSpellsForClass(classId);
  const schedule = getSpellUnlockSchedule(classId);
  const availableTalents = getAvailableTalents(cls.archetype, level, talents);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900">
      <div className="p-4 flex items-center gap-3 border-b border-aether-800">
        <button onClick={() => useGameStore.getState().setScreen("world")} className="text-aether-400 text-xl">←</button>
        <span className="text-3xl">{cls.icon}</span>
        <div>
          <h1 className="font-display text-lg font-bold text-white">{cls.name}</h1>
          <p className="text-aether-400 text-xs">{ARCHETYPE_LABELS[cls.archetype]} • Niv. {level}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="card">
          <p className="text-aether-300 text-sm">{cls.description}</p>
          <p className="text-aether-500 text-xs mt-2">{cls.title}</p>
        </div>

        <div className="card">
          <h2 className="text-aether-300 text-sm font-semibold mb-2">Stats de base</h2>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(cls.baseStats).map(([key, val]) => (
              <div key={key} className="bg-aether-900/60 rounded-lg p-2 text-center">
                <p className="text-aether-500 capitalize">{key.slice(0, 3)}</p>
                <p className="text-white font-bold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-aether-300 text-sm font-semibold mb-2">Grimoire</h2>
          <div className="space-y-2">
            {schedule.map(({ spellId, levelRequired }) => {
              const spell = getSpellById(spellId) ?? allClassSpells.find((s) => s.id === spellId);
              const unlocked = spells.includes(spellId);
              const locked = level < levelRequired;
              return (
                <div
                  key={spellId}
                  className={`flex items-center gap-2 p-2 rounded-lg ${unlocked ? "bg-aether-900/40" : "bg-aether-950/60 opacity-60"}`}
                >
                  <span className="text-xl">{spell?.icon ?? "❓"}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{spell?.name ?? spellId}</p>
                    <p className="text-aether-500 text-[10px]">
                      {unlocked ? "Débloqué" : locked ? `Niv. ${levelRequired} requis` : "Non appris"}
                    </p>
                  </div>
                  {unlocked && <span className="text-green-400 text-xs">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-aether-300 text-sm font-semibold">Talents</h2>
            <span className="text-crystal-gold text-xs">Points : {spellPoints}</span>
          </div>
          {talents.length > 0 && (
            <div className="space-y-1 mb-3">
              {talents.map((id) => {
                const t = getTalentById(id);
                return (
                  <div key={id} className="flex items-center gap-2 text-sm text-green-300">
                    <span>{t?.icon}</span>
                    <span>{t?.name} — <span className="text-aether-400 text-xs">{t?.description}</span></span>
                  </div>
                );
              })}
              <p className="text-aether-500 text-[10px] mt-1">Bonus actifs en combat</p>
            </div>
          )}
          {availableTalents.length > 0 ? (
            <div className="space-y-2">
              {availableTalents.map((t) => (
                <button
                  key={t.id}
                  disabled={selecting || spellPoints < 1}
                  onClick={() => onSelectTalent?.(t.id)}
                  className="w-full card p-3 text-left hover:border-aether-500 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-aether-400 text-xs">{t.description}</p>
                      <p className="text-aether-600 text-[10px]">Palier {t.tier} • Niv. {t.levelRequired}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-aether-500 text-xs">
              {level < 10
                ? "Talents disponibles à partir du niveau 10."
                : spellPoints < 1
                  ? "Gagnez un niveau pour obtenir un point de talent."
                  : "Tous les talents actuels sont acquis."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CloudClassSheet() {
  const characterId = useGameStore((s) => s.characterId)! as Id<"characters">;
  const classId = useGameStore((s) => s.classId)!;
  const doc = useQuery(api.characters.getCharacter, { characterId });
  const selectTalentMut = useMutation(api.characters.selectTalent);

  if (!doc) {
    return <div className="flex-1 flex items-center justify-center text-aether-400">Chargement...</div>;
  }

  return (
    <ClassSheet
      classId={classId}
      level={doc.level}
      spells={doc.spells}
      talents={doc.talents ?? []}
      spellPoints={doc.spellPoints}
      selecting={false}
      onSelectTalent={(talentId) => {
        void selectTalentMut({ characterId, talentId });
      }}
    />
  );
}

function LocalClassSheet() {
  const characterId = useGameStore((s) => s.characterId)!;
  const classId = useGameStore((s) => s.classId)!;
  const [, bump] = useState(0);
  const char = loadCharacter(characterId);
  if (!char) return null;

  const spellPoints = (char as { spellPoints?: number }).spellPoints ?? 0;
  const talents = (char as { talents?: string[] }).talents ?? [];

  return (
    <ClassSheet
      classId={classId}
      level={char.level}
      spells={char.spells}
      talents={talents}
      spellPoints={spellPoints}
      onSelectTalent={(talentId) => {
        const t = getTalentById(talentId);
        if (!t || spellPoints < 1) return;
        if (talents.some((id) => getTalentById(id)?.tier === t.tier)) return;
        saveCharacter(characterId, {
          ...char,
          talents: [...talents, talentId],
          spellPoints: spellPoints - 1,
        } as typeof char);
        bump((n) => n + 1);
      }}
    />
  );
}

export default function ClassScreen() {
  const characterId = useGameStore((s) => s.characterId);
  return isCloudCharacter(characterId) ? <CloudClassSheet /> : <LocalClassSheet />;
}
