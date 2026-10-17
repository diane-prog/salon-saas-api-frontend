import { z } from "zod";

/**
 * Schémas de validation des écrans d'accès — les MÊMES règles qu'avant, mais des messages
 * qui viennent du dictionnaire.
 *
 * POURQUOI DES FABRIQUES (`create…Schema(messages)`) : les contraintes sont écrites une fois,
 * ici ; leurs phrases, elles, changent avec la langue. Écrites en dur, elles s'affichaient en
 * français sur le site anglais — c'était exactement le défaut signalé (« les messages d'erreur
 * ne suivent pas la langue »). Chaque fabrique reçoit le bloc `ui.auth.validation` de la page
 * et n'utilise que lui ; une règle sans message reste une règle, aucune contrainte n'est
 * assouplie et aucune n'est dupliquée dans un composant.
 *
 * Les contraintes ne sont pas inventées, elles sont lues dans le Swagger
 * (`docs/openapi.json`, schémas `RegisterDto`, `LoginDto`, `VerifyOtpDto`) :
 *
 *   - `password`   → `minLength: 8` ;
 *   - `code` OTP   → 6 chiffres ;
 *   - `tenantSlug` → minuscules, chiffres et tirets (« mon-salon » dans l'exemple).
 *
 * ⚠️ Cette validation est un CONFORT, pas une sécurité : le backend revalide tout (Joi) et
 * renvoie ses propres messages, que `lib/api-error.ts` rend tels quels — ceux-là viennent du
 * serveur et ne dépendent pas de nos fabriques.
 */

/** Les phrases dont ces schémas ont besoin — `ui.auth.validation` les fournit, par langue. */
export type AuthMessages = {
  tenantNameMin: string;
  tenantNameMax: string;
  slugFormat: string;
  firstNameMin: string;
  lastNameMin: string;
  email: string;
  passwordMin: string;
  passwordLetter: string;
  passwordDigit: string;
  code: string;
};

export const createEmailSchema = (m: AuthMessages) =>
  z.string().trim().toLowerCase().pipe(z.email(m.email));

export const createLoginSchema = (m: AuthMessages) =>
  z.object({
    email: createEmailSchema(m),
    password: z.string().min(8, m.passwordMin),
  });

export const createVerifyOtpSchema = (m: AuthMessages) =>
  z.object({
    email: createEmailSchema(m),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, m.code),
  });

export const createResendOtpSchema = (m: AuthMessages) =>
  z.object({
    email: createEmailSchema(m),
  });

export const createRegisterSchema = (m: AuthMessages) =>
  z.object({
    tenantName: z
      .string()
      .trim()
      .min(2, m.tenantNameMin)
      .max(80, m.tenantNameMax),
    tenantSlug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, m.slugFormat),
    firstName: z.string().trim().min(2, m.firstNameMin),
    lastName: z.string().trim().min(2, m.lastNameMin),
    email: createEmailSchema(m),
    phone: z.string().trim().optional(),
    password: z
      .string()
      .min(8, m.passwordMin)
      .regex(/[A-Za-z]/, m.passwordLetter)
      .regex(/\d/, m.passwordDigit),
  });

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type VerifyOtpInput = z.infer<ReturnType<typeof createVerifyOtpSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

/**
 * Aplati les erreurs d'un schéma zod en `{ champ: message }` — la forme que consomment les
 * formulaires, et celle que le backend renvoie de son côté pour ses propres erreurs de
 * validation.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") result[key] ??= issue.message;
  }

  return result;
}

/**
 * Dérive l'adresse du salon depuis son nom : « Studio Kayao » → « studio-kayao ».
 * Sert le champ `tenantSlug` du formulaire d'inscription, qui reste modifiable — c'est une
 * aide à la saisie, pas une décision.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
