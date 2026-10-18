#!/usr/bin/env python3
"""Génère les visuels des témoignages de l'accueil — des CHAMPS DESSINÉS, pas des visages.

⚠️ NE PAS LANCER SANS RAISON : `public/temoignages/01.jpg … 06.jpg` sont aujourd'hui des
portraits de banque d'images (Unsplash, voir `public/temoignages/README.md`). Ce script les
écrase par les dessins ci-dessous — il ne sert plus qu'à revenir à une section sans visage.

    python3 scripts/make-testimonials.py      # ou : pnpm testimonials

Ce qu'il produit :

    public/temoignages/01.jpg … 06.jpg     1200 × 1500 (portrait 4:5)

POURQUOI DES DESSINS ET PAS DES PHOTOS : la section « Témoignages » montre un portrait à
côté de chaque citation (`components/Testimonials.tsx`). Tant qu'aucune photo réelle n'est
fournie par les personnes citées, on pose un champ dessiné — une lumière chaude sur un
dégradé, du grain. Fabriquer un visage (ou piquer une photo trouvée en ligne) pour
illustrer un témoignage serait faux deux fois : faux visage, faux client.

⚠️ À REMPLACER : le jour où une personne citée fournit sa photo, il suffit de déposer le
fichier dans `public/temoignages/` sous le nom attendu par le dictionnaire (`image`), et
ce dessin pour ce témoignage ne sert plus. Aucun code à toucher.

LA MATIÈRE est celle du site : laiton #a67c4a, encre #15110e, papier #f6f2ea — les mêmes
teintes que le champ de repli de la section « Pourquoi », pour que la page n'ait qu'une
seule famille de couleurs. Chaque visuel varie par la position et la taille de sa lumière,
jamais par une teinte étrangère.

DÉPENDANCE : Pillow (`python3 -m pip install Pillow`), comme `scripts/make-icons.py`.
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 1500
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "temoignages")

# (fond haut, fond bas, lumière, position relative de la lumière, taille de la lumière)
PALETTES = [
    ("#e8cda4", "#5d422b", "#fff2d8", (0.62, 0.20), 0.62),
    ("#d9b48f", "#4a3527", "#ffe6c2", (0.30, 0.34), 0.54),
    ("#f0e2d0", "#6b4a33", "#ffffff", (0.74, 0.28), 0.48),
    ("#c9a37a", "#3b2c20", "#ffd9a8", (0.42, 0.16), 0.66),
    ("#e3c4a0", "#523a28", "#fff7e6", (0.24, 0.22), 0.50),
    ("#efe0cf", "#4f3826", "#fff1dd", (0.56, 0.12), 0.58),
]


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def gradient(top: str, bottom: str) -> Image.Image:
    """Un dégradé vertical, dessiné ligne par ligne (1200 × 1500, instantané)."""
    c1, c2 = hex_to_rgb(top), hex_to_rgb(bottom)
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        draw.line(
            [(0, y), (W, y)],
            fill=(lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)),
        )
    return img


def light_mask(position: tuple[float, float], size: float) -> Image.Image:
    """La lumière : un disque blanc, puis un flou très large — pas de bord visible."""
    mask = Image.new("L", (W, H), 0)
    cx, cy = position[0] * W, position[1] * H
    radius = size * min(W, H)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=255)
    return mask.filter(ImageFilter.GaussianBlur(radius * 0.55))


def add_grain(img: Image.Image, strength: float = 0.05) -> Image.Image:
    """Le grain du site : un bruit fin, mélangé à faible dose — jamais du plastique."""
    noise = Image.effect_noise((W, H), 18).convert("RGB")
    return Image.blend(img, noise, strength)


def build(index: int, palette: tuple) -> Image.Image:
    top, bottom, glow, position, size = palette
    img = gradient(top, bottom)

    mask = light_mask(position, size)
    img = Image.composite(Image.new("RGB", (W, H), hex_to_rgb(glow)), img, mask)

    # Une seconde lumière, plus petite et opposée : la composition n'est pas centrée.
    small = light_mask((1 - position[0], min(1.0, position[1] + 0.55)), size * 0.45)
    img = Image.composite(Image.new("RGB", (W, H), hex_to_rgb(glow)), img, small.point(lambda v: v // 3))

    # Un voile en bas, pour que la case tienne sur n'importe quelle légende.
    veil = Image.new("L", (W, H), 0)
    ImageDraw.Draw(veil).rectangle([0, int(H * 0.72), W, H], fill=40)
    img = Image.composite(Image.new("RGB", (W, H), (10, 8, 7)), img, veil.filter(ImageFilter.GaussianBlur(120)))

    return add_grain(img)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    for index, palette in enumerate(PALETTES, start=1):
        path = os.path.join(OUT_DIR, f"{index:02d}.jpg")
        build(index, palette).save(path, "JPEG", quality=88, optimize=True)
        print(f"  {os.path.relpath(path)}")

    print(f"{len(PALETTES)} visuels écrits dans public/temoignages/")


if __name__ == "__main__":
    main()
