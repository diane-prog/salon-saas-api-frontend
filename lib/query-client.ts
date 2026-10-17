import { MutationCache, QueryClient } from "@tanstack/react-query";

import { feedbackMessages } from "@/lib/feedback";
import { toast } from "@/hooks/use-toast";

/**
 * Client React Query unique de l'application — réglages repris tels quels de
 * `ldmgV/ldmgwebsiteft/lib/query-client.ts` :
 *
 * - `staleTime` 5 min : une ressource lue (services du salon, avis, vitrine) reste
 *   fraîche cinq minutes, donc pas de rappel réseau à chaque montage de composant ;
 * - `retry: 1` : une seule nouvelle tentative. Au-delà, une coupure réseau se
 *   traduit par une attente, pas par une réponse ;
 * - `refetchOnWindowFocus: false` : le retour d'onglet ne relance pas tout. Le
 *   rafraîchissement est explicite (`invalidateQueries`) au moment d'une écriture.
 *
 * LE RETOUR D'ACTION EST ICI, et pas dans chaque écran : toute mutation réussie
 * affiche une notification, toute mutation échouée affiche l'erreur. C'est la
 * seule façon d'obtenir une règle qui ne se perde pas — un formulaire ajouté plus
 * tard hérite du comportement sans rien écrire. Les messages viennent de
 * `lib/feedback.ts`, alimenté par le provider du dictionnaire (langue de la page).
 *
 * Deux échappatoires, pour ne pas mentir : `meta.silent` supprime la
 * notification (rafraîchissements internes), `meta.success` la remplace par un
 * message propre à l'action (« L'avis est publié », « La photo est en ligne »).
 */
type MutationMeta = {
  readonly silent?: boolean;
  readonly success?: string;
};

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const meta = mutation.meta as MutationMeta | undefined;
      if (meta?.silent) return;

      const { success } = feedbackMessages();
      toast({ title: meta?.success ?? success, variant: "success" });
    },
    onError: (_error, _variables, _context, mutation) => {
      const meta = mutation.meta as MutationMeta | undefined;
      if (meta?.silent) return;

      const { error } = feedbackMessages();
      toast({ title: error, variant: "destructive" });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
