import { API_BASE_URL } from '../config/env';
import { readApiResponse } from '../utils/apiResponse';
import { ApiError } from './errors';

// Para endpoints públicos (login, cadastro, confirmação de e-mail, etc.) que
// não devem passar pelo interceptor de token/refresh de src/api/client.js.
export async function publicRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const { data, message } = await readApiResponse(response);

  if (!response.ok) {
    throw new ApiError(message || 'Ocorreu um erro inesperado.', { status: response.status });
  }

  return { data, message, status: response.status };
}
