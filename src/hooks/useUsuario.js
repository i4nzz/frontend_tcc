import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alterarStatusUsuario, atualizarUsuario, obterMeuPerfil } from '../api/usuario';

export function useMeuPerfil() {
  return useQuery({
    queryKey: ['meu-perfil'],
    queryFn: async () => (await obterMeuPerfil()).data ?? null,
  });
}

export function useAtualizarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome, email, novaSenha }) => atualizarUsuario(id, { nome, email, novaSenha }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meu-perfil'] });
      queryClient.invalidateQueries({ queryKey: ['meus-filhos'] });
    },
  });
}

export function useAlterarStatusUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativo }) => alterarStatusUsuario(id, ativo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meus-filhos'] }),
  });
}
