/**
 * Clients du site (murs de logos de l'accueil).
 *
 * La liste vient du site de référence `leegigroup.com` : les douze logos de son carrousel
 * « Nos Clients ». Les fichiers d'origine sont des visuels à fond clair ; chacun a été
 * recadré sur son contenu et détouré (fond retiré) pour tenir sur une tuile blanche, sauf
 * l'emblème circulaire du dernier, à fond sombre, gardé tel quel — il fait une tuile
 * foncée, comme la pastille noire de la référence. D'où des fichiers ici nommés d'après
 * le client et non d'après les originaux (« 1.png », « 2.png »…).
 *
 * `width` / `height` sont les dimensions des fichiers livrés : Next les utilise pour
 * réserver la place de l'image (aucun décalage à l'affichage) et le rapport largeur /
 * hauteur est celui du logotype — les tuiles le respectent, elles ne déforment rien.
 *
 * Les noms ont été relevés sur les logos eux-mêmes (les fichiers du carrousel d'origine
 * sont nommés « 1.png », « 2.png »… et leurs `alt` sont vides). Un emblème circulaire n'a
 * pas pu être identifié : il garde un libellé générique.
 */

export type ClientLogo = {
  /** Nom du client — sert de texte alternatif. */
  name: string;
  src: string;
  width: number;
  height: number;
};

export const clientLogos: ClientLogo[] = [
  { name: "Com&print Multiservices", src: "/img/clients/comprint.png", width: 256, height: 124 },
  { name: "Médecin Auto", src: "/img/clients/medecin-auto.png", width: 256, height: 105 },
  { name: "Étincelles des Marques", src: "/img/clients/etincelles.png", width: 256, height: 117 },
  { name: "SENTRAS SARL", src: "/img/clients/sentras.png", width: 256, height: 126 },
  { name: "EMF Consulting", src: "/img/clients/emf.png", width: 178, height: 89 },
  { name: "SEMI — Entreprise Sénégalaise", src: "/img/clients/semi.png", width: 256, height: 149 },
  { name: "Houda Ingénierie BTP", src: "/img/clients/houda.png", width: 256, height: 198 },
  { name: "Setna Services", src: "/img/clients/setna.png", width: 145, height: 123 },
  { name: "Client LEEGI Group", src: "/img/clients/client-badge.png", width: 196, height: 196 },
  { name: "Sen'Afrik Conciergerie", src: "/img/clients/senafrik.png", width: 243, height: 256 },
  { name: "TMC — Talent Master Center", src: "/img/clients/tmc.png", width: 220, height: 256 },
  { name: "Élu de l'année Sénégal", src: "/img/clients/elu-annee.png", width: 203, height: 256 },
];
