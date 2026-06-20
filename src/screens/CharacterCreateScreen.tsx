import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { CLASSES } from "../game/data";

export default function CharacterCreateScreen() {
  const accountId = useGameStore((s) => s.accountId)!;
  const setCharacter = useGameStore((s) => s.setCharacter);
  const setScreen = useGameStore((s) => s.setScreen);

  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]!.id);
  const [error, setError] = useState("");

  const selectedClassData = CLASSES.find((c) => c.id === selectedClass)!;

  const handleCreate = () => {
    if (name.trim().length < 2) {
      setError("Nom trop court (min 2 caractères)");
      return;
    }
    if (name.trim().length > 16) {
      setError("Nom trop long (max 16 caractères)");
      return;
    }

    const charId = `char_${Date.now()}`;
    const newChar = { id: charId, name: name.trim(), classId: selectedClass, level: 1 };

    const key = `aetheris-chars-${accountId}`;
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
    const taken = existing.some((c: { name: string }) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (taken) {
      setError("Ce nom est déjà pris");
      return;
    }

    localStorage.setItem(key, JSON.stringify([...existing, newChar]));

    const charDataKey = `aetheris-char-${charId}`;
    localStorage.setItem(charDataKey, JSON.stringify({
      ...newChar,
      xp: 0,
      xpToNext: 100,
      hp: 100,
      maxHp: 100,
      ap: 6,
      maxAp: 6,
      mp: 3,
      maxMp: 3,
      eclats: 100,
      zoneId: "vallee_eveils",
      spells: selectedClassData.startingSpells,
      inventory: [
        { itemId: "pain_eveil", quantity: 10 },
        { itemId: "potion_vie", quantity: 3 },
      ],
      equipment: {},
      activeQuests: [],
      completedQuests: [],
      stats: selectedClassData.baseStats,
      haven: { level: 1, furniture: [], visitors: 0 },
    }));

    setCharacter(charId, name.trim(), selectedClass);
    setScreen("world");
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
                className={`card p-3 text-left transition-all ${
                  selectedClass === cls.id
                    ? "border-aether-500 ring-2 ring-aether-500/30"
                    : "hover:border-aether-600"
                }`}
                style={selectedClass === cls.id ? { borderColor: cls.color } : {}}
              >
                <div className="text-2xl mb-1">{cls.icon}</div>
                <p className="font-bold text-sm text-white">{cls.name}</p>
                <p className="text-aether-500 text-xs">{cls.role.toUpperCase()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderColor: selectedClassData.color + "40" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{selectedClassData.icon}</span>
            <div>
              <p className="font-display font-bold text-white">{selectedClassData.name}</p>
              <p className="text-aether-400 text-sm">{selectedClassData.title}</p>
            </div>
          </div>
          <p className="text-aether-300 text-sm mb-3">{selectedClassData.description}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(selectedClassData.baseStats).map(([stat, val]) => (
              <div key={stat} className="bg-aether-950/50 rounded-lg p-2 text-center">
                <p className="text-aether-500 capitalize">{stat.slice(0, 3)}</p>
                <p className="font-bold text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleCreate} className="btn-primary w-full">
          Éveiller {name || "mon personnage"}
        </button>
      </div>
    </div>
  );
}
