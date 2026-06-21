/**
 * v2.6 + v3.0 — 40 donjons additionnels (30 → 70) et boss associés
 */

import type { DungeonDefinition } from "./dungeons";
import type { MonsterDefinition } from "./monsters";

interface DungeonSeed {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  levelRequired: number;
  rooms: number;
  icon: string;
  mobs: string[];
  lootItemId?: string;
}

const ZONE_MOBS = {
  vallee_eveils: ["graine_ombre", "wisp_sauvage", "loup_cristal"],
  foret_lumina: ["treant_corrompu", "fee_brume"],
  port_nebula: ["wisp_sauvage", "graine_ombre", "loup_cristal"],
  desert_umbra: ["scorpion_ether"],
  citadelle_stellaire: ["golem_stellaire"],
  arene_pvp: ["golem_stellaire", "champion_lumina"],
  cotes_brume: ["meduse_brume", "crabe_ether"],
  grottes_maree: ["crab_golem", "sanglier_marin", "lampe_abyssale"],
  recif_abyssal: ["requin_ether", "pieuvre_ombre"],
  ile_tempete: ["elemental_tempete", "harpy_stellaire"],
  sanctuaire_marins: ["pretre_corail", "gardien_marin"],
  profondeurs_nereides: ["nereide_guerriere", "pieuvre_ombre"],
} as const satisfies Record<string, readonly string[]>;

type ZoneId = keyof typeof ZONE_MOBS;

function zoneMobs(zoneId: ZoneId): string[] {
  return [...ZONE_MOBS[zoneId]];
}

