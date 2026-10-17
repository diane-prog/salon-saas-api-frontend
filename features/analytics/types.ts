/**
 * Vue chiffrée du salon — `GET /analytics/overview`.
 *
 * Le schéma Swagger de cette route n'est qu'un EXEMPLE, pas une définition : les
 * types ci-dessous reprennent exactement les champs de cet exemple, et rien de
 * plus. C'est la règle du projet : on type ce que le contrat montre, on n'ajoute
 * pas les champs qu'on aimerait avoir. Tout affichage passe par des lectures
 * défensives (`?? 0`) pour qu'un champ absent ne casse pas l'écran.
 */
export interface AnalyticsOverview {
  readonly period: { readonly from: string; readonly to: string };
  readonly appointments: {
    readonly total: number;
    readonly completed: number;
    readonly cancelled: number;
    readonly pending: number;
    readonly confirmed: number;
    readonly noShow: number;
  };
  readonly revenue: {
    readonly total: number;
    readonly average: number;
    readonly byDay: { readonly date: string; readonly revenue: number }[];
  };
  readonly customers: {
    readonly total: number;
    readonly new: number;
    readonly retentionRate: number;
    readonly averageVisits: number;
  };
  readonly popularServices: {
    readonly name: string;
    readonly count: number;
    readonly revenue: number;
  }[];
  readonly topStaff: {
    readonly name: string;
    readonly count: number;
    readonly revenue: number;
  }[];
}

export interface AnalyticsRange {
  /** `YYYY-MM-DD`, borne incluse. */
  readonly from: string;
  /** `YYYY-MM-DD`, borne incluse. */
  readonly to: string;
}
