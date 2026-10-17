import { useToast } from "./use-toast";

/**
 * Mutation + notification — **copie conforme de
 * `ldmgV/ldmgwebsiteft/hooks/use-mutation-with-toast.ts`**.
 *
 * Le contrat : on enveloppe une mutation existante, on nomme le message de succès
 * et celui d'échec, et l'appelant n'a plus qu'à `await mutateAsync(data)`. Les
 * deux retours d'expérience sont donc écrits une fois, au même endroit, au lieu
 * d'être répétés dans chaque formulaire.
 *
 * Les deux paramètres de type portent les données envoyées (`TData`) et ce que
 * la mutation rend (`TResult`) : le hook reste générique — il ne connaît aucun
 * contrat métier — sans perdre le typage au point d'appel.
 */
type MutationOptions = {
  readonly onSuccess?: () => void;
  readonly onError?: () => void;
};

export function useMutationWithToast<TData, TResult = unknown>(
  mutationFn: (data: TData, options?: MutationOptions) => Promise<TResult>,
  successMessage: string,
  errorMessage: string,
) {
  const { toast } = useToast();

  return {
    mutateAsync: async (data: TData) => {
      try {
        await mutationFn(data, {
          onSuccess: () => {
            toast({
              title: "Success",
              description: successMessage,
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          },
        });
      } catch {
        console.error("Operation failed");
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  };
}