const DUNGEON_SEEDS: DungeonSeed[] = [
  { id: "grotte_initiale", name: "Grotte Initiale", description: "Première caverne des Éveilleurs.", zoneId: "vallee_eveils", levelRequired: 8, rooms: 4, icon: "🕳️", mobs: zoneMobs("vallee_eveils"), lootItemId: "cristal_caverne" },
  { id: "puits_ether", name: "Puits d'Éther", description: "Puits ancien aux vapeurs cristallines.", zoneId: "vallee_eveils", levelRequired: 10, rooms: 5, icon: "🪣", mobs: zoneMobs("vallee_eveils"), lootItemId: "poussiere_stellaire" },
  { id: "relicaire_vallee", name: "Reliquaire de la Vallée", description: "Sanctuaire oublié des premiers Éveilleurs.", zoneId: "vallee_eveils", levelRequired: 14, rooms: 6, icon: "🏺", mobs: zoneMobs("vallee_eveils"), lootItemId: "cristal_eveil" },
  { id: "antre_treant", name: "Antre du Tréant", description: "Cœur putréfié de la forêt.", zoneId: "foret_lumina", levelRequired: 16, rooms: 6, icon: "🌳", mobs: zoneMobs("foret_lumina"), lootItemId: "coeur_treant" },
  { id: "autel_lumina", name: "Autel de Lumina", description: "Autel dégradé de l'Ordre.", zoneId: "foret_lumina", levelRequired: 21, rooms: 7, icon: "⛪", mobs: zoneMobs("foret_lumina"), lootItemId: "relique_temple" },
  { id: "labyrinthe_racines", name: "Labyrinthe de Racines", description: "Réseau souterrain de racines vivantes.", zoneId: "foret_lumina", levelRequired: 23, rooms: 8, icon: "🪵", mobs: zoneMobs("foret_lumina") },
  { id: "cale_sombre", name: "Cale Sombre", description: "Entrepôt clandestin du port.", zoneId: "port_nebula", levelRequired: 17, rooms: 5, icon: "📦", mobs: zoneMobs("port_nebula") },
  { id: "repaire_contrabandiers", name: "Repaire des Contrabandiers", description: "Cachette des marchands d'ombre.", zoneId: "port_nebula", levelRequired: 22, rooms: 6, icon: "🏴‍☠️", mobs: zoneMobs("port_nebula"), lootItemId: "sabre_corsaire" },
  { id: "tombeau_pharaon", name: "Tombeau du Pharaon", description: "Sépulcre stellaire sous les dunes.", zoneId: "desert_umbra", levelRequired: 27, rooms: 7, icon: "⚰️", mobs: zoneMobs("desert_umbra"), lootItemId: "parchemin_ancien" },
  { id: "arene_scorpions", name: "Arène des Scorpions", description: "Fosse aux scorpions d'éther.", zoneId: "desert_umbra", levelRequired: 29, rooms: 7, icon: "🦂", mobs: zoneMobs("desert_umbra") },
  { id: "canyon_umbra", name: "Canyon d'Umbra", description: "Gorge tranchée par les tempêtes de sable.", zoneId: "desert_umbra", levelRequired: 31, rooms: 8, icon: "🏜️", mobs: zoneMobs("desert_umbra") },
  { id: "temple_sable", name: "Temple de Sable", description: "Temple englouti par les dunes.", zoneId: "desert_umbra", levelRequired: 33, rooms: 8, icon: "🔺", mobs: zoneMobs("desert_umbra"), lootItemId: "relique_mirage" },
  { id: "grotte_algues", name: "Grotte aux Algues", description: "Grotte côtière bioluminescente.", zoneId: "cotes_brume", levelRequired: 15, rooms: 5, icon: "🌿", mobs: zoneMobs("cotes_brume"), lootItemId: "algue_lumineuse" },
  { id: "nef_brume", name: "Nef de Brume", description: "Coque spectrale échouée.", zoneId: "cotes_brume", levelRequired: 18, rooms: 6, icon: "🚢", mobs: zoneMobs("cotes_brume") },
  { id: "ancrier_maudit", name: "Ancrier Maudit", description: "Ancre géante corrompue par l'éther.", zoneId: "cotes_brume", levelRequired: 21, rooms: 6, icon: "⚓", mobs: zoneMobs("cotes_brume"), lootItemId: "lentille_phare" },
  { id: "tunnel_crabes", name: "Tunnel des Crabes", description: "Passage grouillant de crustacés.", zoneId: "grottes_maree", levelRequired: 19, rooms: 6, icon: "🦀", mobs: zoneMobs("grottes_maree") },
  { id: "grotte_perles", name: "Grotte aux Perles", description: "Grotte scintillante de nacre.", zoneId: "grottes_maree", levelRequired: 24, rooms: 7, icon: "⚪", mobs: zoneMobs("grottes_maree"), lootItemId: "nacre_matriarche" },
  { id: "champ_corail", name: "Champ de Corail", description: "Forêt sous-marine de corail vivant.", zoneId: "grottes_maree", levelRequired: 27, rooms: 7, icon: "🪸", mobs: zoneMobs("grottes_maree"), lootItemId: "corail_vivant" },
  { id: "canyon_marin", name: "Canyon Marin", description: "Ravin sous-marin aux courants violents.", zoneId: "recif_abyssal", levelRequired: 29, rooms: 7, icon: "🌊", mobs: zoneMobs("recif_abyssal") },
  { id: "fosse_engoutie", name: "Fosse Engloutie", description: "Abîme peuplé de prédateurs.", zoneId: "recif_abyssal", levelRequired: 34, rooms: 8, icon: "🕳️", mobs: zoneMobs("recif_abyssal"), lootItemId: "dent_alpha" },
  { id: "barriere_corail", name: "Barrière de Corail", description: "Récif défensif naturel.", zoneId: "recif_abyssal", levelRequired: 37, rooms: 8, icon: "🛡️", mobs: zoneMobs("recif_abyssal") },
  { id: "nid_harpies", name: "Nid des Harpies", description: "Perchoir aérien des harpies stellaires.", zoneId: "ile_tempete", levelRequired: 34, rooms: 8, icon: "🦅", mobs: zoneMobs("ile_tempete") },
  { id: "falaise_orage", name: "Falaise d'Orage", description: "Falaise battue par la foudre.", zoneId: "ile_tempete", levelRequired: 39, rooms: 8, icon: "⛈️", mobs: zoneMobs("ile_tempete"), lootItemId: "noyau_tempete" },
  { id: "autel_vent", name: "Autel du Vent", description: "Autel des élémentaires de tempête.", zoneId: "ile_tempete", levelRequired: 41, rooms: 9, icon: "🌪️", mobs: zoneMobs("ile_tempete") },
  { id: "salle_astrale", name: "Salle Astrale", description: "Chambre des constellations mortes.", zoneId: "citadelle_stellaire", levelRequired: 43, rooms: 8, icon: "✨", mobs: zoneMobs("citadelle_stellaire"), lootItemId: "noyau_stellaire" },
  { id: "prison_ether", name: "Prison d'Éther", description: "Geôle magique de la citadelle.", zoneId: "citadelle_stellaire", levelRequired: 47, rooms: 9, icon: "⛓️", mobs: zoneMobs("citadelle_stellaire") },
  { id: "bibliotheque_void", name: "Bibliothèque du Vide", description: "Archives interdites des archimages.", zoneId: "citadelle_stellaire", levelRequired: 49, rooms: 9, icon: "📚", mobs: zoneMobs("citadelle_stellaire"), lootItemId: "lentille_void" },
  { id: "tour_souffle", name: "Tour du Souffle", description: "Tour où souffle l'éther pur.", zoneId: "citadelle_stellaire", levelRequired: 51, rooms: 10, icon: "🗼", mobs: zoneMobs("citadelle_stellaire") },
  { id: "sanctum_dragon", name: "Sanctum du Dragon", description: "Antichambre du dragon d'Aether.", zoneId: "citadelle_stellaire", levelRequired: 58, rooms: 10, icon: "🐉", mobs: zoneMobs("citadelle_stellaire"), lootItemId: "ecaille_dragon" },
  { id: "chapelle_engoutie", name: "Chapelle Engloutie", description: "Lieu de culte sous les flots.", zoneId: "sanctuaire_marins", levelRequired: 42, rooms: 8, icon: "🙏", mobs: zoneMobs("sanctuaire_marins") },
  { id: "crypte_corail", name: "Crypte de Corail", description: "Catacombes de coquillages vivants.", zoneId: "sanctuaire_marins", levelRequired: 48, rooms: 9, icon: "🐚", mobs: zoneMobs("sanctuaire_marins"), lootItemId: "cristal_corail" },
  { id: "autel_marins", name: "Autel des Marins", description: "Autel des navigateurs d'éther.", zoneId: "sanctuaire_marins", levelRequired: 53, rooms: 10, icon: "🔱", mobs: zoneMobs("sanctuaire_marins"), lootItemId: "trident_nereide" },
  { id: "passe_nereide", name: "Passe des Néréides", description: "Détroit gardé par les guerrières des mers.", zoneId: "profondeurs_nereides", levelRequired: 55, rooms: 9, icon: "🧜‍♀️", mobs: zoneMobs("profondeurs_nereides") },
  { id: "trone_abyssal", name: "Trône Abyssal", description: "Salle du trône sous les abysses.", zoneId: "profondeurs_nereides", levelRequired: 68, rooms: 11, icon: "👑", mobs: zoneMobs("profondeurs_nereides"), lootItemId: "larme_nereide" },
  { id: "cite_engoutie", name: "Cité Engloutie", description: "Ruines d'une cité stellaire sous l'eau.", zoneId: "profondeurs_nereides", levelRequired: 72, rooms: 11, icon: "🏛️", mobs: zoneMobs("profondeurs_nereides") },
  { id: "portail_leviathan", name: "Portail du Léviathan", description: "Porte dimensionnelle vers l'antre final.", zoneId: "profondeurs_nereides", levelRequired: 78, rooms: 12, icon: "🌀", mobs: zoneMobs("profondeurs_nereides"), lootItemId: "fragment_faille" },
  { id: "salle_legende", name: "Salle des Légendes", description: "Arène des combattants légendaires.", zoneId: "arene_pvp", levelRequired: 35, rooms: 6, icon: "🏆", mobs: zoneMobs("arene_pvp") },
  { id: "fosse_champions", name: "Fosse des Champions", description: "Défi ultime des Éveilleurs.", zoneId: "arene_pvp", levelRequired: 50, rooms: 8, icon: "⚔️", mobs: zoneMobs("arene_pvp"), lootItemId: "coeur_nexus" },
  { id: "nexus_profond", name: "Nexus Profond", description: "Extension abyssale du Nexus d'Aether.", zoneId: "profondeurs_nereides", levelRequired: 88, rooms: 13, icon: "💠", mobs: zoneMobs("profondeurs_nereides"), lootItemId: "ecaille_leviathan" },
  { id: "couronne_ether", name: "Couronne d'Éther", description: "Sanctuaire final — niveau 95 requis.", zoneId: "citadelle_stellaire", levelRequired: 95, rooms: 14, icon: "👑", mobs: zoneMobs("citadelle_stellaire"), lootItemId: "couronne_aether" },
];

