#!/usr/bin/env python3
"""
Génère les visuels Aetheris (zones, classes, monstres, PNJ, combat, roster).
Style : fantasy cristallin premium — dégradés, silhouettes, accents cyan/violet.

Usage: python3 scripts/generate-game-assets.py
Requires: pip install Pillow
"""
from __future__ import annotations

import hashlib
import math
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets"
DATA = ROOT / "src" / "game" / "data"

# ——— Palette Aetheris ———
BG_DARK = (26, 15, 46)
CYAN = (94, 234, 212)
GOLD = (255, 215, 0)
VIOLET = (139, 92, 246)

ZONE_THEMES: dict[str, tuple[tuple[int, int, int], tuple[int, int, int]]] = {
    "jardin_initiation": ((34, 197, 94), (22, 101, 52)),
    "vallee_eveils": ((99, 102, 241), (67, 56, 202)),
    "port_nebula": ((14, 165, 233), (3, 105, 161)),
    "foret_lumina": ((34, 197, 94), (21, 128, 61)),
    "desert_umbra": ((249, 115, 22), (154, 52, 18)),
    "citadelle_stellaire": ((167, 139, 250), (109, 40, 217)),
    "arene_pvp": ((239, 68, 68), (127, 29, 29)),
    "cotes_brume": ((56, 189, 248), (30, 64, 175)),
    "grottes_maree": ((6, 182, 212), (15, 23, 42)),
    "recif_abyssal": ((20, 184, 166), (13, 148, 136)),
    "ile_tempete": ((148, 163, 184), (71, 85, 105)),
    "sanctuaire_marins": ((59, 130, 246), (30, 58, 138)),
    "profondeurs_nereides": ((30, 58, 138), (15, 23, 42)),
    "plateau_givre": ((186, 230, 253), (125, 211, 252)),
    "monts_cristallins": ((147, 197, 253), (59, 130, 246)),
    "glaise_nord": ((203, 213, 225), (100, 116, 139)),
    "marais_ether": ((74, 222, 128), (22, 101, 52)),
    "cite_flottante": ((192, 132, 252), (126, 34, 206)),
    "catacombes_humides": ((82, 82, 91), (39, 39, 42)),
    "vallee_cendres": ((251, 146, 60), (124, 45, 18)),
    "forge_volcanique": ((239, 68, 68), (69, 10, 10)),
    "chambre_magma": ((220, 38, 38), (69, 10, 10)),
    "iles_stellaires": ((167, 139, 250), (79, 70, 229)),
    "atoll_nebula": ((56, 189, 248), (14, 165, 233)),
    "observatoire_lune": ((129, 140, 248), (67, 56, 202)),
}

CLASS_COLORS: dict[str, tuple[int, int, int]] = {
    "alchimiste": (46, 204, 113),
    "luminaire": (241, 196, 15),
    "druide": (39, 174, 96),
    "pyromancien": (255, 107, 53),
    "cryomancien": (116, 185, 255),
    "fulgurancien": (155, 89, 182),
    "gardien": (52, 152, 219),
    "bastion": (149, 165, 166),
    "paladin": (241, 196, 15),
    "berserker": (231, 76, 60),
    "faucheur": (142, 68, 173),
    "eclaireur": (46, 204, 113),
    "archer": (39, 174, 96),
    "artilleur": (230, 126, 34),
    "invocateur": (155, 89, 182),
}


