"use client";

import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import { LoadError, Loading, PageHeader } from "@/components/workspace/States";
import TenantAppearanceSheet from "@/components/workspace/TenantAppearanceSheet";
import TenantIdentitySheet from "@/components/workspace/TenantIdentitySheet";
import { useTenant, useTenantSettings, useTenantStats } from "@/features/tenant/queries";
import { LABEL, RULE } from "@/lib/editorial";

/**
 * Réglages du salon.
 *
 * Trois lectures, trois blocs : l'identité (`/tenant/me`), l'apparence et les
 * réseaux (`/tenant/settings`), les compteurs d'usage (`/tenant/stats`).
 *
 * Deux gestes d'écriture, chacun dans sa feuille : l'identité
 * (`PATCH /tenant/me`) et l'apparence (`PATCH /tenant/settings`). Ils sont
 * séparés parce que les routes le sont : l'une change l'adresse publique du
 * salon, l'autre ses couleurs. `plan` et `active` restent hors de portée — ils
 * appartiennent à la plateforme, pas au salon.
 *
 * Les couleurs sont affichées telles que le serveur les rend : c'est exactement
 * ce que la vitrine publique applique.
 */
export default function SettingsPage() {
  const { dict, locale } = useDictionary();
  const labels = dict.ui.dashboard.screens.settings;

  const tenantQ = useTenant();
  const settingsQ = useTenantSettings();
  const statsQ = useTenantStats();

  const tenant = tenantQ.data;
  const settings = settingsQ.data;
  const stats = statsQ.data;

  const [identityOpen, setIdentityOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const value = (input?: string | number | null) =>
    input === undefined || input === null || input === "" ? "—" : String(input);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={dict.ui.dashboard.nav.settings} title={labels.title} lead={labels.lead} />

      {tenantQ.isPending && <Loading />}

      {tenantQ.isError && <LoadError onRetry={() => tenantQ.refetch()} />}

      {tenant && (
        <section className={`border bg-white ${RULE}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4 ${RULE}`}>
            <h2 className={`${LABEL} text-ink/40`}>{labels.identity}</h2>
            <button
              type="button"
              onClick={() => setIdentityOpen(true)}
              className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {labels.editIdentity}
            </button>
          </div>

          <p className="border-b border-ink/10 px-6 py-4 text-xs leading-relaxed text-ink/50">
            {labels.impactIdentity}
          </p>

          <dl className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "name", label: labels.fields.name, value: tenant.name },
              { key: "slug", label: labels.fields.slug, value: tenant.slug },
              { key: "email", label: labels.fields.email, value: tenant.email },
              { key: "phone", label: labels.fields.phone, value: value(tenant.phone) },
              { key: "address", label: labels.fields.address, value: value(tenant.address) },
              { key: "city", label: labels.fields.city, value: value(tenant.city) },
              { key: "country", label: labels.fields.country, value: value(tenant.country) },
              { key: "timezone", label: labels.fields.timezone, value: tenant.timezone },
              { key: "plan", label: labels.fields.plan, value: tenant.subscriptionPlan },
            ].map((entry) => (
              <div key={entry.key} className="bg-white p-5">
                <dt className={`${LABEL} text-ink/40`}>{entry.label}</dt>
                <dd className="mt-2 break-words text-sm text-ink/75">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {settingsQ.isPending && <Loading />}

      {settingsQ.isError && <LoadError onRetry={() => settingsQ.refetch()} />}

      {settings && (
        <section className={`border bg-white ${RULE}`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4 ${RULE}`}>
            <h2 className={`${LABEL} text-ink/40`}>{labels.appearance}</h2>
            <button
              type="button"
              onClick={() => setAppearanceOpen(true)}
              className="text-xs text-ink/50 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {labels.editAppearance}
            </button>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/10 px-6 py-4">
            <p className="max-w-2xl text-xs leading-relaxed text-ink/50">{labels.impactAppearance}</p>
            {tenant?.slug && (
              <a
                href={`/${locale}/s/${tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.62rem] uppercase tracking-[0.14em] text-brand transition-colors hover:text-ink"
              >
                {dict.ui.dashboard.viewSite} →
              </a>
            )}
          </div>

          <div className="grid gap-px bg-ink/10 sm:grid-cols-3">
            {[
              { key: "primary", label: labels.colors.primary, color: settings.primaryColor },
              { key: "secondary", label: labels.colors.secondary, color: settings.secondaryColor },
              { key: "accent", label: labels.colors.accent, color: settings.accentColor ?? "" },
            ].map((entry) => (
              <div key={entry.key} className="bg-white p-5">
                <dt className={`${LABEL} text-ink/40`}>{entry.label}</dt>
                <dd className="mt-2 flex items-center gap-2 text-sm text-ink/75">
                  {entry.color ? (
                    <>
                      <span
                        aria-hidden
                        className="h-5 w-5 rounded-full border border-ink/10"
                        style={{ background: entry.color }}
                      />
                      <span className="tabular-nums">{entry.color}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            ))}
          </div>

          <div className={`border-t p-5 ${RULE}`}>
            <span className={`${LABEL} text-ink/40`}>{labels.fields.description}</span>
            <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-ink/70">
              {value(settings.description)}
            </p>
          </div>

          <div className={`border-t p-5 ${RULE}`}>
            <span className={`${LABEL} text-ink/40`}>{labels.socials}</span>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { key: "facebook", label: "Facebook", value: settings.facebook },
                { key: "instagram", label: "Instagram", value: settings.instagram },
                { key: "tiktok", label: "TikTok", value: settings.tiktok },
                { key: "twitter", label: "X", value: settings.twitter },
                { key: "website", label: labels.fields.website, value: settings.website },
                { key: "whatsapp", label: "WhatsApp", value: settings.whatsapp },
              ].map((entry) => (
                <div key={entry.key} className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-ink/45">{entry.label}</dt>
                  <dd className="truncate text-xs text-ink/75">{value(entry.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {statsQ.isPending && <Loading />}

      {statsQ.isError && <LoadError onRetry={() => statsQ.refetch()} />}

      {stats && (
        <section className={`border bg-white ${RULE}`}>
          <h2 className={`${LABEL} border-b px-6 py-4 text-ink/40 ${RULE}`}>{labels.counters}</h2>
          <dl className="grid gap-px bg-ink/10 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { key: "users", label: labels.fields.users, value: stats.counts.users },
              { key: "customers", label: labels.fields.customers, value: stats.counts.customers },
              { key: "staff", label: labels.fields.staff, value: stats.counts.staff },
              { key: "services", label: labels.fields.services, value: stats.counts.services },
              { key: "appointments", label: labels.fields.appointments, value: stats.counts.appointments },
              { key: "gallery", label: labels.fields.gallery, value: stats.counts.gallery },
            ].map((entry) => (
              <div key={entry.key} className="bg-white p-5">
                <dt className={`${LABEL} text-ink/40`}>{entry.label}</dt>
                <dd className="mt-2 font-light text-2xl tabular-nums text-ink">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Les feuilles ne s'ouvrent que sur des données chargées : un formulaire
          monté sur `undefined` repartirait de zéro et écraserait le salon. */}
      {tenant && (
        <TenantIdentitySheet open={identityOpen} onOpenChange={setIdentityOpen} tenant={tenant} />
      )}

      {settings && (
        <TenantAppearanceSheet
          open={appearanceOpen}
          onOpenChange={setAppearanceOpen}
          settings={settings}
        />
      )}
    </div>
  );
}
