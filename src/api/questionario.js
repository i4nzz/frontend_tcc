import { apiRequest } from './client';

export function iniciarQuestionario(quantidade) {
  return apiRequest(`/Questionario/Iniciar?quantidade=${quantidade}`);
}

export function responderPergunta(payload) {
  return apiRequest('/Questionario/Responder', { method: 'POST', body: payload });
}
