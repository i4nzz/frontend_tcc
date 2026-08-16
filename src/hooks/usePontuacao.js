import { useQuery } from '@tanstack/react-query';
import * as pontuacaoApi from '../api/pontuacao';

export function usePontuacaoPorFilho(filhoId) {
  return useQuery({
    queryKey: ['pontuacao', 'historico', filhoId],
    queryFn: async () => (await pontuacaoApi.obterPontuacaoPorFilho(filhoId)).data ?? [],
    enabled: !!filhoId,
  });
}

export function useSaldoTotal(filhoId) {
  return useQuery({
    queryKey: ['pontuacao', 'saldo', filhoId],
    queryFn: async () => (await pontuacaoApi.obterSaldoTotal(filhoId)).data ?? 0,
    enabled: !!filhoId,
  });
}
