# Médias du site

Les fichiers de ce dossier sont ceux que le site affiche **par défaut** : sans eux, plusieurs
sections retombent sur un champ dessiné (dégradé, soleil, grain). Ils sont là pour que le site
soit fini sans configuration — et pour être **remplacés**.

| Fichier      | Où il s'affiche                          | Cadre / format attendu        | Variable qui le remplace          |
| ------------ | ---------------------------------------- | ----------------------------- | --------------------------------- |
| `hero.mp4`   | fond plein cadre de l'accueil            | paysage 16:9, muet, en boucle | `NEXT_PUBLIC_HERO_VIDEO`          |
| `hero.jpg`   | affiche du hero (et image si pas de vidéo) | paysage 16:9                | `NEXT_PUBLIC_HERO_PHOTO`          |
| `why.jpg`    | illustration de la section « pourquoi »  | ~4:3, cadrage serré           | `NEXT_PUBLIC_WHY_IMAGE`           |
| `demo.mp4`   | bloc de démonstration (colonne gauche)   | cadré en 4:5 par la page      | `NEXT_PUBLIC_DEMO_VIDEO`          |
| `demo.jpg`   | bloc de démonstration (colonne droite)   | portrait ~4:5                 | `NEXT_PUBLIC_DEMO_IMAGE`          |

## Remplacer un média

1. Déposer le fichier dans `public/media/` sous le même nom (ou ailleurs dans `public/`), **ou**
   poser la variable dans `.env.local` avec un chemin local (`/media/mon-hero.mp4`) ou une URL
   absolue (`https://…`). La variable gagne toujours sur le fichier du dépôt.
2. Rien à faire dans le code : les composants lisent `process.env.… ?? "/media/…"`.

## Poids

Un média lourd coûte au premier affichage : viser ≲ 1,5 Mo pour une vidéo de fond (courte, en
boucle, sans audio) et ≲ 500 Ko pour une image. `ffmpeg` fait le travail :

```bash
# vidéo : 720p, sans audio, lecture progressive
ffmpeg -i source.mp4 -vf scale=-2:720 -an -c:v libx264 -crf 26 -preset slow \
  -movflags +faststart public/media/hero.mp4

# image : recadrée à la forme du cadre puis compressée
ffmpeg -i source.jpg -vf "scale=2400:1350:force_original_aspect_ratio=increase,crop=2400:1350" \
  -q:v 3 public/media/hero.jpg
```

## Provenance (dépôt initial, 2026-10-17)

Ces fichiers sont des **placeholders** posés pour remplir les emplacements vides :

| Fichier      | Source                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| `hero.mp4`   | `leegi/public/img/hero-deo.mp4` (projet Leegi, machine locale)          |
| `demo.mp4`   | `leegi/public/img/video-d.mp4` (projet Leegi, machine locale)           |
| `hero.jpg`   | `~/Downloads/front-view-woman-styling-hair.jpg`                         |
| `why.jpg`    | `~/Downloads/confident-entrepreneur-looking-camera-with-arms-folded-smiling.jpg` |
| `demo.jpg`   | `~/Downloads/smiling-african-american-man-looking.jpg`                  |

⚠️ Les droits de ces fichiers **n'ont pas été vérifiés** à la pose : ceux venant d'un autre
projet appartiennent au projet en question, ceux venant des téléchargements ont une licence
inconnue. À remplacer par des médias dont les droits sont établis (photos du salon, banque
d'images sous licence) avant toute mise en ligne commerciale.

Les images ont été ré-encodées ici (recadrage à la forme du cadre, métadonnées retirées) : les
originaux font 12 à 23 Mo, les versions servies 150 à 460 Ko. Les vidéos ont simplement perdu
leur piste audio et gagné la lecture progressive.
