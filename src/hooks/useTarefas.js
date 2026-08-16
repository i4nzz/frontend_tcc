import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tarefaApi from '../api/tarefa';

export function useTarefas({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => (await tarefaApi.listarTarefas()).data ?? [],
    enabled,
  });
}

export function useTarefasPorFilho(filhoId) {
  return useQuery({
    queryKey: ['tarefas', 'filho', filhoId],
    queryFn: async () => (await tarefaApi.listarTarefasPorFilho(filhoId)).data ?? [],
    enabled: !!filhoId,
  });
}

export function useTarefa(tarefaId) {
  return useQuery({
    queryKey: ['tarefa', tarefaId],
    queryFn: async () => (await tarefaApi.obterTarefa(tarefaId)).data,
    enabled: !!tarefaId,
  });
}

export function useCriarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tarefaApi.criarTarefa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarefas'] }),
  });
}

export function useAtualizarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tarefaId, payload }) => tarefaApi.atualizarTarefa(tarefaId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarefas'] }),
  });
}

export function useRemoverTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tarefaApi.removerTarefa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tarefas'] }),
  });
}
