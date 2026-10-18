# À implémenter côté backend — mot de passe oublié et réinitialisation

**Pourquoi ce document.** Les écrans `/forgot-password` et `/reset-password` existent côté
front, mais l'API n'expose **aucune** route pour les servir : vérifié dans `docs/openapi.json`,
les seules routes de `/auth` sont `register`, `login`, `login/platform`, `verify-otp`,
`otp/resend` et `me`. Rien n'est donc inventé côté site : ce document décrit exactement ce
qu'il nous faut. Tant que ces deux routes n'existent pas, les écrans répondent l'erreur du
serveur (« route introuvable »), pas un faux succès.

Conventions reprises de l'API existante : préfixe `/api/v1`, enveloppe de succès
`{ success, statusCode, data, timestamp, path }`, enveloppe d'erreur
`{ statusCode, path, method, timestamp, error }`, validation Joi, et **aucune fuite
d'existence de compte**.

---

## 1. `POST /api/v1/auth/password/forgot`

Demande l'envoi d'un lien de réinitialisation.

**Corps**

```json
{ "email": "cliente@exemple.com" }
```

**Réponse 200** — toujours 200, que l'adresse existe ou non (pas d'énumération de comptes) :

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Si un compte existe pour cette adresse, un lien vient d'être envoyé.",
    "email": "cliente@exemple.com",
    "expiresIn": 900
  },
  "timestamp": "2026-10-18T12:00:00.000Z",
  "path": "/api/v1/auth/password/forgot"
}
```

`expiresIn` = durée de vie du jeton, **en secondes** (même forme que `OtpSentResponse`).

**Erreurs**

| Code | Cas | Corps |
| ---- | --- | ----- |
| 400 | `email` absent ou mal formé | enveloppe d'erreur standard, message Joi |
| 429 | trop de demandes | enveloppe d'erreur, message explicite |

**Règles attendues**

- Jeton **aléatoire cryptographique**, ≥ 32 octets (hex ou base64url), **stocké haché** (jamais
  en clair en base), **à usage unique**, TTL 15 minutes.
- Une nouvelle demande **invalide les jetons précédents** du même compte.
- Limitation de débit : par exemple 3 demandes / heure / adresse, 10 / heure / IP.
- L'e-mail contient un lien vers `{FRONT_URL}/fr/reset-password?token=<jeton>` (et la variante
  `/en/` selon la langue du compte), en texte **et** en HTML.

---

## 2. `POST /api/v1/auth/password/reset`

Consomme le jeton et pose le nouveau mot de passe.

**Corps**

```json
{ "token": "8f3c…", "password": "NouveauMotDePasse8" }
```

Contraintes du mot de passe : **identiques à `register`** — 8 caractères minimum, au moins une
lettre et un chiffre (voir `RegisterDto` dans `docs/openapi.json`). Cette validation est
rejouée côté backend, la validation du navigateur n'étant qu'un confort.

**Réponse 200**

```json
{
  "success": true,
  "statusCode": 200,
  "data": { "message": "Mot de passe mis à jour." },
  "timestamp": "2026-10-18T12:00:00.000Z",
  "path": "/api/v1/auth/password/reset"
}
```

**Erreurs**

| Code | Cas | Attendu |
| ---- | --- | ------- |
| 400 | jeton inconnu, expiré, déjà utilisé | message explicite : « Ce lien a expiré. Demandez-en un nouveau. » |
| 400 | mot de passe trop faible | message Joi, en français ou en anglais selon `Accept-Language` |

**Règles attendues**

- Le jeton est **consommé** (marqué utilisé) dans la même transaction que la mise à jour.
- **Toutes les sessions existantes sont invalidées** après un changement de mot de passe. Le
  JWT actuel est autoportant (7 jours, sans refresh token d'après `AuthResponseDto`) : la
  méthode propre est d'ajouter un horodatage `passwordChangedAt` au modèle utilisateur et de
  rejeter, dans le garde JWT, tout jeton émis **avant** cet instant.
- L'e-mail de l'ancienne adresse peut être notifié (« votre mot de passe a changé ») : c'est
  la seule alerte qui reste si le compte a été compromis.

---

## 3. `GET /api/v1/auth/password/reset/verify?token=…` *(souhaitable, non bloquant)*

Permet à l'écran `/reset-password` de dire « ce lien a expiré » **avant** de faire saisir deux
mots de passe pour rien.

```json
{ "success": true, "statusCode": 200, "data": { "valid": true } }
```

`valid: false` (200, pas 404) si le jeton est inconnu, expiré ou déjà utilisé.

---

## Ce qui est déjà prêt côté site

- `features/auth/api.ts` — `forgotPassword()`, `resetPassword()`, `verifyResetToken()` ;
- `features/auth/queries.ts` — `useForgotPassword()`, `useResetPassword()` ;
- `app/[lang]/(auth)/forgot-password/page.tsx` — la demande ;
- `app/[lang]/(auth)/reset-password/page.tsx` — le nouveau mot de passe (jeton lu dans l'URL) ;
- validation `zod` dans `features/auth/schemas.ts`, textes dans les dictionnaires `fr`/`en`.

Il n'y a **rien à changer dans le front** le jour où ces routes existent : les appels sont déjà
écrits sur ce contrat. Si un détail diffère (nom du champ, durée, code d'erreur), dites-le et
je réaligne le front — pas l'inverse.
