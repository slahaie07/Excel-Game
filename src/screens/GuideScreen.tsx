import { useGameStore } from "../stores/gameStore";
import { saveUserPreferences, loadUserPreferences, APP_VERSION, VERSION_LABEL } from "../lib/userPreferences";
import { FLUX, ELAN } from "../lib/gameTerms";

const GUIDE_SECTIONS = [
  {
    title: "Jardin de l'Initiation",
    icon: "🌱",
    tips: [
      "Chaque nouvel Éveilleur commence dans le Jardin — zone tutoriel sans danger.",
      "6 quêtes vous guident : PNJ, combat, inventaire, récolte, donjon, puis départ vers la Vallée.",
      "Terminez l'initiation avant de voyager hors du jardin.",
    ],
  },
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
      `Chaque tour : déplacez-vous (${ELAN}) puis lancez des sorts (${FLUX}).`,
      "Les talents actifs modifient dégâts, soins et portée.",
      "Victoire = XP, Éclats ✦ et progression faction.",
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
    title: "Terreval Finale (v5)",
    icon: "💎",
    tips: [
      "260 quêtes — chroniques, échos régionaux et défis quotidiens.",
      "120 donjons dont 26 raids mythiques aux quatre coins du monde.",
      "30 métiers artisanaux et synchronisation cloud des quêtes en temps réel.",
      "La Chronique Finale couronne l'endgame pour les Éveilleurs de niveau 180+.",
    ],
  },
  {
    title: "Multijoueur",
    icon: "☁️",
    tips: [
      "En ligne : donjons coop, raids 8 joueurs, PvP classé, guildes et chat.",
      "Hors-ligne : tout le contenu solo reste jouable en mode sanctuaire.",
    ],
  },
];

export default function GuideScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const onboarding = !loadUserPreferences().guideCompleted;

  const finish = () => {
    saveUserPreferences({ guideCompleted: true });
    setScreen("world");
  };

  return (
    <div className="flex-1 flex flex-col bg-aether-950">
      <div className="flex items-center gap-3 p-4 border-b border-aether-700/40">
        {!onboarding && (
          <button type="button" onClick={() => setScreen("settings")} className="text-aether-400 text-xl">
            ←
          </button>
        )}
        <h1 className="font-display text-xl font-bold">
          {onboarding ? "Bienvenue à Terreval" : "Guide du joueur"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {onboarding && (
          <p className="text-aether-400 text-sm card border-crystal-cyan/30">
            {VERSION_LABEL} v{APP_VERSION} — voici l&apos;essentiel avant votre première bataille.
          </p>
        )}
        {GUIDE_SECTIONS.map((section) => (
          <section key={section.title} className="card-premium space-y-2">
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
          {onboarding ? "Commencer l'Éveil" : "Compris — retour au jeu"}
        </button>
      </div>
    </div>
  );
}
