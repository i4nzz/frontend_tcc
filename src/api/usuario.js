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

// Endpoint combinado com o Ian (não fazia parte da spec original): GET
// /Usuario/MeusFilhos, 🔒Pai, devolve só os filhos vinculados ao Pai logado
// (via pais_filhos), no mesmo formato cru de RetornoUsuarioDto[] usado por
// ObterTodos — sem esse endpoint não dá pra montar a Home do Pai nem obter o
// filhoId necessário pra Pontuação/Recompensa/Mesada/RegistroFinanceiro.
export function listarMeusFilhos() {
  return apiRequest('/Usuario/MeusFilhos');
}
