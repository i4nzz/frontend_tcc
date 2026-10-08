import { apiRequest } from './client';

export function obterRelatorioPorFilho(filhoId, dias) {
  const periodo = dias ? `?dias=${dias}` : '';
  return apiRequest(`/Relatorio/ObterPorFilho/${filhoId}${periodo}`);
}
