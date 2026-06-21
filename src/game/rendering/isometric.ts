/**
 * Moteur de rendu isométrique pour Aetheris
 * Conversion grille → coordonnées écran en losange 2:1
 */

import { getMonsterById } from "../data/monsters";

export interface IsoPoint {
  x: number;
  y: number;
}

export interface ZoneTileTheme {
  even: number;
  odd: number;
  stroke: number;
  highlight: number;
  accent: number;
  obstacle: number;
}

export const ZONE_THEMES: Record<string, ZoneTileTheme> = {
  vallee_eveils: { even: 0x3d5a3a, odd: 0x4a6b45, stroke: 0x2d4a2d, highlight: 0x5a8a55, accent: 0x8fbc8f, obstacle: 0x5c4033 },
  port_nebula: { even: 0x2a4a6a, odd: 0x3a5a7a, stroke: 0x1a3a5a, highlight: 0x4a7a9a, accent: 0x87ceeb, obstacle: 0x4a4a4a },
  foret_lumina: { even: 0x2d5a2d, odd: 0x3d6b3d, stroke: 0x1d4a1d, highlight: 0x4d8a4d, accent: 0x90ee90, obstacle: 0x3d2817 },
  desert_umbra: { even: 0x8b7355, odd: 0xa08060, stroke: 0x6b5335, highlight: 0xc0a080, accent: 0xdaa520, obstacle: 0x4a3728 },
  citadelle_stellaire: { even: 0x4a4a6a, odd: 0x5a5a7a, stroke: 0x3a3a5a, highlight: 0x7a7aaa, accent: 0xb0c4de, obstacle: 0x2a2a4a },
  arene_pvp: { even: 0x6a3a3a, odd: 0x7a4a4a, stroke: 0x5a2a2a, highlight: 0x9a5a5a, accent: 0xff6b6b, obstacle: 0x3a2020 },
  cotes_brume: { even: 0x2a4a5a, odd: 0x3a5a6a, stroke: 0x1a3a4a, highlight: 0x5a8a9a, accent: 0x87ceeb, obstacle: 0x3a4a4a },
  grottes_maree: { even: 0x1a3a4a, odd: 0x2a4a5a, stroke: 0x0a2a3a, highlight: 0x4a7a8a, accent: 0x5f9ea0, obstacle: 0x2a3030 },
  recif_abyssal: { even: 0x3a5a6a, odd: 0x4a6a7a, stroke: 0x2a4a5a, highlight: 0x6a9aaa, accent: 0xff7f50, obstacle: 0x4a3728 },
  ile_tempete: { even: 0x4a4a6a, odd: 0x5a5a8a, stroke: 0x3a3a5a, highlight: 0x8a8aba, accent: 0x9370db, obstacle: 0x2a2a4a },
  sanctuaire_marins: { even: 0x2a5a6a, odd: 0x3a6a7a, stroke: 0x1a4a5a, highlight: 0x5a9aaa, accent: 0x40e0d0, obstacle: 0x2a4040 },
  profondeurs_nereides: { even: 0x1a2a4a, odd: 0x2a3a5a, stroke: 0x0a1a3a, highlight: 0x4a6a8a, accent: 0x4169e1, obstacle: 0x1a1020 },
  plateau_givre: { even: 0x4a6a8a, odd: 0x5a7a9a, stroke: 0x3a5a7a, highlight: 0x7ab0d0, accent: 0xb0e0ff, obstacle: 0x3a4a5a },
  monts_cristallins: { even: 0x5a6a8a, odd: 0x6a7a9a, stroke: 0x4a5a7a, highlight: 0x8aa0c0, accent: 0xc0d8f0, obstacle: 0x4a4a6a },
  glaise_nord: { even: 0x3a5a7a, odd: 0x4a6a8a, stroke: 0x2a4a6a, highlight: 0x6a9aba, accent: 0x87ceeb, obstacle: 0x2a3a4a },
  marais_ether: { even: 0x2a5a3a, odd: 0x3a6a4a, stroke: 0x1a4a2a, highlight: 0x5a9a6a, accent: 0x7cfc00, obstacle: 0x2a3a20 },
  cite_flottante: { even: 0x5a5a7a, odd: 0x6a6a8a, stroke: 0x4a4a6a, highlight: 0x8a8aaa, accent: 0xd8bfd8, obstacle: 0x3a3a5a },
  catacombes_humides: { even: 0x2a4a3a, odd: 0x3a5a4a, stroke: 0x1a3a2a, highlight: 0x5a8a6a, accent: 0x556b2f, obstacle: 0x1a2a1a },
  vallee_cendres: { even: 0x6a4a3a, odd: 0x7a5a4a, stroke: 0x5a3a2a, highlight: 0x9a6a5a, accent: 0xff6347, obstacle: 0x3a2a1a },
  forge_volcanique: { even: 0x7a3a2a, odd: 0x8a4a3a, stroke: 0x6a2a1a, highlight: 0xaa5a4a, accent: 0xff4500, obstacle: 0x4a1a0a },
  chambre_magma: { even: 0x8a2a1a, odd: 0x9a3a2a, stroke: 0x7a1a0a, highlight: 0xba4a3a, accent: 0xff6600, obstacle: 0x3a1008 },
  iles_stellaires: { even: 0x4a4a7a, odd: 0x5a5a8a, stroke: 0x3a3a6a, highlight: 0x7a7aaa, accent: 0xdda0dd, obstacle: 0x2a2a4a },
  atoll_nebula: { even: 0x3a5a7a, odd: 0x4a6a8a, stroke: 0x2a4a6a, highlight: 0x6a9aba, accent: 0x40e0d0, obstacle: 0x2a3a4a },
  observatoire_lune: { even: 0x4a3a6a, odd: 0x5a4a7a, stroke: 0x3a2a5a, highlight: 0x7a6a9a, accent: 0x9370db, obstacle: 0x2a1a3a },
  combat: { even: 0x1a3a2a, odd: 0x2a4a3a, stroke: 0x0a2a1a, highlight: 0x4a6a5a, accent: 0x3d8b5a, obstacle: 0x3a3020 },
  dungeon: { even: 0x2a2a3a, odd: 0x3a3a4a, stroke: 0x1a1a2a, highlight: 0x5a5a6a, accent: 0x6a5acd, obstacle: 0x1a1020 },
  event: { even: 0x4a2a5a, odd: 0x5a3a6a, stroke: 0x3a1a4a, highlight: 0x7a5a8a, accent: 0xff69b4, obstacle: 0x2a1030 },
};

