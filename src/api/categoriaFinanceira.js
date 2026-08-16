import { apiRequest } from './client';

export function listarCategorias() {
  return apiRequest('/CategoriaFinanceira/ObterTodas');
}

export function criarCategoria(payload) {
  return apiRequest('/CategoriaFinanceira/Criar', { method: 'POST', body: payload });
}
