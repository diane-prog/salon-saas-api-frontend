#!/usr/bin/env python3
"""Génère l'identité graphique du site : le monogramme Belora et l'image de partage.

    python3 scripts/make-icons.py      # ou : pnpm icons

Ce qu'il produit (les trois conventions de fichiers de Next, à la racine de `app/`) :

    app/favicon.ico              16, 32 et 48 px — l'onglet du navigateur
    app/icon.png                 512 px — `<link rel="icon">`, Android, partages
    app/apple-icon.png           180 px — écran d'accueil iOS
    app/[lang]/opengraph-image.png  1200 × 630 — l'aperçu d'un lien partagé

L'image de partage est du même dessin que l'icône : elle est produite ICI parce qu'elle
existait déjà en fichier statique — une capture de l'ancienne charte (fond bleu nuit, moyenne
RGB 7/40/60) que personne ne voyait plus, sauf sur LinkedIn et WhatsApp. Elle est refaite dans
la palette du site, avec la promesse du produit telle qu'elle est écrite à l'accueil.

POURQUOI CE SCRIPT A CHANGÉ : il composait les icônes à partir de
`public/img/logo-navy.png` — le mot-symbole de l'ancienne agence — dont il isolait le mark par
composant connexe. L'onglet du navigateur, l'icône Android et le logo des données structurées
portaient donc encore la marque précédente, et le fichier source a été retiré avec le reste des
visuels de l'agence.

CE QU'IL DESSINE MAINTENANT : un « B » sérif sur un carré d'encre, avec le point de laiton du
site, puis les trois tailles. La matière est celle de la charte du produit (encre #15110e,
papier #f6f2ea, laiton #a67c4a) et la police est un sérif de livre, comme les titres du site.

⚠️ C'est une IDENTITÉ DE REMPLACEMENT, pas une identité validée : aucun logo Belora n'existe
encore. Le jour où il arrive, il suffit de remplacer `draw_master()` (et de poser la même
couleur de fond dans `app/manifest.ts`) — tout le reste du script, les trois fichiers et leurs
tailles, ne bouge pas.

DÉPENDANCE : Pillow (`python3 -m pip install Pillow`). Python n'est pas la langue du projet,
mais c'est ce qui lit et réécrit proprement un PNG et un ICO multi-tailles sans ajouter de
dépendance au `package.json` du site.
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # message utile plutôt que « ModuleNotFoundError »
    sys.exit("Pillow manque : python3 -m pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent

# ——— La charte, en dur : ce sont les jetons de `app/globals.css` (`--color-ink`, `--color-paper`,
#     `--color-brand`, `--color-turquoise`). Le script ne lit pas de CSS, donc les deux valeurs
#     doivent bouger ensemble si la palette change.
INK = (21, 17, 14, 255)
PAPER = (246, 242, 234, 255)
BRASS = (166, 124, 74, 255)
SAND = (216, 195, 160, 255)  # le laiton clair, pour le point sur l'encre

# ——— Géométrie du master : on dessine grand, on ne réduit qu'une fois.
MASTER = 1024
GLYPH_RATIO = 0.62  # hauteur du « B » dans le carré
DOT_RATIO = 0.085  # diamètre du point de laiton, rapporté au carré
DOT_GAP_RATIO = 0.055  # espace entre le « B » et le point

# ——— Le sérif de livre, tel que le navigateur le trouvera aussi (aucun téléchargement).
SERIF_CANDIDATES = (
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "C:/Windows/Fonts/georgiab.ttf",
)

ITALIC_CANDIDATES = (
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf",
    "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
    "C:/Windows/Fonts/georgiai.ttf",
)


def load_serif(size: int) -> ImageFont.FreeTypeFont:
    """Le premier sérif disponible. Un échec ici doit être bruyant : une icône en police par
    défaut (sans sérif) ne ressemblerait plus au site, et personne ne le verrait avant l'onglet."""
    for candidate in SERIF_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    sys.exit(
        "Aucun sérif trouvé (essayé : "
        + ", ".join(SERIF_CANDIDATES)
        + "). Ajoutez un chemin dans SERIF_CANDIDATES."
    )


def load_italic(size: int) -> ImageFont.FreeTypeFont:
    """Le même sérif, en italique — la seconde ligne du titre de partage."""
    for candidate in ITALIC_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return load_serif(size)


