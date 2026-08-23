import { apiRequest, fetchAuthenticatedImage } from './client';

export function listarComprovacoesPorTarefa(tarefaId) {
  return apiRequest(`/ComprovacaoTarefa/tarefa/${tarefaId}`);
}

export function obterComprovacao(id) {
  return apiRequest(`/ComprovacaoTarefa/${id}`);
}

export function enviarComprovacao({ tarefaId, foto }) {
  const formData = new FormData();
  formData.append('TarefaId', String(tarefaId));
  formData.append('Foto', foto);
  return apiRequest('/ComprovacaoTarefa/enviar', { method: 'POST', body: formData, isFormData: true });
}

export function obterFotoComprovacao(id) {
  return fetchAuthenticatedImage(`/ComprovacaoTarefa/${id}/foto`);
}

export function validarComprovacao(id, aprovar) {
  return apiRequest(`/ComprovacaoTarefa/validar/${id}?aprovar=${aprovar ? 'true' : 'false'}`, {
    method: 'POST',
  });
}
