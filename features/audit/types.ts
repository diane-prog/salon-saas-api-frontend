/**
 * Journal d'audit — forme relevée sur `GET /audit/logs` (le Swagger la décrit
 * partiellement). Chaque entrée dit QUI a fait QUOI sur QUOI, avec l'IP et
 * l'agent de la requête : c'est une trace, pas un flux d'activité à interpréter.
 *
 * `metadata` est un objet libre côté serveur (`null` dans les entrées relevées) :
 * il n'est pas affiché tel quel, seulement résumé quand il porte des clés.
 */
export interface AuditLog {
  readonly id: string;
  readonly tenantId?: string;
  readonly userId?: string | null;
  readonly action: string;
  readonly entity: string;
  readonly entityId?: string | null;
  readonly metadata?: Record<string, unknown> | null;
  readonly ip?: string | null;
  readonly userAgent?: string | null;
  readonly updatedAt?: string;
  readonly createdAt?: string;
}
