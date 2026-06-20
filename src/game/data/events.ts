/**
 * Événements saisonniers d'Aetheris
 */

export type SeasonId = "printemps" | "ete" | "automne" | "hiver";

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  season: SeasonId;
  icon: string;
  color: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  bonuses: {
    xpMultiplier: number;
    eclatsMultiplier: number;
    dropRateBonus: number;
  };
  exclusiveMonsters: string[];
  exclusiveItems: string[];
  quests: EventQuest[];
  shopItems: EventShopItem[];
}

export interface EventQuest {
  id: string;
  name: string;
  description: string;
  objectives: { type: string; targetId: string; count: number; description: string }[];
  rewards: { xp: number; eclats: number; items?: { itemId: string; quantity: number }[] };
}

export interface EventShopItem {
  itemId: string;
  name: string;
  cost: number;
  currency: "eclats" | "stardust";
  stock: number;
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "renaissance_lumina",
    name: "Renaissance de Lumina",
    description: "Le printemps ranime les Cristaux. Les Fées de Brume apparaissent en masse et les récompenses fleurissent.",
    season: "printemps",
    icon: "🌸",
    color: "#ff69b4",
    startMonth: 3, startDay: 1,
    endMonth: 5, endDay: 31,
    bonuses: { xpMultiplier: 1.25, eclatsMultiplier: 1.1, dropRateBonus: 0.15 },
    exclusiveMonsters: ["event_gardien_floral"],
    exclusiveItems: ["fleur_ether", "couronne_florale"],
    quests: [
      {
        id: "event_collecte_florale",
        name: "Collecte Florale",
        description: "Récoltez des Fleurs d'Éther pour la célébration.",
        objectives: [{ type: "collect", targetId: "fleur_ether", count: 15, description: "Collecter 15 Fleurs d'Éther" }],
        rewards: { xp: 500, eclats: 200, items: [{ itemId: "couronne_florale", quantity: 1 }] },
      },
      {
        id: "event_chasse_fees",
        name: "Chasse aux Fées",
        description: "Éliminez les Fées de Brume envahissantes.",
        objectives: [{ type: "kill", targetId: "fee_brume", count: 10, description: "Éliminer 10 Fées de Brume" }],
        rewards: { xp: 800, eclats: 350 },
      },
    ],
    shopItems: [
      { itemId: "fleur_ether", name: "Fleur d'Éther", cost: 50, currency: "eclats", stock: 99 },
      { itemId: "couronne_florale", name: "Couronne Florale", cost: 500, currency: "eclats", stock: 1 },
      { itemId: "pet_wisp", name: "Wisp Stellaire", cost: 10, currency: "stardust", stock: 1 },
    ],
  },
  {
    id: "eclipse_aether",
    name: "Éclipse d'Aether",
    description: "L'étoile morte projette son ombre sur Terreval. Les Esprits d'Éclipse rôdent et les récompenses sont décuplées.",
    season: "ete",
    icon: "🌘",
    color: "#ffd700",
    startMonth: 6, startDay: 1,
    endMonth: 8, endDay: 31,
    bonuses: { xpMultiplier: 1.5, eclatsMultiplier: 1.3, dropRateBonus: 0.2 },
    exclusiveMonsters: ["event_esprit_eclipse"],
    exclusiveItems: ["fragment_eclipse", "amulette_solaire"],
    quests: [
      {
        id: "event_chasse_eclipse",
        name: "Chasse à l'Éclipse",
        description: "Traquez les Esprits d'Éclipse pendant l'événement.",
        objectives: [{ type: "kill", targetId: "event_esprit_eclipse", count: 8, description: "Éliminer 8 Esprits d'Éclipse" }],
        rewards: { xp: 1000, eclats: 500, items: [{ itemId: "amulette_solaire", quantity: 1 }] },
      },
    ],
    shopItems: [
      { itemId: "fragment_eclipse", name: "Fragment d'Éclipse", cost: 75, currency: "eclats", stock: 50 },
      { itemId: "amulette_solaire", name: "Amulette Solaire", cost: 800, currency: "eclats", stock: 1 },
    ],
  },
  {
    id: "invasion_ombres",
    name: "Invasion des Ombres",
    description: "Les Ombres Cristallines lancent une offensive. Unissez-vous pour repousser l'invasion !",
    season: "automne",
    icon: "👿",
    color: "#8b0000",
    startMonth: 9, startDay: 15,
    endMonth: 11, endDay: 15,
    bonuses: { xpMultiplier: 1.35, eclatsMultiplier: 1.2, dropRateBonus: 0.25 },
    exclusiveMonsters: ["event_ombre_majeur"],
    exclusiveItems: ["essence_ombre", "cape_umbra"],
    quests: [
      {
        id: "event_repousse_invasion",
        name: "Repousser l'Invasion",
        description: "Éliminez les Ombres Majeures qui envahissent Terreval.",
        objectives: [{ type: "kill", targetId: "event_ombre_majeur", count: 5, description: "Vaincre 5 Ombres Majeures" }],
        rewards: { xp: 1500, eclats: 750, items: [{ itemId: "cape_umbra", quantity: 1 }] },
      },
      {
        id: "event_defense_guilde",
        name: "Défense de Guilde",
        description: "Participez à la défense collective avec votre guilde.",
        objectives: [{ type: "kill", targetId: "any", count: 30, description: "Éliminer 30 monstres en groupe" }],
        rewards: { xp: 2000, eclats: 1000 },
      },
    ],
    shopItems: [
      { itemId: "essence_ombre", name: "Essence d'Ombre", cost: 100, currency: "eclats", stock: 30 },
      { itemId: "cape_umbra", name: "Cape d'Umbra", cost: 1200, currency: "eclats", stock: 1 },
    ],
  },
  {
    id: "fete_cristaux",
    name: "Fête des Cristaux",
    description: "L'hiver illumine Terreval. Les Cristaux brillent de mille feux et les cadeaux abondent.",
    season: "hiver",
    icon: "❄️",
    color: "#00bfff",
    startMonth: 12, startDay: 1,
    endMonth: 2, endDay: 28,
    bonuses: { xpMultiplier: 1.4, eclatsMultiplier: 1.5, dropRateBonus: 0.3 },
    exclusiveMonsters: ["event_cristal_ancien"],
    exclusiveItems: ["flocon_stellaire", "armure_givre"],
    quests: [
      {
        id: "event_collecte_flocons",
        name: "Flocons Stellaires",
        description: "Collectez des Flocons Stellaires tombés du ciel.",
        objectives: [{ type: "collect", targetId: "flocon_stellaire", count: 20, description: "Collecter 20 Flocons Stellaires" }],
        rewards: { xp: 600, eclats: 400, items: [{ itemId: "armure_givre", quantity: 1 }] },
      },
      {
        id: "event_gardien_cristal",
        name: "Gardien de Cristal",
        description: "Affrontez les Gardiens de Cristal Anciens.",
        objectives: [{ type: "kill", targetId: "event_cristal_ancien", count: 3, description: "Vaincre 3 Gardiens de Cristal" }],
        rewards: { xp: 1200, eclats: 600 },
      },
    ],
    shopItems: [
      { itemId: "flocon_stellaire", name: "Flocon Stellaire", cost: 40, currency: "eclats", stock: 99 },
      { itemId: "armure_givre", name: "Armure de Givre", cost: 900, currency: "eclats", stock: 1 },
      { itemId: "pet_dragonnet", name: "Dragonnet d'Aether", cost: 25, currency: "stardust", stock: 1 },
    ],
  },
];

export function getActiveEvent(now = new Date()): SeasonalEvent | null {
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const event of SEASONAL_EVENTS) {
    if (isDateInRange(month, day, event.startMonth, event.startDay, event.endMonth, event.endDay)) {
      return event;
    }
  }
  return null;
}

function isDateInRange(m: number, d: number, sm: number, sd: number, em: number, ed: number): boolean {
  const current = m * 100 + d;
  const start = sm * 100 + sd;
  const end = em * 100 + ed;
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}

export function getEventTimeRemaining(event: SeasonalEvent, now = new Date()): string {
  const year = now.getFullYear();
  let endDate = new Date(year, event.endMonth - 1, event.endDay, 23, 59, 59);
  if (endDate < now) endDate = new Date(year + 1, event.endMonth - 1, event.endDay, 23, 59, 59);
  const diff = endDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}j ${hours}h`;
}

export function getEventById(id: string): SeasonalEvent | undefined {
  return SEASONAL_EVENTS.find((e) => e.id === id);
}
