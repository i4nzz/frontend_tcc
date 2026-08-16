import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as categoriaApi from '../api/categoriaFinanceira';
import * as mesadaApi from '../api/mesada';
import * as registroApi from '../api/registroFinanceiro';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias-financeiras'],
    queryFn: async () => (await categoriaApi.listarCategorias()).data ?? [],
  });
}

export function useCriarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriaApi.criarCategoria,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias-financeiras'] }),
  });
}

export function useMesadasPorFilho(filhoId) {
  return useQuery({
    queryKey: ['mesadas', filhoId],
    queryFn: async () => (await mesadaApi.listarMesadasPorFilho(filhoId)).data ?? [],
    enabled: !!filhoId,
  });
}

export function useCriarMesada(filhoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mesadaApi.criarMesada,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mesadas', filhoId] }),
  });
}

export function useRegistrosPorFilho(filhoId) {
  return useQuery({
    queryKey: ['registros-financeiros', filhoId],
    queryFn: async () => (await registroApi.listarRegistrosPorFilho(filhoId)).data ?? [],
    enabled: !!filhoId,
  });
}

export function useCriarRegistroFinanceiro(filhoId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registroApi.criarRegistroFinanceiro,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registros-financeiros', filhoId] }),
  });
}
