import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as comprovacaoApi from '../api/comprovacao';

export function useComprovacoesPorTarefa(tarefaId) {
  return useQuery({
    queryKey: ['comprovacoes', tarefaId],
    queryFn: async () => (await comprovacaoApi.listarComprovacoesPorTarefa(tarefaId)).data ?? [],
    enabled: !!tarefaId,
  });
}

export function useFotoComprovacao(comprovacaoId) {
  return useQuery({
    queryKey: ['comprovacao-foto', comprovacaoId],
    queryFn: () => comprovacaoApi.obterFotoComprovacao(comprovacaoId),
    enabled: !!comprovacaoId,
    staleTime: Infinity,
  });
}

// Enviar/validar comprovação muda o `status` derivado da tarefa (ver seção 5
// da spec), então as queries de tarefa também precisam ser invalidadas —
// senão a lista/detalhe continuam mostrando o status antigo até um refresh manual.
export function useEnviarComprovacao(tarefaId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: comprovacaoApi.enviarComprovacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovacoes', tarefaId] });
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      queryClient.invalidateQueries({ queryKey: ['tarefa', tarefaId] });
    },
  });
}

export function useValidarComprovacao(tarefaId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, aprovar }) => comprovacaoApi.validarComprovacao(id, aprovar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprovacoes', tarefaId] });
      queryClient.invalidateQueries({ queryKey: ['pontuacao'] });
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      queryClient.invalidateQueries({ queryKey: ['tarefa', tarefaId] });
    },
  });
}