function bossIdFor(seed: DungeonSeed): string {
  return `boss_${seed.id}`;
}

function bossStats(level: number) {
  return {
    hp: 200 + level * 28,
    ap: 8 + Math.floor(level / 12),
    mp: 4 + Math.floor(level / 25),
    damage: Math.round(14 + level * 0.85),
    defense: Math.round(10 + level * 0.55),
  };
}

function buildRooms(mobs: string[], rooms: number, bossId: string): string[][] {
  const result: string[][] = [];
  for (let i = 0; i < rooms - 1; i++) {
    const a = mobs[i % mobs.length]!;
    const b = mobs[(i + 1) % mobs.length]!;
    result.push(i % 3 === 0 ? [a] : i % 2 === 0 ? [a, b] : [a, a]);
  }
  result.push([bossId]);
  return result;
}

export const EXPANSION_BOSSES_V30: MonsterDefinition[] = DUNGEON_SEEDS.map((seed) => {
  const id = bossIdFor(seed);
  const stats = bossStats(seed.levelRequired);
  return {
    id,
    name: `Gardien — ${seed.name}`,
    description: `Boss du donjon ${seed.name}.`,
    level: seed.levelRequired + 2,
    zoneId: seed.zoneId,
    stats,
    spells: ["fracas", "cri_corruption"],
    drops: seed.lootItemId ? [{ itemId: seed.lootItemId, chance: 0.2 }] : [],
    xpReward: seed.levelRequired * 45,
    eclatsReward: { min: seed.levelRequired * 5, max: seed.levelRequired * 10 },
    icon: seed.icon,
    isBoss: true,
  };
});

