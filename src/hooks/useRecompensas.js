import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as recompensaApi from '../api/recompensa';

export function useRecompensasPorFilho(filhoId) {
  return useQuery({
    queryKey: ['recompensas', filhoId],
    queryFn: async () => (await recompensaApi.listarRecompensasPorFilho(filhoId)).data ?? [],
    enabled: !!filhoId,
  });
}

export function useRecompensa(recompensaId) {
  return useQuery({
    queryKey: ['recompensa', recompensaId],
    queryFn: async () => (await recompensaApi.obterRecompensa(recompensaId)).data,
    enabled: !!recompensaId,
  });
}

export function useRecompensasResgatadas(filhoId) {
  return useQuery({
    queryKey: ['recompensas-resgatadas', filhoId],
    queryFn: async () => (await recompensaApi.listarRecompensasResgatadas(filhoId)).data ?? [],
    enabled: !!filhoId,
  });
}

export function useCriarRecompensa(filhoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recompensaApi.criarRecompensa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recompensas', filhoId] }),
  });
}

export function useAtualizarRecompensa(filhoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => recompensaApi.atualizarRecompensa(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recompensas', filhoId] }),
  });
}

export function useRemoverRecompensa(filhoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recompensaApi.removerRecompensa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recompensas', filhoId] }),
  });
}

export function useResgatarRecompensa(filhoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recompensaId }) => recompensaApi.resgatarRecompensa(filhoId, recompensaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recompensas', filhoId] });
      queryClient.invalidateQueries({ queryKey: ['recompensas-resgatadas', filhoId] });
      queryClient.invalidateQueries({ queryKey: ['pontuacao'] });
    },
  });
}
