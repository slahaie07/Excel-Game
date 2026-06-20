import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useGameStore } from "../stores/gameStore";
import { CLASSES, ARCHETYPE_LABELS } from "../game/data";
import { isCloudAccount } from "../lib/convexUtils";

function CharacterCreateForm({
  onCreate,
  loading,
}: {
  onCreate: (name: string, classId: string) => void;
  loading: boolean;
}) {
  const setScreen = useGameStore((s) => s.setScreen);
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]!.id);
  const [error, setError] = useState("");
  const selectedClassData = CLASSES.find((c) => c.id === selectedClass)!;

  const handleCreate = () => {
    if (name.trim().length < 2) { setError("Nom trop court"); return; }
    if (name.trim().length > 16) { setError("Nom trop long"); return; }
    onCreate(name.trim(), selectedClass);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => setScreen("character-select")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold text-aether-200">Créer un Éveilleur</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div>
          <label className="text-aether-300 text-sm mb-2 block">Nom du personnage</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="Ex: Kaelthas"
            className="w-full bg-aether-900/80 border border-aether-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-aether-500"
            maxLength={16}
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        <div>
          <label className="text-aether-300 text-sm mb-3 block">Choisissez votre classe</label>
          <div className="grid grid-cols-2 gap-2">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`card p-3 text-left ${selectedClass === cls.id ? "border-aether-500 ring-2 ring-aether-500/30" : ""}`}
              >
                <div className="text-2xl mb-1">{cls.icon}</div>
                <p className="font-bold text-sm text-white">{cls.name}</p>
                <p className="text-xs text-aether-500">{ARCHETYPE_LABELS[cls.archetype]}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="text-aether-300 text-sm">{selectedClassData.description}</p>
        </div>
        <button onClick={handleCreate} className="btn-primary w-full" disabled={loading}>
          {loading ? "Création..." : `Éveiller ${name || "mon personnage"}`}
        </button>
      </div>
    </div>
  );
}

function CloudCreate() {
  const accountId = useGameStore((s) => s.accountId)!;
  const setCharacter = useGameStore((s) => s.setCharacter);
  const setScreen = useGameStore((s) => s.setScreen);
  const [loading, setLoading] = useState(false);
  const createCloudCharacter = useMutation(api.characters.createCharacter);

  const onCreate = async (name: string, classId: string) => {
    setLoading(true);
    try {
      const charId = await createCloudCharacter({
        accountId: accountId as Id<"accounts">,
        name,
        classId,
      });
      setCharacter(charId, name, classId);
      setScreen("world");
    } finally {
      setLoading(false);
    }
  };

  return <CharacterCreateForm onCreate={(n, c) => void onCreate(n, c)} loading={loading} />;
}

function LocalCreate() {
  const accountId = useGameStore((s) => s.accountId)!;
  const setCharacter = useGameStore((s) => s.setCharacter);
  const setScreen = useGameStore((s) => s.setScreen);

  const onCreate = (name: string, classId: string) => {
    const selectedClassData = CLASSES.find((c) => c.id === classId)!;
    const charId = `char_${Date.now()}`;
    const key = `aetheris-chars-${accountId}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
    localStorage.setItem(key, JSON.stringify([...existing, { id: charId, name, classId, level: 1 }]));
    localStorage.setItem(`aetheris-char-${charId}`, JSON.stringify({
      id: charId, name, classId, level: 1, xp: 0, xpToNext: 100,
      hp: 100, maxHp: 100, ap: 6, maxAp: 6, mp: 3, maxMp: 3,
      eclats: 100, zoneId: "vallee_eveils",
      spells: selectedClassData.startingSpells,
      inventory: [{ itemId: "pain_eveil", quantity: 10 }, { itemId: "potion_vie", quantity: 3 }],
      equipment: {}, activeQuests: [], completedQuests: [],
      stats: selectedClassData.baseStats,
    }));
    setCharacter(charId, name, classId);
    setScreen("world");
  };

  return <CharacterCreateForm onCreate={onCreate} loading={false} />;
}

export default function CharacterCreateScreen() {
  const accountId = useGameStore((s) => s.accountId)!;
  return isCloudAccount(accountId) ? <CloudCreate /> : <LocalCreate />;
}
