/** Quête de départ — miroir client initiation_accueil */
export const TUTORIAL_STARTER_QUEST = {
  questId: "initiation_accueil",
  status: "active" as const,
  objectives: [
    {
      type: "talk",
      targetId: "mentor_initiation",
      current: 0,
      required: 1,
    },
  ],
};
