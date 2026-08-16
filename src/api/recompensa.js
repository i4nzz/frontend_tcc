import { apiRequest } from './client';

export function listarRecompensasPorFilho(filhoId) {
  return apiRequest(`/Recompensa/ObterPorFilho/${filhoId}`);
}

export function obterRecompensa(id) {
  return apiRequest(`/Recompensa/ObterPorId/${id}`);
}

export function criarRecompensa(payload) {
  return apiRequest('/Recompensa/Criar', { method: 'POST', body: payload });
}

export function atualizarRecompensa(id, payload) {
  return apiRequest(`/Recompensa/Atualizar/${id}`, { method: 'PUT', body: payload });
}

export function removerRecompensa(id) {
  return apiRequest(`/Recompensa/Remover/${id}`, { method: 'DELETE' });
}

export function resgatarRecompensa(filhoId, recompensaId) {
  return apiRequest(`/Recompensa/Resgatar/${filhoId}/${recompensaId}`, { method: 'POST' });
}

export function listarRecompensasResgatadas(filhoId) {
  return apiRequest(`/Recompensa/ObterResgatadas/${filhoId}`);
}
