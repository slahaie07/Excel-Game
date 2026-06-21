/**
 * v4.0 — Points d'intérêt sur la carte de Terreval
 */

export type POIType = "teleporter" | "landmark" | "treasure" | "lore" | "vendor" | "dungeon";

export interface MapPOIDefinition {
  id: string;
  zoneId: string;
  type: POIType;
  name: string;
  description: string;
  icon: string;
  /** Position relative sur le nœud de zone (0–100) */
  mapOffsetX: number;
  mapOffsetY: number;
}

const POI_ICONS: Record<POIType, string> = {
  teleporter: "🌀",
  landmark: "📍",
  treasure: "💎",
  lore: "📜",
  vendor: "🏪",
  dungeon: "🚪",
};

interface POISeed {
  zoneId: string;
  type: POIType;
  name: string;
  description: string;
  mapOffsetX: number;
  mapOffsetY: number;
}

const POI_SEEDS: POISeed[] = [
  // Cœur
  { zoneId: "vallee_eveils", type: "landmark", name: "Cristal Ancestral", description: "Lieu de l'Éveil originel.", mapOffsetX: 50, mapOffsetY: 40 },
  { zoneId: "vallee_eveils", type: "vendor", name: "Échoppe du Débutant", description: "Équipement de base.", mapOffsetX: 30, mapOffsetY: 60 },
  { zoneId: "port_nebula", type: "teleporter", name: "Hub de Téléportation", description: "Relie les grandes villes.", mapOffsetX: 55, mapOffsetY: 50 },
  { zoneId: "port_nebula", type: "vendor", name: "Marché Général", description: "Ressources et consommables.", mapOffsetX: 40, mapOffsetY: 45 },
  { zoneId: "foret_lumina", type: "lore", name: "Autel de l'Ordre", description: "Histoire de Lumina gravée dans la pierre.", mapOffsetX: 60, mapOffsetY: 35 },
  { zoneId: "foret_lumina", type: "dungeon", name: "Entrée du Sanctuaire", description: "Donjon sacré corrompu.", mapOffsetX: 70, mapOffsetY: 55 },
  { zoneId: "desert_umbra", type: "landmark", name: "Pyramide d'Umbra", description: "Monument du Conclave.", mapOffsetX: 45, mapOffsetY: 50 },
  { zoneId: "desert_umbra", type: "treasure", name: "Oasis Mirage", description: "Trésor enfoui sous les dunes.", mapOffsetX: 65, mapOffsetY: 70 },
  { zoneId: "citadelle_stellaire", type: "teleporter", name: "Portail Stellaire", description: "Accès rapide aux régions endgame.", mapOffsetX: 50, mapOffsetY: 30 },
  { zoneId: "citadelle_stellaire", type: "dungeon", name: "Nexus d'Aether", description: "Entrée du raid ultime.", mapOffsetX: 50, mapOffsetY: 60 },
  { zoneId: "arene_pvp", type: "landmark", name: "Arène Centrale", description: "Combats classés.", mapOffsetX: 50, mapOffsetY: 50 },
  // Archipel
  { zoneId: "cotes_brume", type: "landmark", name: "Phare de Brume", description: "Guide les marins perdus.", mapOffsetX: 35, mapOffsetY: 40 },
  { zoneId: "cotes_brume", type: "treasure", name: "Épave Brumeuse", description: "Carte au trésor des corsaires.", mapOffsetX: 60, mapOffsetY: 65 },
  { zoneId: "grottes_maree", type: "dungeon", name: "Grotte de Marée", description: "Cavernes inondées périodiquement.", mapOffsetX: 45, mapOffsetY: 55 },
  { zoneId: "recif_abyssal", type: "landmark", name: "Barrière de Corail", description: "Frontière des eaux profondes.", mapOffsetX: 50, mapOffsetY: 45 },
  { zoneId: "ile_tempete", type: "landmark", name: "Pic des Vents", description: "Sommet battu par la tempête.", mapOffsetX: 55, mapOffsetY: 25 },
  { zoneId: "sanctuaire_marins", type: "lore", name: "Autel des Navigateurs", description: "Prophéties marines gravées.", mapOffsetX: 40, mapOffsetY: 50 },
  { zoneId: "profondeurs_nereides", type: "dungeon", name: "Antre du Léviathan", description: "Boss des abysses.", mapOffsetX: 50, mapOffsetY: 70 },
  // Givre
  { zoneId: "plateau_givre", type: "landmark", name: "Statue du Gardien de Givre", description: "Monument aux explorateurs du nord.", mapOffsetX: 48, mapOffsetY: 42 },
  { zoneId: "plateau_givre", type: "vendor", name: "Campement des Alpinistes", description: "Fournitures pour le froid.", mapOffsetX: 62, mapOffsetY: 58 },
  { zoneId: "monts_cristallins", type: "treasure", name: "Gisement Cristallin", description: "Minerai stellaire à ciel ouvert.", mapOffsetX: 55, mapOffsetY: 35 },
  { zoneId: "monts_cristallins", type: "dungeon", name: "Pic Translucide", description: "Ascension vers le sommet.", mapOffsetX: 70, mapOffsetY: 20 },
  { zoneId: "glaise_nord", type: "lore", name: "Chroniques du Nord", description: "Tablettes gelées des premiers Éveilleurs.", mapOffsetX: 38, mapOffsetY: 48 },
  { zoneId: "glaise_nord", type: "dungeon", name: "Antre du Dragon de Givre", description: "Boss de la toundra.", mapOffsetX: 58, mapOffsetY: 62 },
  // Marais
  { zoneId: "marais_ether", type: "landmark", name: "Pont de Mousse", description: "Passerelle vivante entre les îlots.", mapOffsetX: 50, mapOffsetY: 50 },
  { zoneId: "marais_ether", type: "vendor", name: "Herboriste des Marais", description: "Plantes rares et antidotes.", mapOffsetX: 30, mapOffsetY: 65 },
  { zoneId: "cite_flottante", type: "teleporter", name: "Ascenseur d'Éther", description: "Monte entre les plateformes flottantes.", mapOffsetX: 50, mapOffsetY: 40 },
  { zoneId: "cite_flottante", type: "lore", name: "Bibliothèque Suspendue", description: "Savoir des architectes stellaires.", mapOffsetX: 65, mapOffsetY: 55 },
  { zoneId: "catacombes_humides", type: "dungeon", name: "Crypte Humide", description: "Catacombes infestées de morts-vivants.", mapOffsetX: 45, mapOffsetY: 60 },
  { zoneId: "catacombes_humides", type: "treasure", name: "Sarcophage Oublié", description: "Reliques des prêtres engloutis.", mapOffsetX: 72, mapOffsetY: 38 },
  // Cendres
  { zoneId: "vallee_cendres", type: "landmark", name: "Cratère Fumant", description: "Vue sur la cordillère active.", mapOffsetX: 52, mapOffsetY: 44 },
  { zoneId: "vallee_cendres", type: "vendor", name: "Refuge des Prospecteurs", description: "Équipement résistant à la chaleur.", mapOffsetX: 35, mapOffsetY: 58 },
  { zoneId: "forge_volcanique", type: "dungeon", name: "Fournaise Ancienne", description: "Forge alimentée par le magma.", mapOffsetX: 50, mapOffsetY: 55 },
  { zoneId: "forge_volcanique", type: "landmark", name: "Enclume du Titan", description: "Légende des forgerons primordiaux.", mapOffsetX: 68, mapOffsetY: 42 },
  { zoneId: "chambre_magma", type: "dungeon", name: "Trône du Magma", description: "Sanctuaire du Titan de Cendre.", mapOffsetX: 50, mapOffsetY: 65 },
  { zoneId: "chambre_magma", type: "teleporter", name: "Passage Bipolaire", description: "Relie le nord glacial et les abysses.", mapOffsetX: 25, mapOffsetY: 30 },
  // Stellaire
  { zoneId: "iles_stellaires", type: "landmark", name: "Portail des Îles", description: "Première étape vers le ciel.", mapOffsetX: 50, mapOffsetY: 45 },
  { zoneId: "iles_stellaires", type: "lore", name: "Carte Céleste", description: "Constellations gravées par les navigateurs.", mapOffsetX: 65, mapOffsetY: 60 },
  { zoneId: "atoll_nebula", type: "treasure", name: "Lagoon Stellaire", description: "Perles cachées dans les coraux.", mapOffsetX: 42, mapOffsetY: 52 },
  { zoneId: "atoll_nebula", type: "dungeon", name: "Grotte de l'Atoll", description: "Caverne sous-marine céleste.", mapOffsetX: 58, mapOffsetY: 68 },
  { zoneId: "observatoire_lune", type: "landmark", name: "Dôme Lunaire", description: "Point culminant des Îles Stellaires.", mapOffsetX: 50, mapOffsetY: 30 },
  { zoneId: "observatoire_lune", type: "teleporter", name: "Lentille de la Lune", description: "Téléportation vers la Citadelle.", mapOffsetX: 40, mapOffsetY: 55 },
];

export const MAP_POIS: MapPOIDefinition[] = POI_SEEDS.map((seed, index) => ({
  id: `poi_${seed.zoneId}_${index}`,
  zoneId: seed.zoneId,
  type: seed.type,
  name: seed.name,
  description: seed.description,
  icon: POI_ICONS[seed.type],
  mapOffsetX: seed.mapOffsetX,
  mapOffsetY: seed.mapOffsetY,
}));

export function getPOIsForZone(zoneId: string): MapPOIDefinition[] {
  return MAP_POIS.filter((p) => p.zoneId === zoneId);
}

export function getPOIById(id: string): MapPOIDefinition | undefined {
  return MAP_POIS.find((p) => p.id === id);
}

export function countPOIsByType(zoneId: string): Partial<Record<POIType, number>> {
  const pois = getPOIsForZone(zoneId);
  const counts: Partial<Record<POIType, number>> = {};
  for (const poi of pois) {
    counts[poi.type] = (counts[poi.type] ?? 0) + 1;
  }
  return counts;
}
