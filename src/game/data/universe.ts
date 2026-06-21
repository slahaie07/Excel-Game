/**
 * AETHERIS — Univers du jeu
 * Monde fantasy où la magie provient des Cristaux d'Aether,
 * fragments d'une étoile morte tombés sur Terreval.
 */

export const UNIVERSE = {
  name: "Aetheris",
  subtitle: "L'Éveil des Cristaux",
  lore: `Il y a mille ans, l'étoile Aether s'est effondrée. Ses fragments — les Cristaux —
    ont percé le voile entre les mondes et atterri sur Terreval. Ceux qui les touchent
    développent des pouvoirs extraordinaires. Mais les Ombres Cristallines rôdent,
    corrompant tout sur leur passage. Vous êtes un Éveilleur, capable de canaliser
    l'énergie des Cristaux. Votre destin : sauver Terreval ou la plonger dans les ténèbres.`,
  factions: [
    { id: "lumina", name: "Ordre de Lumina", alignment: "light", description: "Gardiens des Cristaux purs" },
    { id: "umbra", name: "Conclave d'Umbra", alignment: "shadow", description: "Maîtres des Cristaux corrompus" },
    { id: "neutre", name: "Marchands Libres", alignment: "neutral", description: "Commerçants et artisans indépendants" },
  ],
  currencies: [
    { id: "eclats", name: "Éclats", symbol: "✦", description: "Monnaie cristalline de Terreval" },
    { id: "stardust", name: "Poussière Stellaire", symbol: "✧", description: "Monnaie premium rare" },
  ],
} as const;

export type FactionId = (typeof UNIVERSE.factions)[number]["id"];
