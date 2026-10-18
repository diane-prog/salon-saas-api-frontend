import { Suspense } from "react";

import ResetPasswordForm from "./reset-form";

/**
 * Écran de réinitialisation — enveloppe serveur du formulaire.
 *
 * Le formulaire lit le jeton dans l'URL (`useSearchParams`) : sans frontière `Suspense`,
 * Next refuse de prérendre la route. Le repli reste muet, comme pour la vérification du
 * code — un écran d'accès qui clignote un texte d'attente est plus déroutant qu'un écran
 * calme qui se remplit.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
