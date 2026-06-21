export const BRAND = {
  name: "M7 Studio",
  tagline: "L'excellence créative, en or & noir",
  email: "contact@m7studio.fr",
  phone: "+33 1 84 60 00 07",
  address: "Paris, France",
  social: {
    instagram: "https://instagram.com/m7studio",
    linkedin: "https://linkedin.com/company/m7studio",
    behance: "https://behance.net/m7studio",
    dribbble: "https://dribbble.com/m7studio",
  },
} as const;

export const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export const STATS = [
  { value: "120+", label: "Projets livrés" },
  { value: "8", label: "Années d'expertise" },
  { value: "98%", label: "Clients satisfaits" },
  { value: "24h", label: "Délai de réponse" },
] as const;
