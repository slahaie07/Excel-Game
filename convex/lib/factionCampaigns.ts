import type { FactionId } from "./factions";
import { getWeekKey } from "./factionContent";

export interface FactionCampaignTemplate {
  id: string;
  factionId: FactionId;
  name: string;
  description: string;
  target: number;
  rewardReputation: number;
  rewardEclats: number;
  minContribution: number;
}

export const FACTION_CAMPAIGN_TEMPLATES: FactionCampaignTemplate[] = [
  {
    id: "lumina_purify",
    factionId: "lumina",
    name: "Purification stellaire",
    description: "L'Ordre de Lumina mobilise ses Éveilleurs pour purifier les terres.",
    target: 2500,
    rewardReputation: 80,
    rewardEclats: 200,
    minContribution: 15,
  },
  {
    id: "umbra_dominion",
    factionId: "umbra",
    name: "Domination de l'ombre",
    description: "Le Conclave d'Umbra cherche à étendre son influence par la force.",
    target: 2500,
    rewardReputation: 80,
    rewardEclats: 200,
    minContribution: 15,
  },
  {
    id: "neutre_convoy",
    factionId: "neutre",
    name: "Grand convoi marchand",
    description: "Les Marchands Libres organisent un convoi à travers Terreval.",
    target: 2500,
    rewardReputation: 80,
    rewardEclats: 200,
    minContribution: 15,
  },
];

export const CAMPAIGN_POINT_VALUES = {
  world_kill: 1,
  pvp_win: 3,
  quest_claim: 5,
  shop_purchase: 2,
} as const;

export type CampaignPointEvent = keyof typeof CAMPAIGN_POINT_VALUES;

export function getCampaignTemplate(factionId: FactionId): FactionCampaignTemplate {
  return FACTION_CAMPAIGN_TEMPLATES.find((c) => c.factionId === factionId)!;
}

export { getWeekKey };
