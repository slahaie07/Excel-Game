import { useGameStore } from "../stores/gameStore";
import { saveUserPreferences } from "../lib/userPreferences";

const GUIDE_SECTIONS = [
  {
    title: "Exploration",
    icon: "🗺️",
    tips: [
      "Déplacez-vous sur la grille isométrique et touchez un monstre pour combattre.",
      "Utilisez le menu voyage pour changer de zone — la carte affiche le contrôle territorial.",
      "Les zones fortifiées par votre faction accordent +15% d'XP.",
    ],
  },
  {
    title: "Combat tactique",
    icon: "⚔️",
    tips: [
      "Chaque tour : déplacez-vous (PM) puis lancez des sorts (PA).",
      "Les talents actifs modifient dégâts, soins et portée.",
      "Victoire = XP, Éclats et progression faction.",
    ],
  },
  {
    title: "Factions & campagnes",
    icon: "🏛️",
    tips: [
      "Prêtez allégeance à Lumina, Umbra ou Neutre pour des bonus.",
      "Les campagnes hebdomadaires coopératives déterminent le contrôle territorial.",
      "Consultez la carte des territoires depuis Factions ou le monde.",
    ],
  },
  {
    title: "Multijoueur",
    icon: "☁️",
    tips: [
      "Avec Convex : donjons coop, raids 8j, PvP classé, guildes et chat.",
      "Hors-ligne : tout le contenu solo reste jouable en local.",
    ],
  },
];

export default function GuideScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  const finish = () => {
    saveUserPreferences({ guideCompleted: true });
    setScreen("world");
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        <button type="button" onClick={() => setScreen("settings")} className="text-aether-400 text-xl">
          ←
        </button>
        <h1 className="font-display text-xl font-bold">Guide du joueur</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {GUIDE_SECTIONS.map((section) => (
          <section key={section.title} className="card space-y-2">
            <h2 className="text-white text-sm font-semibold flex items-center gap-2">
              <span>{section.icon}</span>
              {section.title}
            </h2>
            <ul className="space-y-1.5">
              {section.tips.map((tip) => (
                <li key={tip} className="text-aether-400 text-xs flex gap-2">
                  <span className="text-crystal-cyan shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <button type="button" onClick={finish} className="btn-primary w-full">
          Compris — retour au jeu
        </button>
      </div>
    </div>
  );
}
