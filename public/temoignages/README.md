# Visuels des témoignages

Ces six fichiers sont les portraits affichés à côté de chaque citation, dans la section
« Témoignages » de l'accueil (`components/Testimonials.tsx`). La même image sert aussi de fond
flouté à la section quand la case est active.

| Fichier   | Citation                | Source (Unsplash)                            |
| --------- | ----------------------- | -------------------------------------------- |
| `01.jpg`  | Awa Diop                | `photo-1531123897727-8f129e1688ce`            |
| `02.jpg`  | Fatou Ndiaye            | `photo-1494790108377-be9c29b29330`            |
| `03.jpg`  | Moussa Traoré           | `photo-1500648767791-00dcc994a43e`            |
| `04.jpg`  | Aïcha Sow               | `photo-1524504388940-b1c1722653e1`            |
| `05.jpg`  | Nadia Bensalem          | `photo-1544005313-94ddf0286df2`               |
| `06.jpg`  | Léa Mercier             | `photo-1580489944761-15a19d654956`            |

Format servi : **960 × 1200** (4:5, le cadre de la case), JPEG progressif, 56 à 128 Ko.

## Ce que ces photos sont — et ne sont pas

Ce sont des **portraits de banque d'images** (Unsplash, licence permettant l'usage commercial,
sans attribution obligatoire), posés pour que la section ait des visages au lieu des champs
dessinés qu'elle affichait. Ils n'ont **aucun lien** avec les personnes citées : ce sont des
visuels de remplacement, exactement comme `public/media/`.

⚠️ **Avant toute mise en ligne commerciale**, chaque personne citée doit fournir sa propre
photo (ou valider celle-ci). Substituer le portrait d'une inconnue à une citation nominative
revient à fabriquer un témoignage : on garde donc le nom, le rôle et la phrase réels, et on
change le fichier.

## Remplacer un portrait

1. Déposer l'image dans ce dossier, en **4:5** (par exemple 960 × 1200), sous le nom attendu
   par le dictionnaire (`lib/dictionaries/fr.ts` et `en.ts`, champ `image`).
2. Rien à toucher dans le code : `Testimonials` lit `item.image` et cadre en `object-cover`.

Pour une autre forme ou un autre nom de fichier, il suffit de changer le chemin dans les deux
dictionnaires (`testimonials[].image`).

`scripts/make-testimonials.py` régénère les anciens champs dessinés (dégradé chaud + grain)
sous ces mêmes noms : ne le lancer que si l'on veut revenir à des visuels sans visage.
