/** Terminologie Aetheris — distincte des JRPG tactiques classiques */

export const FLUX = "Flux";
export const FLUX_SHORT = "Fx";
export const ELAN = "Élan";
export const ELAN_SHORT = "Él";

export function formatFlux(current: number, max: number): string {
  return `⚡ ${current}/${max} ${FLUX}`;
}

export function formatElan(current: number, max: number): string {
  return `👟 ${current}/${max} ${ELAN}`;
}

export function formatFluxCost(cost: number): string {
  return `${cost} ${FLUX}`;
}

export function formatElanMove(distance: number): string {
  return `Déplacement (${distance} ${ELAN})`;
}

export const QUEST_TYPE_LABELS: Record<string, string> = {
  main: "Chronique",
  side: "Écho",
  daily: "Quotidien",
  guild: "Guilde",
  dungeon: "Donjon",
};

export const QUEST_TYPE_COLORS: Record<string, string> = {
  main: "text-crystal-cyan border-crystal-cyan/40 bg-crystal-cyan/10",
  side: "text-aether-300 border-aether-600/40 bg-aether-800/40",
  daily: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  guild: "text-violet-300 border-violet-500/40 bg-violet-500/10",
  dungeon: "text-rose-300 border-rose-500/40 bg-rose-500/10",
};
