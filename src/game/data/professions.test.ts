import { describe, expect, it } from "vitest";
import { PROFESSIONS, MAX_PROFESSION_SLOTS } from "./professions";
import { EXPANSION_PROFESSIONS_V32 } from "./expansionProfessions";
import { EXPANSION_PROFESSIONS_V50 } from "./expansionProfessionsV50";
import { ITEMS } from "./items";

const itemIds = new Set(ITEMS.map((i) => i.id));

describe("professions", () => {
  it("has 30 professions after v5.0 expansion", () => {
    expect(PROFESSIONS.length).toBe(30);
    expect(EXPANSION_PROFESSIONS_V32.length).toBe(17);
    expect(EXPANSION_PROFESSIONS_V50.length).toBe(7);
    expect(MAX_PROFESSION_SLOTS).toBe(5);
  });

  it("has unique profession and recipe ids", () => {
    const profIds = PROFESSIONS.map((p) => p.id);
    expect(new Set(profIds).size).toBe(profIds.length);

    const recipeIds = PROFESSIONS.flatMap((p) => p.recipes.map((r) => r.id));
    expect(new Set(recipeIds).size).toBe(recipeIds.length);
  });

  it("recipe ingredients and results reference valid items", () => {
    for (const prof of PROFESSIONS) {
      for (const recipe of prof.recipes) {
        expect(itemIds.has(recipe.result.itemId), `${prof.id}/${recipe.id} result`).toBe(true);
        for (const ing of recipe.ingredients) {
          expect(itemIds.has(ing.itemId), `${prof.id}/${recipe.id} ing ${ing.itemId}`).toBe(true);
        }
      }
    }
  });

  it("balances gathering and crafting professions", () => {
    const gathering = PROFESSIONS.filter((p) => p.type === "gathering").length;
    const crafting = PROFESSIONS.filter((p) => p.type === "crafting").length;
    expect(gathering).toBeGreaterThanOrEqual(8);
    expect(crafting).toBeGreaterThanOrEqual(8);
  });
});