def slug(entity_id: str) -> str:
    return entity_id.replace("_", "-")


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def gradient_vertical(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(lerp(top[i], bottom[i], t) for i in range(3))
        for x in range(w):
            px[x, y] = color
    return img


def add_noise(img: Image.Image, strength: int = 12) -> Image.Image:
    import random

    px = img.load()
    w, h = img.size
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b = px[x, y]
            n = random.randint(-strength, strength)
            px[x, y] = (
                max(0, min(255, r + n)),
                max(0, min(255, g + n)),
                max(0, min(255, b + n)),
            )
    return img


def draw_crystals(draw: ImageDraw.ImageDraw, w: int, h: int, seed: str, count: int = 5) -> None:
    hsh = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    for i in range(count):
        cx = (hsh % (w - 80)) + 40 + i * (w // (count + 1))
        cy = h - 60 - (hsh >> (i * 3)) % 80
        size = 18 + (hsh >> (i * 2)) % 24
        points = [
            (cx, cy - size),
            (cx + size * 0.6, cy),
            (cx, cy + size * 0.4),
            (cx - size * 0.6, cy),
        ]
        draw.polygon(points, fill=(*CYAN, 180), outline=(*VIOLET, 255))


def parse_zones() -> list[tuple[str, str]]:
    files = [DATA / "zones.ts", DATA / "expansionZonesV40.ts"]
    zones: list[tuple[str, str]] = [("jardin_initiation", "Jardin de l'Initiation")]
    seen: set[str] = {"jardin_initiation"}
    for path in files:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for m in re.finditer(
            r'\{[^{}]*id:\s*"([^"]+)"[^{}]*name:\s*"([^"]+)"[^{}]*levelRange:',
            text,
            re.DOTALL,
        ):
            if m.group(1) not in seen:
                seen.add(m.group(1))
                zones.append((m.group(1), m.group(2)))
    return zones


def parse_classes() -> list[tuple[str, str]]:
    text = (DATA / "classes.ts").read_text(encoding="utf-8")
    return re.findall(r'id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"', text)


def parse_monsters() -> list[tuple[str, str, bool]]:
    text = (DATA / "monsters.ts").read_text(encoding="utf-8")
    for extra in ("expansionV30.ts", "expansionMonstersV40.ts", "expansionMonstersV50.ts"):
        p = DATA / extra
        if p.exists():
            text += p.read_text(encoding="utf-8")
    monsters: list[tuple[str, str, bool]] = []
    seen: set[str] = set()
    for block in re.finditer(r"\{[^{}]*id:\s*\"([^\"]+)\"[^{}]*\}", text):
        chunk = block.group(0)
        mid = re.search(r'id:\s*"([^"]+)"', chunk)
        name = re.search(r'name:\s*"([^"]+)"', chunk)
        if not mid or not name:
            continue
        mid_id = mid.group(1)
        if mid_id in seen:
            continue
        seen.add(mid_id)
        is_boss = "isBoss: true" in chunk or "Boss —" in chunk or "boss_" in mid_id
        monsters.append((mid_id, name.group(1), is_boss))
    return monsters


def parse_npcs() -> list[tuple[str, str, str]]:
    text = (DATA / "npcs.ts").read_text(encoding="utf-8")
    return re.findall(r'id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"', text)


def draw_zone(zone_id: str, name: str) -> Image.Image:
    w, h = 960, 540
    top, bottom = ZONE_THEMES.get(zone_id, ((99, 102, 241), (26, 15, 46)))
    img = gradient_vertical((w, h), top, BG_DARK)
    img = add_noise(img, 8)
    draw = ImageDraw.Draw(img, "RGBA")
    # Sol
    draw.polygon([(0, h), (w, h), (w, h - 120), (0, h - 80)], fill=(bottom[0] // 2, bottom[1] // 2, bottom[2] // 2, 200))
    # Montagnes / silhouettes
    hsh = int(hashlib.md5(zone_id.encode()).hexdigest()[:8], 16)
    for i in range(4):
        bx = i * (w // 3) + (hsh % 40)
        draw.polygon(
            [(bx, h - 100), (bx + 120, h - 180 - (hsh % 60)), (bx + 240, h - 100)],
            fill=(bottom[0] // 3, bottom[1] // 3, bottom[2] // 3, 220),
        )
    draw_crystals(draw, w, h, zone_id)
    font = load_font(28, bold=True)
    small = load_font(14)
    draw.rectangle([(0, h - 56), (w, h)], fill=(26, 15, 46, 200))
    draw.text((24, h - 48), name, fill=CYAN, font=font)
    draw.text((24, h - 22), "Terreval — Aetheris", fill=(160, 160, 180), font=small)
    return img


def draw_class_portrait(class_id: str, name: str) -> Image.Image:
    w, h = 320, 400
    color = CLASS_COLORS.get(class_id, VIOLET)
    img = gradient_vertical((w, h), color, BG_DARK)
    draw = ImageDraw.Draw(img, "RGBA")
    # Silhouette
    cx, cy = w // 2, h // 2 - 20
    draw.ellipse([(cx - 45, cy - 90), (cx + 45, cy - 10)], fill=(255, 255, 255, 40))
    draw.rectangle([(cx - 55, cy - 10), (cx + 55, cy + 90)], fill=(255, 255, 255, 35))
    draw.polygon([(cx - 70, cy + 20), (cx - 90, cy + 120), (cx - 40, cy + 120)], fill=(255, 255, 255, 30))
    draw.polygon([(cx + 70, cy + 20), (cx + 90, cy + 120), (cx + 40, cy + 120)], fill=(255, 255, 255, 30))
    # Cadre cristal
    draw.rounded_rectangle([(8, 8), (w - 8, h - 8)], radius=16, outline=(*CYAN, 200), width=3)
    font = load_font(18, bold=True)
    small = load_font(11)
    draw.text((16, h - 52), name[:22], fill=(255, 255, 255), font=font)
    draw.text((16, h - 28), class_id.replace("_", " ").title(), fill=CYAN, font=small)
    return img


def draw_monster_sprite(monster_id: str, name: str, is_boss: bool) -> Image.Image:
    size = 192
    hsh = int(hashlib.md5(monster_id.encode()).hexdigest()[:8], 16)
    hue = (hsh % 200) + 40
    color = ((hue * 3) % 255, (hue * 5) % 200, (hue * 7) % 255)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = 12
    ring = GOLD if is_boss else CYAN
    draw.ellipse([(margin, margin), (size - margin, size - margin)], fill=(*BG_DARK, 255), outline=ring, width=4 if is_boss else 2)
    cx, cy = size // 2, size // 2
    r = 50 + (hsh % 20)
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=(*color, 220))
    # Yeux
    draw.ellipse([(cx - 18, cy - 10), (cx - 8, cy)], fill=(255, 255, 255))
    draw.ellipse([(cx + 8, cy - 10), (cx + 18, cy)], fill=(255, 255, 255))
    font = load_font(10, bold=True)
    label = name.split("—")[0].strip()[:14]
    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, size - 28), label, fill=(255, 255, 255), font=font)
    return img


def draw_npc_portrait(npc_id: str, name: str, title: str) -> Image.Image:
    size = 128
    hsh = int(hashlib.md5(npc_id.encode()).hexdigest()[:8], 16)
    accent = ((hsh % 150) + 80, (hsh % 120) + 60, (hsh % 200) + 40)
    img = gradient_vertical((size, size), accent, BG_DARK)
    draw = ImageDraw.Draw(img, "RGBA")
    cx = size // 2
    draw.ellipse([(cx - 28, 18), (cx + 28, 74)], fill=(255, 255, 255, 50))
    draw.arc([(cx - 35, 70), (cx + 35, 120)], 0, 180, fill=(255, 255, 255, 40), width=20)
    draw.ellipse([(4, 4), (size - 4, size - 4)], outline=(*CYAN, 180), width=2)
    font = load_font(9, bold=True)
    draw.text((6, size - 22), name[:16], fill=(255, 255, 255), font=font)
    draw.text((6, size - 11), title[:18], fill=CYAN, font=load_font(7))
    return img


def draw_roster() -> Image.Image:
    w, h = 1200, 360
    img = gradient_vertical((w, h), (67, 56, 202), BG_DARK)
    draw = ImageDraw.Draw(img, "RGBA")
    for i in range(8):
        cx = 80 + i * 140
        draw.polygon(
            [(cx, h - 40), (cx + 30, h - 160), (cx + 60, h - 40)],
            fill=(*CYAN, 60 + i * 10),
            outline=(*VIOLET, 150),
        )
    font = load_font(42, bold=True)
    draw.text((40, 40), "LES ÉVEILLEURS D'AETHERIS", fill=CYAN, font=font)
    draw.text((40, 95), "Choisissez votre destin à Terreval", fill=(200, 200, 220), font=load_font(20))
    return img


def draw_combat_bg() -> Image.Image:
    w, h = 960, 540
    img = gradient_vertical((w, h), (30, 20, 50), (10, 5, 20))
    draw = ImageDraw.Draw(img, "RGBA")
    # Grille isométrique suggérée
    for row in range(8):
        for col in range(12):
            cx = col * 80 + (row % 2) * 40 + 20
            cy = h - 80 - row * 35
            draw.polygon(
                [(cx, cy), (cx + 40, cy + 20), (cx, cy + 40), (cx - 40, cy + 20)],
                outline=(94, 234, 212, 40),
            )
    font = load_font(24, bold=True)
    draw.text((24, 24), "Arène tactique", fill=CYAN, font=font)
    return img


def main() -> None:
    zones_dir = PUBLIC / "zones"
    chars_dir = PUBLIC / "characters"
    monsters_dir = PUBLIC / "monsters"
    npcs_dir = PUBLIC / "npcs"
    combat_dir = PUBLIC / "combat"
    for d in (zones_dir, chars_dir, monsters_dir, npcs_dir, combat_dir):
        d.mkdir(parents=True, exist_ok=True)

    zones = parse_zones()
    classes = parse_classes()
    monsters = parse_monsters()
    npcs = parse_npcs()

    print(f"Generating {len(zones)} zones…")
    for zone_id, name in zones:
        draw_zone(zone_id, name).save(zones_dir / f"zone-{slug(zone_id)}.png", optimize=True)

    print(f"Generating {len(classes)} class portraits…")
    for class_id, name in classes:
        draw_class_portrait(class_id, name).save(chars_dir / f"class-{slug(class_id)}.png", optimize=True)

    draw_roster().save(chars_dir / "characters-roster.png", optimize=True)

    print(f"Generating {len(monsters)} monster sprites…")
    for monster_id, name, is_boss in monsters:
        draw_monster_sprite(monster_id, name, is_boss).save(
            monsters_dir / f"monster-{slug(monster_id)}.png", optimize=True
        )

    print(f"Generating {len(npcs)} NPC portraits…")
    for npc_id, name, title in npcs:
        draw_npc_portrait(npc_id, name, title).save(npcs_dir / f"npc-{slug(npc_id)}.png", optimize=True)

    draw_combat_bg().save(combat_dir / "combat-tactical.png", optimize=True)

    print(f"Done — assets in {PUBLIC}")
    print(f"  zones: {len(zones)}, classes: {len(classes)}, monsters: {len(monsters)}, npcs: {len(npcs)}")


if __name__ == "__main__":
    main()
