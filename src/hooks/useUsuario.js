import { useQuery } from '@tanstack/react-query';
import { obterMeuPerfil } from '../api/usuario';

export function useMeuPerfil() {
  return useQuery({
    queryKey: ['meu-perfil'],
    queryFn: async () => (await obterMeuPerfil()).data ?? null,
  });
}
