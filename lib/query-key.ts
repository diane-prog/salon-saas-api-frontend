/**
 * Toutes les clés React Query du projet, en un seul endroit — **même forme que
 * `ldmgV/ldmgwebsiteft/lib/query-key.ts`** : chaque domaine expose
 * `all` · `lists()` · `list(filters)` · `details()` · `detail(id)`, et les
 * variantes `multilang()` là où le backend en a.
 *
 * Pourquoi une usine plutôt que des tableaux écrits à la main dans les hooks :
 * `invalidateQueries({ queryKey: queryKeys.appointments.all })` invalide alors
 * *toutes* les variantes d'un domaine (listes filtrées comprises) sans que
 * personne ait à les énumérer. Une clé écrite à la main dans un fichier et pas
 * dans l'autre laisse des données périmées à l'écran.
 *
 * Le nom des domaines suit les modules de l'API (`docs/openapi.json`).
 */

export const queryKeys = {
  /* ------------------------------------------------------------------ auth */
  users: {
    all: ["users"],
    currentUser: ["currentUser"],
    lists: () => [...queryKeys.users.all, "list"],
    list: (filters: unknown) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, "detail"],
    detail: (id: string) => [...queryKeys.users.details(), id],
  },

  /* ------------------------------------------- vitrine publique d'un salon */
  publicSalon: {
    all: ["publicSalon"],
    infos: () => [...queryKeys.publicSalon.all, "info"],
    info: (slug: string) => [...queryKeys.publicSalon.infos(), slug],
    servicesList: (slug: string) => [...queryKeys.publicSalon.all, "services", slug],
    staffList: (slug: string) => [...queryKeys.publicSalon.all, "staff", slug],
    galleryList: (slug: string) => [...queryKeys.publicSalon.all, "gallery", slug],
    reviewsList: (slug: string) => [...queryKeys.publicSalon.all, "reviews", slug],
    slots: (slug: string, params: unknown) => [...queryKeys.publicSalon.all, "slots", slug, params],
    bySlug: (slug: string) => [...queryKeys.publicSalon.all, "bySlug", slug],
  },

  /* -------------------------------------------------------------- métier */
  appointments: {
    all: ["appointments"],
    lists: () => [...queryKeys.appointments.all, "list"],
    list: (filters: unknown) => [...queryKeys.appointments.lists(), filters],
    details: () => [...queryKeys.appointments.all, "detail"],
    detail: (id: string) => [...queryKeys.appointments.details(), id],
  },

  calendar: {
    all: ["calendar"],
    slotsList: (params: unknown) => [...queryKeys.calendar.all, "slots", params],
    occupiedList: (params: unknown) => [...queryKeys.calendar.all, "occupied", params],
  },

  customers: {
    all: ["customers"],
    lists: () => [...queryKeys.customers.all, "list"],
    list: (filters: unknown) => [...queryKeys.customers.lists(), filters],
    details: () => [...queryKeys.customers.all, "detail"],
    detail: (id: string) => [...queryKeys.customers.details(), id],
  },

  staff: {
    all: ["staff"],
    lists: () => [...queryKeys.staff.all, "list"],
    list: (filters: unknown) => [...queryKeys.staff.lists(), filters],
    details: () => [...queryKeys.staff.all, "detail"],
    detail: (id: string) => [...queryKeys.staff.details(), id],
    availability: (id: string) => [...queryKeys.staff.detail(id), "availability"],
  },

  salonServices: {
    all: ["salonServices"],
    lists: () => [...queryKeys.salonServices.all, "list"],
    list: (filters: unknown) => [...queryKeys.salonServices.lists(), filters],
    details: () => [...queryKeys.salonServices.all, "detail"],
    detail: (id: string) => [...queryKeys.salonServices.details(), id],
    categories: () => [...queryKeys.salonServices.all, "categories"],
  },

  gallery: {
    all: ["gallery"],
    lists: () => [...queryKeys.gallery.all, "list"],
    list: (filters: unknown) => [...queryKeys.gallery.lists(), filters],
    details: () => [...queryKeys.gallery.all, "detail"],
    detail: (id: string) => [...queryKeys.gallery.details(), id],
  },

  reviews: {
    all: ["reviews"],
    lists: () => [...queryKeys.reviews.all, "list"],
    list: (filters: unknown) => [...queryKeys.reviews.lists(), filters],
    stats: () => [...queryKeys.reviews.all, "stats"],
    details: () => [...queryKeys.reviews.all, "detail"],
    detail: (id: string) => [...queryKeys.reviews.details(), id],
  },

  contactMessages: {
    all: ["contactMessages"],
    lists: () => [...queryKeys.contactMessages.all, "list"],
    list: (filters: unknown) => [...queryKeys.contactMessages.lists(), filters],
    details: () => [...queryKeys.contactMessages.all, "detail"],
    detail: (id: string) => [...queryKeys.contactMessages.details(), id],
  },

  notifications: {
    all: ["notifications"],
    lists: () => [...queryKeys.notifications.all, "list"],
    list: (filters: unknown) => [...queryKeys.notifications.lists(), filters],
    mine: () => [...queryKeys.notifications.all, "me"],
  },

  analytics: {
    all: ["analytics"],
    overview: (params: unknown) => [...queryKeys.analytics.all, "overview", params],
    revenue: (params: unknown) => [...queryKeys.analytics.all, "revenue", params],
  },

  dashboard: {
    all: ["dashboard"],
    overview: () => [...queryKeys.dashboard.all, "overview"],
  },

  /* ----------------------------------------------------------- abonnements */
  billing: {
    all: ["billing"],
    plans: () => [...queryKeys.billing.all, "plans"],
    current: () => [...queryKeys.billing.all, "current"],
    history: () => [...queryKeys.billing.all, "history"],
  },

  /* ---------------------------------------------------------------- tenant */
  tenant: {
    all: ["tenant"],
    me: () => [...queryKeys.tenant.all, "me"],
    settings: () => [...queryKeys.tenant.all, "settings"],
    stats: () => [...queryKeys.tenant.all, "stats"],
  },

  audit: {
    all: ["audit"],
    lists: () => [...queryKeys.audit.all, "list"],
    list: (filters: unknown) => [...queryKeys.audit.lists(), filters],
    byUser: (userId: string) => [...queryKeys.audit.all, "user", userId],
  },

  /* ------------------------------------------------------------- plateforme */
  platform: {
    all: ["platform"],
    stats: () => [...queryKeys.platform.all, "stats"],
    tenantLists: () => [...queryKeys.platform.all, "tenants"],
    tenantList: (filters: unknown) => [...queryKeys.platform.tenantLists(), filters],
    tenantDetail: (id: string) => [...queryKeys.platform.all, "tenants", id],
    audit: () => [...queryKeys.platform.all, "audit"],
  },

  /* ------------------------------------------------------------------- CMS
     Un document par langue (le modèle de `ldmgwebsiteft`), servi par
     `/contents?lang=xx` — endpoint **à livrer côté backend** (voir
     `docs/CMS.md`). Les clés existent déjà pour que le jour où la route
     répond, aucun écran n'ait à être retouché. */
  contents: {
    all: ["contents"],
    doc: (lang: string) => [...queryKeys.contents.all, "doc", lang],
    history: (lang: string) => [...queryKeys.contents.all, "history", lang],
  },
};
