import { apiRequest } from './client';
import { ApiError } from './errors';

export function listarTarefas() {
  return apiRequest('/Tarefa/ObterTodas');
}

export function listarTarefasPorFilho(filhoId) {
  return apiRequest(`/Tarefa/filho/${filhoId}`);
}

export function obterTarefa(tarefaId) {
  return apiRequest(`/Tarefa/${tarefaId}`);
}

export function criarTarefa(payload) {
  return apiRequest('/Tarefa/CriarTarefa', { method: 'POST', body: payload });
}

function pareceMensagemDeErro(mensagem) {
  if (!mensagem) return false;
  const texto = mensagem.toLowerCase();
  return ['permiss', 'inválid', 'invalid', 'erro', 'não encontrad', 'nao encontrad'].some((kw) =>
    texto.includes(kw)
  );
}

export async function atualizarTarefa(tarefaId, payload) {
  const { message } = await apiRequest(`/Tarefa/${tarefaId}`, { method: 'PUT', body: payload });
  if (pareceMensagemDeErro(message)) {
    throw new ApiError(message || 'Não foi possível atualizar a tarefa.');
  }
  return { message };
}

export async function removerTarefa(tarefaId) {
  const { message } = await apiRequest(`/Tarefa/${tarefaId}`, { method: 'DELETE' });
  if (pareceMensagemDeErro(message)) {
    throw new ApiError(message || 'Não foi possível remover a tarefa.');
  }
  return { message };
}
