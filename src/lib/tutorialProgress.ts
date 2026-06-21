import { getQuestById } from "../game/data";
import { loadCharacter } from "./characterStorage";
import {
  TUTORIAL_COMPLETE_QUEST_ID,
  TUTORIAL_STARTER_QUEST_ID,
  TUTORIAL_ZONE_ID,
} from "../game/data/tutorialContent";

export interface ActiveQuestShape {
  questId: string;
  status: string;
  objectives: {
    type: string;
    targetId: string;
    description: string;
    current: number;
    required: number;
  }[];
}

export function buildActiveQuest(questId: string): ActiveQuestShape {
  const quest = getQuestById(questId);
  if (!quest) {
    throw new Error(`Quête inconnue : ${questId}`);
  }
  return {
    questId,
    status: "active",
    objectives: quest.objectives.map((o) => ({
      type: o.type,
      targetId: o.targetId,
      description: o.description,
      current: 0,
      required: o.count,
    })),
  };
}

export function buildStarterActiveQuest(): ActiveQuestShape {
  return buildActiveQuest(TUTORIAL_STARTER_QUEST_ID);
}

export function isTutorialComplete(characterId: string): boolean {
  const char = loadCharacter(characterId);
  if (!char) return false;
  const completed = char.completedQuests ?? [];
  return completed.includes(TUTORIAL_COMPLETE_QUEST_ID);
}

export function canLeaveTutorialZone(characterId: string): boolean {
  return isTutorialComplete(characterId);
}

export function canTravelToZone(
  characterId: string,
  fromZoneId: string,
  toZoneId: string
): { allowed: boolean; message?: string } {
  if (fromZoneId === toZoneId) return { allowed: true };
  if (fromZoneId === TUTORIAL_ZONE_ID && !canLeaveTutorialZone(characterId)) {
    return {
      allowed: false,
      message:
        "Terminez l'initiation dans le Jardin (parlez au Gardien du passage) avant de quitter la zone.",
    };
  }
  return { allowed: true };
}

export interface TutorialHint {
  title: string;
  body: string;
  action?: string;
}

const HINT_BY_QUEST: Record<string, TutorialHint> = {
  initiation_accueil: {
    title: "Étape 1 — Accueil",
    body: "Touchez Elena Lumeveil dans la liste des habitants ci-dessous.",
    action: "Parler au mentor",
  },
  initiation_combat: {
    title: "Étape 2 — Combat",
    body: "Touchez une Étincelle Naissante sur la carte isométrique pour lancer un combat tactique.",
    action: "Flux puis sorts",
  },
  initiation_equipement: {
    title: "Étape 3 — Équipement",
    body: "Ouvrez l'inventaire via le menu, puis équipez l'épée d'apprenti. Revenez voir Elena.",
    action: "Sac → équiper",
  },
  initiation_recolte: {
    title: "Étape 4 — Récolte",
    body: "Parlez à Théa, puis collectez des herbes d'éveil (quêtes ou butin de Mousse Vivante).",
    action: "Herbes ×3",
  },
  initiation_donjon: {
    title: "Étape 5 — Donjon",
    body: "Menu Donjons → Alcôve de Démonstration. Vainquez l'Écho d'Entraînement.",
    action: "Donjon démo",
  },
  initiation_depart: {
    title: "Étape 6 — Départ",
    body: "Parlez à Varen Porteciel pour ouvrir le chemin vers la Vallée des Éveils.",
    action: "Gardien du passage",
  },
};

export function getTutorialHint(characterId: string): TutorialHint | null {
  if (isTutorialComplete(characterId)) return null;

  const char = loadCharacter(characterId);
  if (!char) return null;

  const active = Array.isArray(char.activeQuests)
    ? (char.activeQuests as { questId: string; status: string }[])
    : [];
  const tutorialActive = active.find(
    (q) => q.status === "active" && q.questId.startsWith("initiation_")
  );
  if (tutorialActive) {
    return HINT_BY_QUEST[tutorialActive.questId] ?? null;
  }

  return {
    title: "Jardin de l'Initiation",
    body: "Acceptez la quête d'accueil dans l'onglet Quêtes pour commencer la démonstration.",
    action: "Quêtes",
  };
}

export function isInTutorialZone(zoneId: string): boolean {
  return zoneId === TUTORIAL_ZONE_ID;
}
