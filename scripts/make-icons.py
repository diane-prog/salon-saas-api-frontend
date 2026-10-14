#!/usr/bin/env python3
"""Génère les icônes du site depuis le logo de la marque.

    python3 scripts/make-icons.py      # ou : pnpm icons

Ce qu'il produit (les trois conventions de fichiers de Next, à la racine de `app/`) :

    app/favicon.ico     16, 32 et 48 px — l'onglet du navigateur
    app/icon.png        512 px — `<link rel="icon">`, Android, partages
    app/apple-icon.png  180 px — écran d'accueil iOS

POURQUOI CE SCRIPT EXISTE : le logo (`public/img/logo*.png`, 889 × 355) est un MOT-SYMBOLE —
un mark à gauche, puis « LEEGI », puis une baseline. Posé tel quel dans un onglet de 16 px, il
ne donne que trois taches. L'icône est donc composée : le MARK SEUL, centré sur un carré navy,
à 76 % de la hauteur. Le mark est isolé par composant connexe (le plus grand du fichier) : c'est
ce qui permet de le prendre sans les lettres ni la baseline, et de garder ses vraies couleurs
(dégradé turquoise → bleu de la charte) plutôt qu'un aplat.

DÉPENDANCE : Pillow (`python3 -m pip install Pillow`). Python n'est pas la langue du projet,
mais c'est ce qui est disponible ici pour lire et réécrire proprement un PNG et un ICO
multi-tailles, sans ajouter de dépendance au `package.json` du site.
"""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # message utile plutôt que « ModuleNotFoundError »
    sys.exit("Pillow manque : python3 -m pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "img" / "logo-navy.png"  # les deux fichiers ont le même mark
NAVY = (15, 23, 42, 255)  # --color-navy
MASTER = 1024  # taille de travail : on ne réduit qu'une fois, depuis du grand
MARK_HEIGHT_RATIO = 0.76  # hauteur du mark dans le carré
ALPHA_THRESHOLD = 60  # en dessous, on considère le pixel transparent


def isolate_mark(source: Image.Image) -> Image.Image:
    """Le mark seul : plus grand composant connexe, avec ses vraies couleurs."""
    alpha = source.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > ALPHA_THRESHOLD else 0)
    width, height = mask.size
    pixels = mask.load()
    seen = bytearray(width * height)
    largest: list[tuple[int, int]] | None = None

    for start_y in range(height):
        for start_x in range(width):
            if not pixels[start_x, start_y] or seen[start_y * width + start_x]:
                continue
            queue = deque([(start_x, start_y)])
            seen[start_y * width + start_x] = 1
            component: list[tuple[int, int]] = []
            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and pixels[nx, ny] and not seen[ny * width + nx]:
                        seen[ny * width + nx] = 1
                        queue.append((nx, ny))
            if largest is None or len(component) > len(largest):
                largest = component

    if not largest:
        sys.exit(f"Aucun pixel opaque dans {SOURCE} : le logo a-t-il changé ?")

    keep = Image.new("L", (width, height), 0)
    keep_pixels = keep.load()
    for x, y in largest:
        keep_pixels[x, y] = 255

    xs = [x for x, _ in largest]
    ys = [y for _, y in largest]
    box = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
    mark = source.crop(box)
    mark.putalpha(keep.crop(box))  # rien d'autre que ce composant
    return mark


def compose(mark: Image.Image, size: int) -> Image.Image:
    """Le mark centré sur un carré navy — opaque, prêt pour un onglet ou un écran d'accueil."""
    canvas = Image.new("RGBA", (size, size), NAVY)
    target_h = round(size * MARK_HEIGHT_RATIO)
    target_w = round(mark.width * target_h / mark.height)
    canvas.alpha_composite(mark.resize((target_w, target_h), Image.LANCZOS), ((size - target_w) // 2, (size - target_h) // 2))
    return canvas


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    mark = isolate_mark(source)
    master = compose(mark, MASTER)

    written: list[tuple[Path, str]] = []

    master.resize((512, 512), Image.LANCZOS).convert("RGB").save(ROOT / "app" / "icon.png")
    written.append((ROOT / "app" / "icon.png", "512x512"))

    master.resize((180, 180), Image.LANCZOS).convert("RGB").save(ROOT / "app" / "apple-icon.png")
    written.append((ROOT / "app" / "apple-icon.png", "180x180"))

    # ICO multi-tailles : un seul fichier pour les trois cas de l'onglet. Windows et les
    # navigateurs choisissent la taille qui leur convient, sans redimensionnement flou.
    sizes = [(16, 16), (32, 32), (48, 48)]
    master.resize((48, 48), Image.LANCZOS).save(ROOT / "app" / "favicon.ico", sizes=sizes)
    written.append((ROOT / "app" / "favicon.ico", " · ".join(f"{w}x{h}" for w, h in sizes)))

    print(f"mark isolé : {mark.width}x{mark.height} (source {source.width}x{source.height})")
    for path, description in written:
        print(f"  {path.relative_to(ROOT)}  {description}  {path.stat().st_size} octets")


if __name__ == "__main__":
    main()
