import { useGameStore } from "../stores/gameStore";
import { PETS, getPetById } from "../game/data";
import { loadCharacter, saveCharacter } from "../lib/characterStorage";

export default function PetsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);

  const char = loadCharacter(characterId);
  const ownedPets: string[] = (char?.inventory ?? [])
    .filter((i) => i.itemId.startsWith("pet_"))
    .map((i) => i.itemId);

  const activePetId = char?.petId;
  const activePet = activePetId ? getPetById(activePetId) : null;

  const equipPet = (petId: string) => {
    if (!char) return;
    saveCharacter(characterId, { ...char, petId });
    window.location.reload();
  };

  const unequipPet = () => {
    if (!char) return;
    const { petId: _, ...rest } = char;
    saveCharacter(characterId, { ...rest, petId: undefined });
    window.location.reload();
  };

  const allOwned = [...new Set([...ownedPets, ...(activePetId ? [activePetId] : [])])];

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Compagnons</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activePet ? (
          <div className="card border-aether-500">
            <p className="text-aether-400 text-xs mb-2">Compagnon actif</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activePet.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white">{activePet.name}</p>
                <p className="text-aether-400 text-sm">{activePet.description}</p>
                <p className="text-green-400 text-xs mt-1">
                  Bonus : +{activePet.bonusValue}% {activePet.bonusType}
                </p>
              </div>
            </div>
            <button onClick={unequipPet} className="btn-secondary w-full mt-3 text-sm">Ranger</button>
          </div>
        ) : (
          <div className="card text-center py-6 border-dashed">
            <p className="text-4xl mb-2">🥚</p>
            <p className="text-aether-400 text-sm">Aucun compagnon actif</p>
          </div>
        )}

        <section>
          <h2 className="text-aether-400 text-sm mb-2">Mes compagnons ({allOwned.length})</h2>
          {allOwned.length === 0 ? (
            <p className="text-aether-500 text-sm text-center py-4">
              Complétez des quêtes pour obtenir des compagnons !
            </p>
          ) : (
            allOwned.map((petId) => {
              const pet = getPetById(petId);
              if (!pet) return null;
              const isActive = petId === activePetId;
              return (
                <div key={petId} className={`card mb-2 flex items-center gap-3 ${isActive ? "border-aether-500" : ""}`}>
                  <span className="text-2xl">{pet.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{pet.name}</p>
                    <p className="text-aether-500 text-xs capitalize">{pet.rarity} • +{pet.bonusValue}% {pet.bonusType}</p>
                  </div>
                  {!isActive && (
                    <button onClick={() => equipPet(petId)} className="btn-secondary text-xs py-1 px-3">
                      Équiper
                    </button>
                  )}
                </div>
              );
            })
          )}
        </section>

        <section>
          <h2 className="text-aether-400 text-sm mb-2">Compagnons disponibles</h2>
          {PETS.filter((p) => !allOwned.includes(p.id)).map((pet) => (
            <div key={pet.id} className="card mb-2 opacity-60 flex items-center gap-3">
              <span className="text-2xl">{pet.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-aether-300 text-sm">{pet.name}</p>
                <p className="text-aether-500 text-xs">Niv. {pet.levelRequired} • {pet.rarity}</p>
              </div>
              <span className="text-aether-600 text-xs">🔒</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