export function gridToIso(gridX: number, gridY: number, tileW: number, tileH: number, offsetX: number, offsetY: number): IsoPoint {
  return {
    x: (gridX - gridY) * (tileW / 2) + offsetX,
    y: (gridX + gridY) * (tileH / 2) + offsetY,
  };
}

export function isoDepth(gridX: number, gridY: number): number {
  return gridX + gridY;
}

export function drawIsoTile(
  graphics: Phaser.GameObjects.Graphics,
  screenX: number,
  screenY: number,
  tileW: number,
  tileH: number,
  fillColor: number,
  strokeColor: number,
  alpha = 1
): void {
  const hw = tileW / 2;
  const hh = tileH / 2;
  graphics.fillStyle(fillColor, alpha);
  graphics.lineStyle(1, strokeColor, 0.6);
  graphics.beginPath();
  graphics.moveTo(screenX, screenY - hh);
  graphics.lineTo(screenX + hw, screenY);
  graphics.lineTo(screenX, screenY + hh);
  graphics.lineTo(screenX - hw, screenY);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
}

export function drawIsoShadow(
  graphics: Phaser.GameObjects.Graphics,
  screenX: number,
  screenY: number,
  radius: number
): void {
  graphics.fillStyle(0x000000, 0.25);
  graphics.fillEllipse(screenX, screenY + 4, radius * 2, radius * 0.6);
}

export function getClassIcon(classId: string): string {
  const icons: Record<string, string> = {
    alchimiste: "⚗️", luminaire: "☀️",
    pyromancien: "🔥", cryomancien: "❄️",
    gardien: "🛡️", bastion: "🏰",
    berserker: "⚔️", eclaireur: "🗡️",
    archer: "🏹", invocateur: "✨",
    druide: "🌿", fulgurancien: "⚡", paladin: "✝️",
    faucheur: "💀", artilleur: "💣",
  };
  return icons[classId] ?? "🧙";
}

const MONSTER_ICON_OVERRIDES: Record<string, string> = {
  graine_ombre: "🌑", wisp_sauvage: "✨", loup_cristal: "🐺",
  gardien_ruines: "👹", treant_corrompu: "🌳", fee_brume: "🧚",
  champion_lumina: "⚔️", scorpion_ether: "🦂", sphinx_ombres: "🦁",
  golem_stellaire: "🗿", dragon_aether: "🐉",
  event_ombre_majeur: "👿", event_cristal_ancien: "💠",
  event_esprit_eclipse: "🌘", event_gardien_floral: "🌸",
};

export function getMonsterIcon(monsterId?: string): string {
  if (!monsterId) return "👾";
  const override = MONSTER_ICON_OVERRIDES[monsterId];
  if (override) return override;
  return getMonsterById(monsterId)?.icon ?? "👾";
}
