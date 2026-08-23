import { publicRequest } from './rawFetch';
import { apiRequest } from './client';

export function cadastrarPai({ nome, email, senha }) {
  return publicRequest('/Usuario/AdicionarUsuarioPai', { method: 'POST', body: { nome, email, senha } });
}

export function esqueciSenha(email) {
  return publicRequest('/Usuario/EsqueciSenha', { method: 'POST', body: { email } });
}

export function redefinirSenha({ token, novaSenha }) {
  return publicRequest('/Usuario/RedefinirSenha', { method: 'POST', body: { token, novaSenha } });
}

export function adicionarFilho({ nome, email, senha, dataNascimento }) {
  return apiRequest('/Usuario/AdicionarFilho', {
    method: 'POST',
    body: { nome, email, senha, dataNascimento },
  });
}

export function obterUsuarios() {
  return apiRequest('/Usuario/ObterTodos');
}

export function listarMeusFilhos() {
  return apiRequest('/Usuario/MeusFilhos');
}

export function obterMeuPerfil() {
  return apiRequest('/Usuario/MeuPerfil');
}
