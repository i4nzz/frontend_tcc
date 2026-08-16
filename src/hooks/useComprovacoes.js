import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import * as comprovacaoApi from '../api/comprovacao';

export function useComprovacoesPorTarefa(tarefaId) {
  return useQuery({
    queryKey: ['comprovacoes', tarefaId],
    queryFn: async () => (await comprovacaoApi.listarComprovacoesPorTarefa(tarefaId)).data ?? [],
    enabled: !!tarefaId,
  });
}

// Usa a mesma queryKey de useComprovacoesPorTarefa pra compartilhar cache —
// só serve pra decorar a lista de tarefas com um badge de status por item.
export function useUltimoStatusPorTarefa(tarefaIds) {
  const results = useQueries({
    queries: tarefaIds.map((tarefaId) => ({
      queryKey: ['comprovacoes', tarefaId],
      queryFn: async () => (await comprovacaoApi.listarComprovacoesPorTarefa(tarefaId)).data ?? [],
    })),
  });

  const statusPorTarefa = {};
  tarefaIds.forEach((tarefaId, index) => {
    const comprovacoes = results[index]?.data ?? [];
    statusPorTarefa[tarefaId] = comprovacoes[comprovacoes.length - 1]?.status ?? null;
  });
  return statusPorTarefa;
}

export function useFotoComprovacao(comprovacaoId) {
  return useQuery({
    queryKey: ['comprovacao-foto', comprovacaoId],
    queryFn: () => comprovacaoApi.obterFotoComprovacao(comprovacaoId),
    enabled: !!comprovacaoId,
    staleTime: Infinity,
  });
}

export function useEnviarComprovacao(tarefaId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: comprovacaoApi.enviarComprovacao,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comprovacoes', tarefaId] }),
  });
}

export function useValidarComprovacao(tarefaId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, aprovar }) => comprovacaoApi.validarComprovacao(id, aprovar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovacoes', tarefaId] });
      queryClient.invalidateQueries({ queryKey: ['pontuacao'] });
    },
  });
}
