import { z } from "zod";

/**
 * Schémas de validation des écrans d'accès — même rôle que les `schemas.ts` de
 * nos projets de référence : la règle est écrite **une fois**, côté client, et
 * elle reflète ce que le backend accepte réellement.
 *
 * Les contraintes ne sont pas inventées, elles sont lues dans le Swagger
 * (`docs/openapi.json`, schémas `RegisterDto`, `LoginDto`, `VerifyOtpDto`) :
 *
 *   - `password`   → `minLength: 8` ;
 *   - `code` OTP   → 6 chiffres ;
 *   - `tenantSlug` → minuscules, chiffres et tirets (« mon-salon » dans l'exemple).
 *
 * ⚠️ Cette validation est un CONFORT, pas une sécurité : le backend revalide tout
 * (Joi) et renvoie ses propres messages, que `features/auth/api.ts` rend tels
 * quels. Un schéma client qui serait plus permissif que le serveur ne laisserait
 * simplement pas passer moins de choses — jamais plus.
 */

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Le mot de passe fait au moins 8 caractères."),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Le code fait exactement 6 chiffres."),
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export const registerSchema = z.object({
  tenantName: z
    .string()
    .trim()
    .min(2, "Le nom du salon fait au moins 2 caractères.")
    .max(80, "Le nom du salon est trop long."),
  tenantSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Adresse attendue : minuscules, chiffres et tirets."),
  firstName: z.string().trim().min(2, "Le prénom fait au moins 2 caractères."),
  lastName: z.string().trim().min(2, "Le nom fait au moins 2 caractères."),
  email: emailSchema,
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(8, "Le mot de passe fait au moins 8 caractères.")
    .regex(/[A-Za-z]/, "Le mot de passe contient au moins une lettre.")
    .regex(/\d/, "Le mot de passe contient au moins un chiffre."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Aplati les erreurs d'un schéma zod en `{ champ: message }` — la forme que
 * consomment les formulaires, et celle que le backend renvoie de son côté pour
 * ses propres erreurs de validation.
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
 * Sert le champ `tenantSlug` du formulaire d'inscription, qui reste modifiable —
 * c'est une aide à la saisie, pas une décision.
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
