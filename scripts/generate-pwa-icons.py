#!/usr/bin/env python3
"""Génère les icônes PWA Aetheris (cristal violet/cyan)."""
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "icons"


def _chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def _pixel(x: int, y: int, size: int) -> tuple[int, int, int, int]:
    cx, cy = size / 2, size / 2
    dx, dy = abs(x - cx) / cx, abs(y - cy) / cy
  # losange
    if dx + dy > 0.92:
        return (0, 0, 0, 0)
    t = (x + y) / (size * 2)
    r = int(139 + t * 60)
    g = int(61 + t * 40)
    b = int(255 - t * 80)
    if dx + dy < 0.35:
        r, g, b = 26, 15, 46
    if (x - cx) ** 2 + (y - cy) ** 2 < (size * 0.08) ** 2:
        r, g, b = 255, 215, 0
    return (r, g, b, 255)


def write_png(path: Path, size: int) -> None:
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            r, g, b, a = _pixel(x, y, size)
            raw.extend((r, g, b, a))
    compressed = zlib.compress(bytes(raw), 9)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + _chunk(b"IHDR", ihdr) + _chunk(b"IDAT", compressed) + _chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


if __name__ == "__main__":
    write_png(ROOT / "icon-192.png", 192)
    write_png(ROOT / "icon-512.png", 512)
    print("Icons written to", ROOT)
