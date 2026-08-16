import { useQuery } from '@tanstack/react-query';
import { listarMeusFilhos } from '../api/usuario';

export function useMeusFilhos() {
  return useQuery({
    queryKey: ['meus-filhos'],
    queryFn: async () => (await listarMeusFilhos()).data ?? [],
  });
}
