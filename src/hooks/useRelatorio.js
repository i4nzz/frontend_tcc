import { useQuery } from '@tanstack/react-query';
import * as relatorioApi from '../api/relatorio';

// Enquanto a tela está aberta o acompanhamento se atualiza sozinho: cada
// resposta do filho no questionário aparece em até meio minuto.
const ATUALIZACAO_AUTOMATICA_MS = 30 * 1000;

export function useRelatorioFilho(filhoId, dias, { telaVisivel = true } = {}) {
  return useQuery({
    queryKey: ['relatorio', filhoId, dias ?? 'tudo'],
    queryFn: async () => (await relatorioApi.obterRelatorioPorFilho(filhoId, dias)).data ?? null,
    enabled: !!filhoId,
    refetchInterval: telaVisivel ? ATUALIZACAO_AUTOMATICA_MS : false,
    placeholderData: (anterior) => anterior,
  });
}
