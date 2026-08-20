import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tarefaApi from '../api/tarefa';
import { useAuthStore } from '../store/authStore';

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

// GET /Tarefa/{tarefaId} é 🔒Pai (ver spec) — Filho não pode chamá-lo. Pro
// Filho, deriva a tarefa da lista de /Tarefa/ObterTodas (🔒 qualquer
// autenticado, já filtrada pela própria família), que ele já tem permissão
// de buscar.
export function useTarefa(tarefaId) {
  const perfil = useAuthStore((state) => state.user?.perfil);
  const isPai = perfil === 'Pai';

  const paiQuery = useQuery({
    queryKey: ['tarefa', tarefaId],
    queryFn: async () => (await tarefaApi.obterTarefa(tarefaId)).data,
    enabled: isPai && !!tarefaId,
  });

  const todasQuery = useTarefas({ enabled: !isPai && !!tarefaId });

  if (isPai) return paiQuery;
  return { ...todasQuery, data: todasQuery.data?.find((t) => t.tarefaId === tarefaId) };
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
