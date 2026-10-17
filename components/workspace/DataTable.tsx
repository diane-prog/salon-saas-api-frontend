"use client";

import type { ReactNode } from "react";

import { LABEL, RULE } from "@/lib/editorial";

/**
 * Tableau de l'espace salon — un seul rendu pour tous les écrans de données.
 *
 * Pourquoi un composant générique alors que chaque écran a ses colonnes : le
 * cadre (filet, fond blanc, défilement horizontal sur petit écran, en-têtes en
 * petites capitales) est identique partout, et c'est lui qui se serait mis à
 * diverger d'un écran à l'autre. Les colonnes, elles, restent déclarées par
 * l'écran : le tableau ne connaît aucun métier.
 *
 * `rowKey` est obligatoire : un index de tableau comme clé React fait remonter
 * les mauvaises lignes quand la liste change de longueur.
 */
export type Column<T> = {
  readonly key: string;
  readonly label: string;
  /** Alignement à droite pour les montants et les nombres. */
  readonly numeric?: boolean;
  readonly cell: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  minWidth = "42rem",
}: {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T, index: number) => string;
  minWidth?: string;
}) {
  return (
    <div className={`overflow-x-auto border bg-white ${RULE}`}>
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className={`border-b ${RULE}`}>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`${LABEL} px-4 py-3 font-medium text-ink/40 ${
                  column.numeric ? "text-right" : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className="border-b border-navy/[0.06] last:border-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 align-top ${column.numeric ? "tabular-nums text-right" : ""}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