export const EXPANSION_DUNGEONS_V30: DungeonDefinition[] = DUNGEON_SEEDS.map((seed) => {
  const bossId = bossIdFor(seed);
  const mobs = seed.mobs;
  const groupMin = seed.levelRequired >= 50 ? 3 : seed.levelRequired >= 30 ? 2 : 1;
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    zoneId: seed.zoneId,
    levelRequired: seed.levelRequired,
    rooms: seed.rooms,
    bossId,
    icon: seed.icon,
    groupSize: { min: groupMin, max: 4 },
    roomMonsters: buildRooms(mobs, seed.rooms, bossId),
    rewards: {
      xp: seed.levelRequired * 50,
      eclats: seed.levelRequired * 25,
      items: seed.lootItemId
        ? [{ itemId: seed.lootItemId, chance: 0.15, quantity: 1 }]
        : undefined,
    },
  };
});

/** Map zoneId → ids des donjons expansion à ajouter dans zones.ts */
export const EXPANSION_DUNGEON_IDS_BY_ZONE: Record<string, string[]> = DUNGEON_SEEDS.reduce(
  (acc, seed) => {
    const list = acc[seed.zoneId] ?? [];
    list.push(seed.id);
    acc[seed.zoneId] = list;
    return acc;
  },
  {} as Record<string, string[]>
);
