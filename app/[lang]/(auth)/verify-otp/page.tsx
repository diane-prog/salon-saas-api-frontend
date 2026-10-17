import { Suspense } from "react";

import OtpForm from "./otp-form";

/**
 * Écran de vérification — enveloppe serveur du formulaire.
 *
 * `OtpForm` lit l'adresse dans l'URL (`useSearchParams`), ce qui demande un
 * accès à la requête. Sans frontière `Suspense`, Next ne peut pas prérendre la
 * route et refuse le build. Le repli est donc ici, et il est volontairement
 * muet : un écran d'accès qui clignote un texte d'attente est plus déroutant
 * qu'un écran calme qui se remplit.
 */
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
