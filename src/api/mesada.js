import { apiRequest } from './client';

export function listarMesadasPorFilho(filhoId) {
  return apiRequest(`/Mesada/ObterPorFilho/${filhoId}`);
}

export function criarMesada(payload) {
  return apiRequest('/Mesada/Criar', { method: 'POST', body: payload });
}
