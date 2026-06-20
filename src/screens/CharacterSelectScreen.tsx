import { useGameStore } from "../stores/gameStore";

interface SavedCharacter {
  id: string;
  name: string;
  classId: string;
  level: number;
}

function getSavedCharacters(accountId: string): SavedCharacter[] {
  try {
    const key = `aetheris-chars-${accountId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function CharacterSelectScreen() {
  const accountId = useGameStore((s) => s.accountId)!;
  const username = useGameStore((s) => s.username);
  const setCharacter = useGameStore((s) => s.setCharacter);
  const setScreen = useGameStore((s) => s.setScreen);

  const characters = getSavedCharacters(accountId);

  const selectCharacter = (char: SavedCharacter) => {
    setCharacter(char.id, char.name, char.classId);
    setScreen("world");
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900 p-6">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-aether-200">Choisissez votre Éveilleur</h1>
        <p className="text-aether-400 text-sm mt-1">Bienvenue, {username}</p>
      </div>

      <div className="flex-1 space-y-3 max-w-md mx-auto w-full overflow-y-auto">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => selectCharacter(char)}
            className="card w-full flex items-center gap-4 hover:border-aether-500 transition-colors active:scale-[0.98]"
          >
            <div className="text-3xl">
              {char.classId === "pyromancien" ? "🔥" :
               char.classId === "gardien" ? "🛡️" :
               char.classId === "eclaireur" ? "🗡️" :
               char.classId === "invocateur" ? "✨" :
               char.classId === "alchimiste" ? "⚗️" :
               char.classId === "archer" ? "🏹" :
               char.classId === "berserker" ? "⚔️" : "⏳"}
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-white">{char.name}</p>
              <p className="text-aether-400 text-sm">Niveau {char.level}</p>
            </div>
            <span className="text-aether-500">→</span>
          </button>
        ))}

        {characters.length < 5 && (
          <button
            onClick={() => setScreen("character-create")}
            className="card w-full flex items-center justify-center gap-2 border-dashed border-aether-600/50 py-6 hover:border-aether-500"
          >
            <span className="text-2xl">+</span>
            <span className="text-aether-300">Créer un personnage</span>
          </button>
        )}
      </div>
    </div>
  );
}
