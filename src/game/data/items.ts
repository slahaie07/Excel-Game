/**
 * Objets, équipement et ressources
 */

export type ItemType = "weapon" | "armor" | "helmet" | "boots" | "amulet" | "ring" | "consumable" | "resource" | "quest" | "pet";

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  level: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  stats?: Record<string, number>;
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
  icon: string;
}

export const ITEMS: ItemDefinition[] = [
  // Ressources
  { id: "fragment_ombre", name: "Fragment d'Ombre", description: "Morceau de cristal corrompu.", type: "resource", level: 1, rarity: "common", stackable: true, maxStack: 99, sellPrice: 5, icon: "🌑" },
  { id: "poussiere_stellaire", name: "Poussière Stellaire", description: "Poussière magique des étoiles.", type: "resource", level: 1, rarity: "uncommon", stackable: true, maxStack: 99, sellPrice: 15, icon: "✨" },
  { id: "cristal_pur", name: "Cristal Pur", description: "Cristal d'Aether non corrompu.", type: "resource", level: 20, rarity: "rare", stackable: true, maxStack: 50, sellPrice: 100, icon: "💎" },
  { id: "herbe_eveil", name: "Herbe d'Éveil", description: "Plante médicinale de la vallée.", type: "resource", level: 1, rarity: "common", stackable: true, maxStack: 99, sellPrice: 3, icon: "🌿" },

  // Armes
  { id: "epee_apprenti", name: "Épée d'Apprenti", description: "Première arme des Éveilleurs.", type: "weapon", level: 1, rarity: "common", stats: { damage: 5, strength: 2 }, stackable: false, maxStack: 1, sellPrice: 20, icon: "🗡️" },
  { id: "baton_ether", name: "Bâton d'Éther", description: "Canalise l'énergie magique.", type: "weapon", level: 5, rarity: "uncommon", stats: { damage: 8, intelligence: 5 }, stackable: false, maxStack: 1, sellPrice: 80, icon: "🪄" },
  { id: "arc_lunaire", name: "Arc Lunaire", description: "Arc imprégné de lumière lunaire.", type: "weapon", level: 10, rarity: "rare", stats: { damage: 15, agility: 8 }, stackable: false, maxStack: 1, sellPrice: 250, icon: "🏹" },
  { id: "arme_ruines", name: "Lame des Ruines", description: "Arme forgée dans les ruines anciennes.", type: "weapon", level: 10, rarity: "epic", stats: { damage: 20, strength: 10, vitality: 5 }, stackable: false, maxStack: 1, sellPrice: 500, icon: "⚔️" },

  // Armures
  { id: "tunique_debutant", name: "Tunique de Débutant", description: "Protection basique.", type: "armor", level: 1, rarity: "common", stats: { defense: 5, vitality: 3 }, stackable: false, maxStack: 1, sellPrice: 15, icon: "👕" },
  { id: "armure_lumina", name: "Armure de Lumina", description: "Armure bénie par l'Ordre.", type: "armor", level: 25, rarity: "epic", stats: { defense: 30, vitality: 15, wisdom: 5 }, stackable: false, maxStack: 1, sellPrice: 1000, icon: "🛡️" },

  // Consommables
  { id: "potion_vie", name: "Potion de Vie", description: "Restaure 50 PV.", type: "consumable", level: 1, rarity: "common", stackable: true, maxStack: 20, sellPrice: 10, icon: "🧪" },
  { id: "potion_energie", name: "Potion d'Énergie", description: "Restaure 3 PA.", type: "consumable", level: 5, rarity: "uncommon", stackable: true, maxStack: 10, sellPrice: 25, icon: "⚡" },
  { id: "pain_eveil", name: "Pain d'Éveil", description: "Restaure 20 PV. Nourriture de base.", type: "consumable", level: 1, rarity: "common", stackable: true, maxStack: 50, sellPrice: 2, icon: "🍞" },

  // Quêtes
  { id: "cristal_eveil", name: "Cristal d'Éveil", description: "Cristal obtenu lors de l'Éveil.", type: "quest", level: 1, rarity: "legendary", stackable: false, maxStack: 1, sellPrice: 0, icon: "💠" },

  // Compagnons
  { id: "pet_wisp", name: "Wisp Compagnon", description: "Petit esprit stellaire fidèle.", type: "pet", level: 5, rarity: "rare", stats: { bonusXp: 5 }, stackable: false, maxStack: 1, sellPrice: 0, icon: "👾" },
  { id: "pet_dragonnet", name: "Dragonnet d'Aether", description: "Jeune dragon stellaire de la Fête des Cristaux.", type: "pet", level: 40, rarity: "legendary", stats: { bonusXp: 10, bonusDamage: 5 }, stackable: false, maxStack: 1, sellPrice: 0, icon: "🐲" },

  // Événements saisonniers
  { id: "fleur_ether", name: "Fleur d'Éther", description: "Fleur magique de la Renaissance de Lumina.", type: "resource", level: 10, rarity: "uncommon", stackable: true, maxStack: 99, sellPrice: 25, icon: "🌸" },
  { id: "couronne_florale", name: "Couronne Florale", description: "Couronne bénie par les Fées de Brume.", type: "helmet", level: 15, rarity: "epic", stats: { defense: 12, wisdom: 8 }, stackable: false, maxStack: 1, sellPrice: 400, icon: "👑" },
  { id: "fragment_eclipse", name: "Fragment d'Éclipse", description: "Morceau d'ombre solaire cristallisée.", type: "resource", level: 25, rarity: "rare", stackable: true, maxStack: 50, sellPrice: 60, icon: "🌘" },
  { id: "amulette_solaire", name: "Amulette Solaire", description: "Amulette forgée pendant l'Éclipse d'Aether.", type: "amulet", level: 28, rarity: "epic", stats: { intelligence: 12, damage: 8 }, stackable: false, maxStack: 1, sellPrice: 600, icon: "☀️" },
  { id: "essence_ombre", name: "Essence d'Ombre", description: "Essence concentrée des Ombres Majeures.", type: "resource", level: 30, rarity: "rare", stackable: true, maxStack: 50, sellPrice: 80, icon: "👿" },
  { id: "cape_umbra", name: "Cape d'Umbra", description: "Cape tissée dans les ténèbres du désert.", type: "armor", level: 35, rarity: "epic", stats: { defense: 22, agility: 10 }, stackable: false, maxStack: 1, sellPrice: 900, icon: "🧥" },
  { id: "flocon_stellaire", name: "Flocon Stellaire", description: "Flocon magique tombé pendant la Fête des Cristaux.", type: "resource", level: 20, rarity: "uncommon", stackable: true, maxStack: 99, sellPrice: 30, icon: "❄️" },
  { id: "armure_givre", name: "Armure de Givre", description: "Armure cristalline de l'hiver stellaire.", type: "armor", level: 40, rarity: "legendary", stats: { defense: 35, vitality: 20 }, stackable: false, maxStack: 1, sellPrice: 1200, icon: "🧊" },

  // Loot monstres (références manquantes v2.1)
  { id: "fourrure_cristal", name: "Fourrure de Cristal", description: "Pelage durci par les cristaux.", type: "resource", level: 5, rarity: "common", stackable: true, maxStack: 99, sellPrice: 12, icon: "🐺" },
  { id: "ecorce_lumina", name: "Écorce de Lumina", description: "Écorce magique des tréants.", type: "resource", level: 12, rarity: "common", stackable: true, maxStack: 99, sellPrice: 18, icon: "🌳" },
  { id: "aile_fee", name: "Aile de Fée", description: "Aile diaphane d'une fée de brume.", type: "resource", level: 15, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 35, icon: "🧚" },
  { id: "venin_ether", name: "Venin d'Éther", description: "Venin concentré de scorpion.", type: "resource", level: 28, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 45, icon: "☠️" },
  { id: "amulette_umbra", name: "Amulette d'Umbra", description: "Amulette des ombres du désert.", type: "amulet", level: 40, rarity: "epic", stats: { intelligence: 15, wisdom: 10 }, stackable: false, maxStack: 1, sellPrice: 800, icon: "🔮" },
  { id: "parchemin_ancien", name: "Parchemin Ancien", description: "Texte oublié du Sphinx.", type: "resource", level: 40, rarity: "rare", stackable: true, maxStack: 20, sellPrice: 120, icon: "📜" },
  { id: "noyau_stellaire", name: "Noyau Stellaire", description: "Cœur cristallin d'un golem.", type: "resource", level: 45, rarity: "rare", stackable: true, maxStack: 30, sellPrice: 150, icon: "💠" },
  { id: "ecaille_dragon", name: "Écaille de Dragon", description: "Écaille du Dragon d'Aether.", type: "resource", level: 60, rarity: "legendary", stackable: true, maxStack: 10, sellPrice: 500, icon: "🐉" },
  { id: "couronne_aether", name: "Couronne d'Aether", description: "Couronne légendaire du dragon.", type: "helmet", level: 60, rarity: "legendary", stats: { defense: 40, intelligence: 20, wisdom: 15 }, stackable: false, maxStack: 1, sellPrice: 5000, icon: "👑" },
  { id: "minerai_cuivre", name: "Minerai de Cuivre", description: "Minerai basique des filons.", type: "resource", level: 1, rarity: "common", stackable: true, maxStack: 99, sellPrice: 4, icon: "🪨" },
  { id: "bois_lumina", name: "Bois de Lumina", description: "Bois enchanté de la forêt.", type: "resource", level: 10, rarity: "common", stackable: true, maxStack: 99, sellPrice: 8, icon: "🪵" },
  { id: "fleur_moonlight", name: "Fleur de Moonlight", description: "Fleur lumineuse nocturne.", type: "resource", level: 12, rarity: "uncommon", stackable: true, maxStack: 99, sellPrice: 20, icon: "🌙" },
  { id: "sable_ether", name: "Sable d'Éther", description: "Sable imprégné d'énergie.", type: "resource", level: 25, rarity: "common", stackable: true, maxStack: 99, sellPrice: 10, icon: "🏜️" },
  { id: "cactus_ombre", name: "Cactus d'Ombre", description: "Plante du désert d'Umbra.", type: "resource", level: 28, rarity: "common", stackable: true, maxStack: 99, sellPrice: 12, icon: "🌵" },
  { id: "ether_condense", name: "Éther Condensé", description: "Éther purifié de la citadelle.", type: "resource", level: 45, rarity: "rare", stackable: true, maxStack: 50, sellPrice: 90, icon: "✧" },
  { id: "amulette_eveil", name: "Amulette d'Éveil", description: "Bijou forgé par un joaillier.", type: "amulet", level: 10, rarity: "uncommon", stats: { wisdom: 8, vitality: 5 }, stackable: false, maxStack: 1, sellPrice: 150, icon: "📿" },
  { id: "ecaille_draconique", name: "Écaille Draconique", description: "Trophée du Sanctuaire Draconique.", type: "resource", level: 50, rarity: "epic", stackable: true, maxStack: 20, sellPrice: 300, icon: "🐲" },
  { id: "fragment_fractal", name: "Fragment Fractal", description: "Éclat de l'Abîme Fractal.", type: "resource", level: 40, rarity: "rare", stackable: true, maxStack: 30, sellPrice: 180, icon: "🔷" },
  { id: "coeur_nexus", name: "Cœur du Nexus", description: "Essence du raid Nexus.", type: "resource", level: 58, rarity: "legendary", stackable: true, maxStack: 5, sellPrice: 1000, icon: "❤️‍🔥" },

  // Archipel de Brume (v2.2)
  { id: "algue_lumineuse", name: "Algue Lumineuse", description: "Algue des côtes de brume.", type: "resource", level: 12, rarity: "common", stackable: true, maxStack: 99, sellPrice: 6, icon: "🌿" },
  { id: "coquille_perle", name: "Coquille Perlière", description: "Coquille aux reflets stellaires.", type: "resource", level: 14, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 22, icon: "🐚" },
  { id: "corail_vivant", name: "Corail Vivant", description: "Corail récolté dans les grottes.", type: "resource", level: 20, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 28, icon: "🪸" },
  { id: "nacre_stellaire", name: "Nacre Stellaire", description: "Nacre irisée des abysses peu profonds.", type: "resource", level: 22, rarity: "rare", stackable: true, maxStack: 40, sellPrice: 40, icon: "✨" },
  { id: "perle_abysse", name: "Perle d'Abysse", description: "Perle des profondeurs.", type: "resource", level: 28, rarity: "rare", stackable: true, maxStack: 30, sellPrice: 55, icon: "⚪" },
  { id: "ecaille_requin", name: "Écaille de Requin", description: "Écaille tranchante.", type: "resource", level: 30, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 35, icon: "🦈" },
  { id: "encre_ombre", name: "Encre d'Ombre", description: "Encre de pieuvre corrompue.", type: "resource", level: 32, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 38, icon: "🖤" },
  { id: "essence_tempete", name: "Essence de Tempête", description: "Énergie des vents stellaires.", type: "resource", level: 38, rarity: "rare", stackable: true, maxStack: 40, sellPrice: 65, icon: "⛈️" },
  { id: "plume_stellaire", name: "Plume Stellaire", description: "Plume d'harpie des tempêtes.", type: "resource", level: 40, rarity: "rare", stackable: true, maxStack: 30, sellPrice: 70, icon: "🪶" },
  { id: "cristal_corail", name: "Cristal de Corail", description: "Cristal du sanctuaire marin.", type: "resource", level: 48, rarity: "epic", stackable: true, maxStack: 25, sellPrice: 110, icon: "💎" },
  { id: "larme_nereide", name: "Larme de Néréide", description: "Larme cristallisée des abysses.", type: "resource", level: 58, rarity: "epic", stackable: true, maxStack: 20, sellPrice: 200, icon: "💧" },
  { id: "armure_corail", name: "Armure de Corail", description: "Armure vivante des marins.", type: "armor", level: 52, rarity: "epic", stats: { defense: 32, vitality: 18 }, stackable: false, maxStack: 1, sellPrice: 1400, icon: "🛡️" },
  { id: "cape_tempete", name: "Cape de la Tempête", description: "Cape du seigneur des vents.", type: "armor", level: 42, rarity: "epic", stats: { defense: 24, agility: 15 }, stackable: false, maxStack: 1, sellPrice: 1100, icon: "🧥" },
  { id: "trident_nereide", name: "Trident des Néréides", description: "Arme légendaire des abysses.", type: "weapon", level: 55, rarity: "legendary", stats: { damage: 45, intelligence: 15, agility: 10 }, stackable: false, maxStack: 1, sellPrice: 3000, icon: "🔱" },
  { id: "bottes_maree", name: "Bottes de Marée", description: "Bottes enchantées pour les marins.", type: "boots", level: 25, rarity: "rare", stats: { defense: 10, agility: 8 }, stackable: false, maxStack: 1, sellPrice: 350, icon: "👢" },
  { id: "anneau_tempete", name: "Anneau de Tempête", description: "Anneau chargé d'électricité.", type: "ring", level: 38, rarity: "epic", stats: { intelligence: 12, chance: 8 }, stackable: false, maxStack: 1, sellPrice: 600, icon: "💍" },
  { id: "relique_temple", name: "Relique du Temple", description: "Relique du temple oublié.", type: "quest", level: 18, rarity: "rare", stackable: false, maxStack: 1, sellPrice: 0, icon: "🏺" },
  { id: "carapace_royale", name: "Carapace Royale", description: "Carapace du scorpion royal.", type: "resource", level: 35, rarity: "epic", stackable: true, maxStack: 10, sellPrice: 250, icon: "🦂" },
  { id: "carte_tresor", name: "Carte au Trésor", description: "Carte de l'épave brumeuse.", type: "quest", level: 16, rarity: "uncommon", stackable: false, maxStack: 1, sellPrice: 0, icon: "🗺️" },
  { id: "ecaille_leviathan", name: "Écaille de Léviathan", description: "Écaille du seigneur des abysses.", type: "resource", level: 85, rarity: "legendary", stackable: true, maxStack: 5, sellPrice: 2000, icon: "🐋" },
  { id: "couronne_marine", name: "Couronne Marine", description: "Couronne du Léviathan de Brume.", type: "helmet", level: 85, rarity: "legendary", stats: { defense: 50, wisdom: 25, vitality: 20 }, stackable: false, maxStack: 1, sellPrice: 8000, icon: "👑" },
  { id: "potion_abysse", name: "Potion des Abysses", description: "Restaure 150 PV.", type: "consumable", level: 30, rarity: "rare", stackable: true, maxStack: 15, sellPrice: 50, icon: "🧪" },

  // Loot donjons v2.4
  { id: "cristal_caverne", name: "Cristal de Caverne", description: "Cristal des grottes de la vallée.", type: "resource", level: 8, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 30, icon: "💎" },
  { id: "minerai_ombre", name: "Minerai d'Ombre", description: "Minerai corrompu des mines abandonnées.", type: "resource", level: 11, rarity: "uncommon", stackable: true, maxStack: 50, sellPrice: 35, icon: "⛏️" },
  { id: "coeur_treant", name: "Cœur de Tréant", description: "Noyau vivant d'un tréant maudit.", type: "resource", level: 14, rarity: "rare", stackable: true, maxStack: 20, sellPrice: 80, icon: "🌳" },
  { id: "couronne_brume", name: "Couronne de Brume", description: "Couronne de la reine des fées.", type: "helmet", level: 18, rarity: "epic", stats: { defense: 14, wisdom: 10 }, stackable: false, maxStack: 1, sellPrice: 450, icon: "👑" },
  { id: "essence_wisp", name: "Essence de Wisp", description: "Essence d'un esprit ancien.", type: "resource", level: 12, rarity: "rare", stackable: true, maxStack: 30, sellPrice: 55, icon: "✨" },
  { id: "relique_mirage", name: "Relique du Mirage", description: "Artefact de l'oasis illusoire.", type: "amulet", level: 30, rarity: "epic", stats: { intelligence: 14, chance: 10 }, stackable: false, maxStack: 1, sellPrice: 700, icon: "🏜️" },
  { id: "phylactere_umbra", name: "Phylactère d'Umbra", description: "Réceptacle d'âme du lich.", type: "resource", level: 34, rarity: "legendary", stackable: true, maxStack: 5, sellPrice: 400, icon: "💀" },
  { id: "lentille_void", name: "Lentille du Vide", description: "Lentille de l'observatoire stellaire.", type: "resource", level: 48, rarity: "epic", stackable: true, maxStack: 10, sellPrice: 280, icon: "🔭" },
  { id: "lame_forge_eternelle", name: "Lame de la Forge Éternelle", description: "Arme forgée par le golem forgeard.", type: "weapon", level: 54, rarity: "legendary", stats: { damage: 50, strength: 18 }, stackable: false, maxStack: 1, sellPrice: 2500, icon: "⚔️" },
  { id: "lentille_phare", name: "Lentille du Phare", description: "Cristal du gardien du phare.", type: "resource", level: 15, rarity: "uncommon", stackable: true, maxStack: 30, sellPrice: 40, icon: "🗼" },
  { id: "sabre_corsaire", name: "Sabre du Corsaire", description: "Lame du spectre corsaire.", type: "weapon", level: 20, rarity: "rare", stats: { damage: 22, agility: 10 }, stackable: false, maxStack: 1, sellPrice: 320, icon: "🏴‍☠️" },
  { id: "nacre_matriarche", name: "Nacre de Matriarche", description: "Nacre de la reine des marées.", type: "resource", level: 22, rarity: "rare", stackable: true, maxStack: 25, sellPrice: 65, icon: "🐚" },
  { id: "tentacule_kraken", name: "Tentacule de Kraken", description: "Trophée du kraken juvénile.", type: "resource", level: 28, rarity: "rare", stackable: true, maxStack: 20, sellPrice: 90, icon: "🦑" },
  { id: "dent_alpha", name: "Dent d'Alpha", description: "Dent du requin dominant.", type: "resource", level: 32, rarity: "epic", stackable: true, maxStack: 15, sellPrice: 120, icon: "🦈" },
  { id: "noyau_tempete", name: "Noyau de Tempête", description: "Cœur du colosse des vents.", type: "resource", level: 38, rarity: "epic", stackable: true, maxStack: 15, sellPrice: 150, icon: "⛈️" },
  { id: "parchemin_prophetie", name: "Parchemin de Prophétie", description: "Vision du prophète marin.", type: "resource", level: 46, rarity: "legendary", stackable: true, maxStack: 5, sellPrice: 350, icon: "📜" },
  { id: "fragment_faille", name: "Fragment de Faille", description: "Éclat dimensionnel des abysses.", type: "resource", level: 65, rarity: "legendary", stackable: true, maxStack: 5, sellPrice: 800, icon: "🌀" },
];

export const EQUIPMENT_SLOTS = ["weapon", "armor", "helmet", "boots", "amulet", "ring"] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export function getItemById(id: string): ItemDefinition | undefined {
  return ITEMS.find((i) => i.id === id);
}
