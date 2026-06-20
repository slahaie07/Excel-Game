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
];

export const EQUIPMENT_SLOTS = ["weapon", "armor", "helmet", "boots", "amulet", "ring"] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export function getItemById(id: string): ItemDefinition | undefined {
  return ITEMS.find((i) => i.id === id);
}
