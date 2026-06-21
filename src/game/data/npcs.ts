/**
 * Habitants de Terreval — PNJ interactifs par zone
 */

export interface NpcDefinition {
  id: string;
  name: string;
  title: string;
  icon: string;
  dialogue: string;
}

export const NPCS: NpcDefinition[] = [
  { id: "mentor_initiation", name: "Elena Lumeveil", title: "Mentore d'initiation", icon: "✨", dialogue: "Bienvenue, Éveilleur. Ici vous apprendrez le Flux, l'Élan et les bases du combat — sans risque." },
  { id: "herboriste_jardin", name: "Théa Racineclaire", title: "Herbaliste du jardin", icon: "🌿", dialogue: "Les herbes d'éveil poussent partout ici. Récoltez-les pour vos potions et quêtes." },
  { id: "gardien_passage", name: "Varen Porteciel", title: "Gardien du passage", icon: "🚪", dialogue: "La Vallée des Éveils vous attend — quand vous aurez prouvé votre maîtrise dans ce jardin." },
  { id: "maitre_eveil", name: "Orin Valcrest", title: "Maître de l'Éveil", icon: "🧙", dialogue: "Les Cristaux t'ont choisi. Prouve ta valeur dans la Vallée." },
  { id: "marchand_debut", name: "Lia Marchéclat", title: "Marchande", icon: "🛒", dialogue: "Éclats contre provisions — commerce équitable à Terreval." },
  { id: "forgeron_vallee", name: "Dorn Forgeveine", title: "Artificier", icon: "🔨", dialogue: "Une lame bien trempée vaut dix sortilèges mal lancés." },
  { id: "banquier", name: "Sera Compteciel", title: "Gardienne des Éclats", icon: "🏦", dialogue: "Vos Éclats sont en sécurité sous le sceau de Lumina." },
  { id: "chef_guilde", name: "Commandant Helvar", title: "Chef de guilde", icon: "🏰", dialogue: "L'union des Éveilleurs protège Terreval." },
  { id: "teleporteur", name: "Nyx Portailune", title: "Voyageuse", icon: "🌀", dialogue: "Les filaments d'Aether relient toutes les régions." },
  { id: "marchand_general", name: "Pavo l'Échangeur", title: "Marchand itinérant", icon: "🎒", dialogue: "J'ai vu des reliques venues des quatre continents." },
  { id: "pretre_lumina", name: "Sœur Célia", title: "Prêtresse de Lumina", icon: "✨", dialogue: "Que la lumière des Cristaux guide vos pas." },
  { id: "alchimiste_foret", name: "Varen Distilleur", title: "Alchimiste", icon: "⚗️", dialogue: "Chaque plante de la forêt murmure une formule." },
  { id: "dresseur_compagnons", name: "Mira Compagnière", title: "Dresseuse", icon: "🐾", dialogue: "Les Wisps et dragonnets cherchent des âmes loyales." },
  { id: "marchand_umbra", name: "Keth Ombrelame", title: "Marchand d'Umbra", icon: "🌑", dialogue: "L'ombre n'est pas l'ennemi — seulement un autre visage d'Aether." },
  { id: "guide_desert", name: "Rashid Sableclair", title: "Guide du désert", icon: "🏜️", dialogue: "Le sable d'éther cache des ruines oubliées." },
  { id: "archimage_stellaire", name: "Archimage Théon", title: "Archimage stellaire", icon: "🔮", dialogue: "Les étoiles mortes parlent encore à qui sait écouter." },
  { id: "forgeron_maitre", name: "Maître Ignivar", title: "Forgeur légendaire", icon: "⚒️", dialogue: "Ma forge ne travaille que les Cristaux les plus purs." },
  { id: "maitre_arene", name: "Gladiateur Korr", title: "Maître d'arène", icon: "⚔️", dialogue: "L'arène révèle la vraie force d'un Éveilleur." },
  { id: "pecheur_brume", name: "Old Marin Brumecrabe", title: "Pêcheur des brumes", icon: "🎣", dialogue: "Les crabes d'éther goûtent la foudre, pas le sel." },
  { id: "marchand_marin", name: "Capitaine Selra", title: "Marchande marine", icon: "⚓", dialogue: "Les algues lumineuses se vendent cher à la citadelle." },
  { id: "explorateur_grotte", name: "Ewan Profondeur", title: "Explorateur", icon: "🕯️", dialogue: "Les grottes de marée respirent au rythme de la lune." },
  { id: "plongeur_ether", name: "Neris Abyssale", title: "Plongeuse d'éther", icon: "🤿", dialogue: "Sous les vagues, les perles chantent." },
  { id: "capitaine_tempete", name: "Capitaine Orage", title: "Capitaine de tempête", icon: "⛈️", dialogue: "Naviguer la tempête, c'est dompter son propre Flux." },
  { id: "oracles_marins", name: "Oracle Thalassa", title: "Oracle marine", icon: "🔱", dialogue: "La marée annonce ce que les cartes cachent." },
  { id: "forgeron_corail", name: "Coralyn Forgeécaille", title: "Forgeuse de corail", icon: "🪸", dialogue: "Le corail vivant forge des armures qui respirent." },
  { id: "nereide_heralde", name: "Héralde Néréïde", title: "Héralde des abysses", icon: "🧜", dialogue: "Les profondeurs saluent les Éveilleurs dignes." },
  { id: "guide_givre", name: "Fjorn Givrepied", title: "Guide du givre", icon: "❄️", dialogue: "Le plateau de givre ne pardonne pas l'imprudence." },
  { id: "forgeron_givre", name: "Hilda Givreforge", title: "Forgeuse du nord", icon: "🧊", dialogue: "Mes lames gardent le froid des étoiles mortes." },
  { id: "alpiniste_ether", name: "Rope Éthercime", title: "Alpiniste", icon: "🧗", dialogue: "Chaque sommet révèle un fragment d'Aether." },
  { id: "ermite_cristal", name: "Eldrin l'Ermite", title: "Ermite cristallin", icon: "💎", dialogue: "Le silence des pics affine l'Éveil intérieur." },
  { id: "gardien_glaise", name: "Gardien Morneglace", title: "Gardien des glaises", icon: "🗿", dialogue: "Je veille sur les passages gelés depuis mille hivers." },
  { id: "chroniqueur_nord", name: "Chroniqueur Boreas", title: "Chroniqueur du nord", icon: "📜", dialogue: "Chaque bataille du givre est gravée dans mes parchemins." },
  { id: "herboriste_marais", name: "Mossia Racinefange", title: "Herbaliste du marais", icon: "🌿", dialogue: "Les plantes du marais guérissent et empoisonnent." },
  { id: "guide_marais", name: "Tourbe Silencieux", title: "Guide du marais", icon: "🐸", dialogue: "Ne quittez jamais le sentier — le marais digère les imprudents." },
  { id: "marchand_flottant", name: "Bateau Marché", title: "Marchand flottant", icon: "🛶", dialogue: "Mes prix flottent comme mon embarcation." },
  { id: "sage_flottant", name: "Sage Nénuphar", title: "Sage des eaux", icon: "🪷", dialogue: "L'eau stagne mais la sagesse coule." },
  { id: "exorciste_marais", name: "Exorciste Veyra", title: "Exorciste", icon: "✝️", dialogue: "Les ombres du marais cherchent des hôtes." },
  { id: "prospecteur_cendres", name: "Cendric Prospecteur", title: "Prospecteur", icon: "⛏️", dialogue: "Sous la cendre, les veines d'éther brûlent encore." },
  { id: "refugie_volcan", name: "Ashlyn Refuge", title: "Réfugiée", icon: "🏕️", dialogue: "Ma ville a brûlé — Terreval est mon dernier espoir." },
  { id: "maitre_forge_volcan", name: "Volkan Forgebrasier", title: "Maître forgeron volcanique", icon: "🌋", dialogue: "La lave et l'éther forgent des armes sans égales." },
  { id: "apprenti_lave", name: "Ember l'Apprenti", title: "Apprenti forgeron", icon: "🔥", dialogue: "Un jour je forgerai comme mon maître." },
  { id: "oracle_cendres", name: "Oracle Pyrrha", title: "Oracle des cendres", icon: "🔥", dialogue: "La fumée révèle les destins entrelacés." },
  { id: "navigateur_stellaire", name: "Astrolabe Marin", title: "Navigateur stellaire", icon: "🧭", dialogue: "Les îles stellaires dérivent selon les constellations." },
  { id: "cartographe_iles", name: "Cartographe Élyon", title: "Cartographe", icon: "🗺️", dialogue: "Terreval n'a plus de secrets pour ceux qui cartographient tout." },
  { id: "plongeur_stellaire", name: "Stellane Abyssée", title: "Plongeuse stellaire", icon: "🌊", dialogue: "Les lagons célestes reflètent d'autres mondes." },
  { id: "astronome_lune", name: "Lunara l'Astronome", title: "Astronome", icon: "🌙", dialogue: "La lune d'Aether influence le Flux des marées magiques." },
  { id: "gardien_observatoire", name: "Gardien Zénith", title: "Gardien de l'observatoire", icon: "🔭", dialogue: "Personne n'entre sans la bénédiction des étoiles." },
];

const npcById = new Map(NPCS.map((n) => [n.id, n]));

export function getNpcById(id: string): NpcDefinition | undefined {
  return npcById.get(id);
}

export function getNpcsForZone(_zoneId: string, npcIds: string[]): NpcDefinition[] {
  return npcIds
    .map((id) => npcById.get(id))
    .filter((n): n is NpcDefinition => n !== undefined);
}
