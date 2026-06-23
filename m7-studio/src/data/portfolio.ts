export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  description: string;
  tags: string[];
  gradient: string;
  image: string;
};

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: "luxe-noir",
    title: "Maison Noir",
    category: "Branding",
    client: "Maison Noir Paris",
    year: "2025",
    description: "Identité visuelle complète pour une marque de luxe parisienne. Logo doré, packaging et site e-commerce.",
    tags: ["Branding", "Web", "Packaging"],
    gradient: "from-amber-900/40 via-black to-zinc-900",
    image: "/portfolio/luxe-noir.svg",
  },
  {
    id: "vertex-tech",
    title: "Vertex Tech",
    category: "Web Design",
    client: "Vertex Technologies",
    year: "2025",
    description: "Site corporate SaaS avec animations fluides, dark mode et dashboard interactif.",
    tags: ["UI/UX", "React", "Motion"],
    gradient: "from-zinc-800 via-black to-amber-950/30",
    image: "/portfolio/vertex-tech.svg",
  },
  {
    id: "aurum-restaurant",
    title: "Aurum",
    category: "Branding",
    client: "Restaurant Aurum",
    year: "2024",
    description: "Rebranding gastronomique : menu, signalétique et identité sociale en or et noir.",
    tags: ["Branding", "Print", "Social"],
    gradient: "from-yellow-900/30 via-black to-stone-900",
    image: "/portfolio/aurum-restaurant.svg",
  },
  {
    id: "pulse-fitness",
    title: "Pulse Fitness",
    category: "Web Design",
    client: "Pulse Studio",
    year: "2024",
    description: "Application mobile-first pour réservation de cours et abonnements premium.",
    tags: ["App", "UI/UX", "Dev"],
    gradient: "from-neutral-900 via-black to-amber-900/20",
    image: "/portfolio/pulse-fitness.svg",
  },
  {
    id: "eloquence",
    title: "Éloquence",
    category: "Motion",
    client: "Éloquence Agency",
    year: "2024",
    description: "Film de marque 60s, reels Instagram et animations logo pour une agence de communication.",
    tags: ["Motion", "Video", "Social"],
    gradient: "from-stone-900 via-black to-yellow-950/40",
    image: "/portfolio/eloquence.svg",
  },
  {
    id: "monolith",
    title: "Monolith",
    category: "Développement",
    client: "Monolith Architecture",
    year: "2023",
    description: "Portfolio immersif avec galerie 3D, formulaire intelligent et CMS sur mesure.",
    tags: ["Dev", "3D", "CMS"],
    gradient: "from-zinc-950 via-black to-amber-800/25",
    image: "/portfolio/monolith.svg",
  },
];

export const CATEGORIES = ["Tous", "Branding", "Web Design", "Motion", "Développement"] as const;
