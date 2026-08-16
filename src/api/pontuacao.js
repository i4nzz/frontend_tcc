import { apiRequest } from './client';

export function obterPontuacaoPorFilho(filhoId) {
  return apiRequest(`/Pontuacao/ObterPorFilho/${filhoId}`);
}

export function obterSaldoTotal(filhoId) {
  return apiRequest(`/Pontuacao/ObterTotal/${filhoId}`);
}

export function adicionarPontuacao(payload) {
  return apiRequest('/Pontuacao/Adicionar', { method: 'POST', body: payload });
}
