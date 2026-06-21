/**
 * v5.0 — Boss des 26 donjons mythiques
 */

import type { MonsterDefinition } from "./monsters";

interface BossSeed {
  id: string;
  name: string;
  description: string;
  level: number;
  zoneId: string;
  icon: string;
  lootItemId?: string;
}

const BOSS_SEEDS: BossSeed[] = [
  { id: "boss_mythique_eveil", name: "Gardien Mythique de l'Éveil", description: "Boss — Avatar du Cristal Ancestral.", level: 18, zoneId: "vallee_eveils", icon: "💠", lootItemId: "cristal_eveil" },
  { id: "boss_mythique_nexus", name: "Gardien Mythique du Nexus", description: "Boss — Cœur de la Citadelle.", level: 130, zoneId: "citadelle_stellaire", icon: "🏰", lootItemId: "coeur_nexus" },
  { id: "boss_mythique_docks", name: "Gardien Mythique des Docks", description: "Boss — Amiral des marées noires.", level: 40, zoneId: "port_nebula", icon: "⚓", lootItemId: "encre_ombre" },
  { id: "boss_mythique_clairiere", name: "Gardien Mythique de la Clairière", description: "Boss — Reine des fées corrompues.", level: 32, zoneId: "foret_lumina", icon: "🌳", lootItemId: "aile_fee" },
  { id: "boss_mythique_tombeau", name: "Gardien Mythique du Tombeau", description: "Boss — Spectre du pharaon.", level: 50, zoneId: "desert_umbra", icon: "🏺", lootItemId: "parchemin_ancien" },
  { id: "boss_mythique_fosse", name: "Gardien Mythique de la Fosse", description: "Boss — Champion des arènes oubliées.", level: 60, zoneId: "arene_pvp", icon: "⚔️", lootItemId: "noyau_stellaire" },
  { id: "boss_mythique_epave", name: "Gardien Mythique de l'Épave", description: "Boss — Capitaine spectral.", level: 26, zoneId: "cotes_brume", icon: "🚢", lootItemId: "carte_tresor" },
  { id: "boss_mythique_maree", name: "Gardien Mythique de Marée", description: "Boss — Esprit des vagues.", level: 30, zoneId: "grottes_maree", icon: "🌊", lootItemId: "corail_vivant" },
  { id: "boss_mythique_abysse", name: "Gardien Mythique Abyssal", description: "Boss — Seigneur des profondeurs.", level: 42, zoneId: "recif_abyssal", icon: "🕳️", lootItemId: "perle_abysse" },
  { id: "boss_mythique_tempete", name: "Gardien Mythique de la Tempête", description: "Boss — Hurleur des vents.", level: 46, zoneId: "ile_tempete", icon: "⛈️", lootItemId: "essence_tempete" },
  { id: "boss_mythique_sanctuaire", name: "Gardien Mythique Marin", description: "Boss — Oracle des navigateurs.", level: 52, zoneId: "sanctuaire_marins", icon: "🛕", lootItemId: "cristal_corail" },
  { id: "boss_mythique_leviathan", name: "Gardien Mythique du Léviathan", description: "Boss — Avatar des abysses.", level: 80, zoneId: "profondeurs_nereides", icon: "🐋", lootItemId: "ecaille_leviathan" },
  { id: "boss_mythique_glacier", name: "Gardien Mythique du Glacier", description: "Boss — Colosse de glace.", level: 75, zoneId: "plateau_givre", icon: "🧊", lootItemId: "cristal_givre" },
  { id: "boss_mythique_sommet", name: "Gardien Mythique du Sommet", description: "Boss — Sentinelle des pics.", level: 92, zoneId: "monts_cristallins", icon: "🏔️", lootItemId: "fragment_cristal" },
  { id: "boss_mythique_toundra", name: "Gardien Mythique de la Toundra", description: "Boss — Seigneur boréal.", level: 118, zoneId: "glaise_nord", icon: "🦣", lootItemId: "essence_boreale" },
  { id: "boss_mythique_marecage", name: "Gardien Mythique du Marécage", description: "Boss — Esprit des tourbières.", level: 48, zoneId: "marais_ether", icon: "🌫️", lootItemId: "mousse_ether" },
  { id: "boss_mythique_cite", name: "Gardien Mythique de la Cité", description: "Boss — Architecte stellaire.", level: 62, zoneId: "cite_flottante", icon: "🏛️", lootItemId: "parchemin_flottant" },
  { id: "boss_mythique_crypte", name: "Gardien Mythique de la Crypte", description: "Boss — Liche des noyés.", level: 72, zoneId: "catacombes_humides", icon: "💀", lootItemId: "essence_marais" },
  { id: "boss_mythique_lave", name: "Gardien Mythique de Lave", description: "Boss — Colosse de cendre.", level: 56, zoneId: "vallee_cendres", icon: "🌋", lootItemId: "cendre_stellaire" },
  { id: "boss_mythique_forge", name: "Gardien Mythique de la Forge", description: "Boss — Maître forgeron primordial.", level: 82, zoneId: "forge_volcanique", icon: "🔨", lootItemId: "lingot_volcan" },
  { id: "boss_mythique_magma", name: "Gardien Mythique du Magma", description: "Boss — Avatar du volcan.", level: 135, zoneId: "chambre_magma", icon: "🔥", lootItemId: "fragment_primordial" },
  { id: "boss_mythique_ciel", name: "Gardien Mythique du Ciel", description: "Boss — Navigateur stellaire.", level: 36, zoneId: "iles_stellaires", icon: "✨", lootItemId: "fragment_astral" },
  { id: "boss_mythique_lagoon", name: "Gardien Mythique du Lagoon", description: "Boss — Prédateur céleste.", level: 50, zoneId: "atoll_nebula", icon: "🌊", lootItemId: "perle_stellaire" },
  { id: "boss_mythique_dome", name: "Gardien Mythique du Dôme", description: "Boss — Oracle lunaire suprême.", level: 140, zoneId: "observatoire_lune", icon: "🔭", lootItemId: "essence_constellation" },
  { id: "boss_mythique_portail_givre", name: "Gardien Mythique Boréal", description: "Boss — Dragon du portail gelé.", level: 112, zoneId: "glaise_nord", icon: "🌀", lootItemId: "ecaille_givre" },
  { id: "boss_mythique_nexus_marais", name: "Gardien Mythique des Eaux", description: "Boss — Confluence des marais.", level: 66, zoneId: "marais_ether", icon: "💧", lootItemId: "phylactere_umbra" },
];

function bossStats(level: number) {
  return {
    hp: Math.round((40 + level * 12) * 5),
    ap: 8 + Math.floor(level / 12),
    mp: 4 + Math.floor(level / 18),
    damage: Math.round((8 + level * 0.7) * 2.2),
    defense: Math.round((4 + level * 0.4) * 2.5),
  };
}

export const EXPANSION_MONSTERS_V50: MonsterDefinition[] = BOSS_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  description: seed.description,
  level: seed.level,
  zoneId: seed.zoneId,
  stats: bossStats(seed.level),
  spells: ["fracas", "cri_corruption", "apocalypse_ether"],
  drops: seed.lootItemId ? [{ itemId: seed.lootItemId, chance: 0.3 }] : [],
  xpReward: seed.level * 60,
  eclatsReward: { min: seed.level * 4, max: seed.level * 10 },
  icon: seed.icon,
  isBoss: true,
}));
