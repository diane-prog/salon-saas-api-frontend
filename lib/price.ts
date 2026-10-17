/**
 * Mise en forme des prix — vitrine publique et espace salon.
 *
 * POURQUOI cette fonction existe : le backend ne sérialise pas toujours le prix
 * de la même façon. `GET /public/{slug}/services` renvoie aujourd'hui des chaînes
 * (`"90.00"`) — constaté sur le salon de démonstration — alors que le champ est
 * déclaré `number` dans le Swagger, et que le schéma `SalonServiceEntity` promet
 * un nombre. Afficher la valeur brute donnerait « 90.00 € » ; la convertir
 * naïvement donnerait « NaN € » le jour où elle arrive en texte libre.
 *
 * On convertit donc une fois, proprement, et on retombe sur la valeur reçue si
 * elle n'est pas numérique : jamais de prix inventé, jamais de « NaN ».
 */
export function formatPrice(
  value: number | string,
  currency: string,
  locale: string,
): string {
  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) return `${value} ${currency}`;

  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount);
  return `${formatted} ${currency}`;
}
