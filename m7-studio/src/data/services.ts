export type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: "brand" | "web" | "motion" | "photo" | "strategy" | "dev";
};

export const SERVICES: Service[] = [
  {
    id: "branding",
    title: "Branding & Identité",
    subtitle: "Marques mémorables",
    description:
      "Logo, charte graphique, typographie et univers visuel cohérents. Nous sculptons des identités qui se démarquent et inspirent confiance.",
    features: ["Logo & déclinaisons", "Charte graphique complète", "Guidelines PDF", "Papeterie & signatures"],
    icon: "brand",
  },
  {
    id: "web",
    title: "Web Design",
    subtitle: "Sites premium",
    description:
      "Interfaces élégantes, UX soignée et design responsive. Chaque page est pensée pour convertir et impressionner sur mobile comme sur desktop.",
    features: ["UI/UX design", "Maquettes Figma", "Design system", "Prototypage interactif"],
    icon: "web",
  },
  {
    id: "dev",
    title: "Développement",
    subtitle: "Code performant",
    description:
      "Sites vitrines, applications web et e-commerce sur mesure. Technologies modernes, performances optimales et SEO intégré.",
    features: ["React / Next.js", "E-commerce", "CMS headless", "Hébergement & maintenance"],
    icon: "dev",
  },
  {
    id: "motion",
    title: "Motion Design",
    subtitle: "Animations vivantes",
    description:
      "Vidéos, reels, animations UI et contenus sociaux qui captent l'attention. Le mouvement au service de votre message.",
    features: ["Vidéos corporate", "Animations logo", "Reels & stories", "After Effects / Lottie"],
    icon: "motion",
  },
  {
    id: "photo",
    title: "Photo & Vidéo",
    subtitle: "Production visuelle",
    description:
      "Shootings produits, portraits corporate et contenus pour réseaux sociaux. Une image premium pour une marque premium.",
    features: ["Shooting studio", "Retouche pro", "Direction artistique", "Livraison multi-formats"],
    icon: "photo",
  },
  {
    id: "strategy",
    title: "Stratégie Digitale",
    subtitle: "Vision & croissance",
    description:
      "Audit, positionnement et feuille de route digitale. Nous alignons créativité et objectifs business pour des résultats mesurables.",
    features: ["Audit de marque", "Positionnement", "Plan de contenu", "Accompagnement mensuel"],
    icon: "strategy",
  },
];

export const PROCESS_STEPS = [
  { step: "01", title: "Découverte", text: "Brief, objectifs, cible et inspirations. Nous comprenons votre vision avant de créer." },
  { step: "02", title: "Conception", text: "Moodboards, esquisses et propositions créatives. Itérations jusqu'à la perfection." },
  { step: "03", title: "Production", text: "Design final, développement et assets livrables. Qualité premium à chaque étape." },
  { step: "04", title: "Livraison", text: "Fichiers sources, formation et support. Votre projet prêt à briller en ligne." },
];