def draw_master() -> Image.Image:
    """Le carré d'encre, le « B » de papier, le point de laiton."""
    img = Image.new("RGBA", (MASTER, MASTER), INK)
    draw = ImageDraw.Draw(img)

    font = load_serif(int(MASTER * GLYPH_RATIO))

    # `anchor="mm"` centre sur la boîte du glyphe : c'est ce qui évite de recompter les
    # ascendantes de chaque police à la main.
    label = "B"
    box = draw.textbbox((0, 0), label, font=font, anchor="mm")
    glyph_w = box[2] - box[0]
    glyph_h = box[3] - box[1]

    dot = int(MASTER * DOT_RATIO)
    gap = int(MASTER * DOT_GAP_RATIO)
    total_w = glyph_w + gap + dot

    cx = MASTER // 2 - total_w // 2
    draw.text((cx + glyph_w // 2, MASTER // 2), label, font=font, fill=PAPER, anchor="mm")
    draw.ellipse(
        (
            cx + glyph_w + gap,
            MASTER // 2 - dot // 2,
            cx + glyph_w + gap + dot,
            MASTER // 2 + dot // 2,
        ),
        fill=SAND,
    )

    return img


OG_W, OG_H = 1200, 630

# La promesse, telle qu'elle est écrite en haut de l'accueil (`lib/dictionaries/fr.ts`).
OG_HEADLINE = ("Votre salon,", "sans le chaos.")
OG_FRUIT = "Agenda · Réservation en ligne · Clientèle · Caisse · Équipe"
OG_SITE = "belora.app"


def draw_share() -> Image.Image:
    """L'aperçu 1200 × 630 : l'encre du site, la même promesse que l'accueil, l'adresse."""
    img = Image.new("RGB", (OG_W, OG_H), INK[:3])
    draw = ImageDraw.Draw(img)

    margin = 84
    serif = load_serif(64)
    italic = load_italic(56)
    small = load_serif(22)

    # En haut : le nom, avec le point de laiton du site.
    draw.text((margin, 70), "Belora", font=serif, fill=PAPER[:3])
    name_w = draw.textbbox((margin, 70), "Belora", font=serif)[2] - margin
    dot_r = 9
    draw.ellipse(
        (margin + name_w + 14, 70 + 34 - dot_r, margin + name_w + 14 + dot_r * 2, 70 + 34 + dot_r),
        fill=SAND[:3],
    )

    # Le titre, sur deux lignes : la seconde en laiton clair, comme l'accent du site.
    draw.text((margin, 236), OG_HEADLINE[0], font=load_serif(96), fill=PAPER[:3])
    draw.text((margin, 352), OG_HEADLINE[1], font=italic, fill=SAND[:3])

    # Bas de carte : un filet de laiton, la phrase de métier, l'adresse.
    draw.line((margin, OG_H - 140, OG_W - margin, OG_H - 140), fill=BRASS[:3], width=2)
    draw.text((margin, OG_H - 112), OG_FRUIT, font=small, fill=(150, 142, 132))
    addr_w = draw.textbbox((0, 0), OG_SITE, font=small)[2]
    draw.text((OG_W - margin - addr_w, OG_H - 112), OG_SITE, font=small, fill=SAND[:3])

    return img


def main() -> None:
    master = draw_master()

    # `icon.png` — 512 px, la référence (Android, partages, JSON-LD).
    icons = ROOT / "app" / "icon.png"
    master.resize((512, 512), Image.LANCZOS).save(icons, format="PNG", optimize=True)

    # `apple-icon.png` — 180 px, opaque : iOS n'aime pas la transparence, et le fond est de
    # toute façon plein.
    apple = ROOT / "app" / "apple-icon.png"
    master.resize((180, 180), Image.LANCZOS).convert("RGB").save(apple, format="PNG", optimize=True)

    # `favicon.ico` — trois tailles dans un seul fichier : 16 (onglet), 32 (barre des tâches),
    # 48 (raccourci Windows).
    ico = ROOT / "app" / "favicon.ico"
    master.resize((48, 48), Image.LANCZOS).save(
        ico,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    # `opengraph-image.png` — l'aperçu d'un lien partagé (1200 × 630), la convention que Next
    # sert automatiquement. Le texte alternatif l'accompagne (`opengraph-image.alt.txt`).
    share = ROOT / "app" / "[lang]" / "opengraph-image.png"
    draw_share().save(share, format="PNG", optimize=True)

    for path in (icons, apple, ico, share):
        print(f"écrit {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
