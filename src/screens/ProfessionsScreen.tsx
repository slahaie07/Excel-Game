import { useGameStore } from "../stores/gameStore";
import { PROFESSIONS, MAX_PROFESSION_SLOTS } from "../game/data";

export default function ProfessionsScreen() {
  const characterId = useGameStore((s) => s.characterId)!;
  const setScreen = useGameStore((s) => s.setScreen);

  const charData = JSON.parse(localStorage.getItem(`aetheris-char-${characterId}`) ?? "{}");
  const learnedProfessions: { professionId: string; level: number; xp: number }[] =
    charData.professions ?? [];

  const learnProfession = (professionId: string) => {
    if (learnedProfessions.length >= MAX_PROFESSION_SLOTS) return;
    if (learnedProfessions.some((p) => p.professionId === professionId)) return;

    charData.professions = [...learnedProfessions, { professionId, level: 1, xp: 0 }];
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
    window.location.reload();
  };

  const craftItem = (professionId: string, recipeId: string) => {
    const profession = PROFESSIONS.find((p) => p.id === professionId);
    const recipe = profession?.recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const inventory = charData.inventory ?? [];
    const hasIngredients = recipe.ingredients.every((ing) => {
      const item = inventory.find((i: { itemId: string }) => i.itemId === ing.itemId);
      return item && item.quantity >= ing.quantity;
    });

    if (!hasIngredients) return;

    let newInventory = inventory.map((i: { itemId: string; quantity: number }) => {
      const ing = recipe.ingredients.find((ing) => ing.itemId === i.itemId);
      if (ing) return { ...i, quantity: i.quantity - ing.quantity };
      return i;
    }).filter((i: { quantity: number }) => i.quantity > 0);

    const existing = newInventory.find((i: { itemId: string }) => i.itemId === recipe.result.itemId);
    if (existing) existing.quantity += recipe.result.quantity;
    else newInventory.push({ itemId: recipe.result.itemId, quantity: recipe.result.quantity });

    charData.inventory = newInventory;
    localStorage.setItem(`aetheris-char-${characterId}`, JSON.stringify(charData));
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button onClick={() => setScreen("world")} className="text-aether-400 text-xl">←</button>
        <h1 className="font-display text-xl font-bold">Métiers</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h2 className="text-aether-400 text-sm mb-2">Mes métiers ({learnedProfessions.length}/{MAX_PROFESSION_SLOTS})</h2>
          {learnedProfessions.map((lp) => {
            const prof = PROFESSIONS.find((p) => p.id === lp.professionId);
            if (!prof) return null;
            return (
              <div key={lp.professionId} className="card mb-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{prof.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{prof.name}</p>
                    <p className="text-aether-500 text-xs">Niveau {lp.level}</p>
                  </div>
                </div>
                {prof.recipes.length > 0 && (
                  <div className="space-y-2">
                    {prof.recipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        onClick={() => craftItem(lp.professionId, recipe.id)}
                        className="w-full bg-aether-950/50 rounded-lg p-2 text-left flex items-center justify-between"
                      >
                        <span className="text-aether-300 text-xs">{recipe.name}</span>
                        <span className="text-aether-500 text-[10px]">Niv. {recipe.levelRequired}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section>
          <h2 className="text-aether-400 text-sm mb-2">Apprendre un métier</h2>
          {PROFESSIONS.filter((p) => !learnedProfessions.some((lp) => lp.professionId === p.id)).map((prof) => (
            <div key={prof.id} className="card mb-2 flex items-center gap-3">
              <span className="text-2xl">{prof.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{prof.name}</p>
                <p className="text-aether-500 text-xs">{prof.description}</p>
              </div>
              <button
                onClick={() => learnProfession(prof.id)}
                disabled={learnedProfessions.length >= MAX_PROFESSION_SLOTS}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
              >
                Apprendre
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
