import { apiRequest } from './client';

export function listarRegistrosPorFilho(filhoId) {
  return apiRequest(`/RegistroFinanceiro/ObterPorFilho/${filhoId}`);
}

export function criarRegistroFinanceiro(payload) {
  return apiRequest('/RegistroFinanceiro/Criar', { method: 'POST', body: payload });
}

export function obterResumoFinanceiro(filhoId) {
  return apiRequest(`/RegistroFinanceiro/ObterResumo/${filhoId}`);
}
