import { API_BASE_URL } from '../config/env';
import { useAuthStore } from '../store/authStore';
import { readApiResponse } from '../utils/apiResponse';
import { ApiError } from './errors';

function buildHeaders({ isFormData, hasBody }) {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (hasBody && !isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

async function handleUnauthorized() {
  const refreshed = await useAuthStore.getState().refreshTokens();
  if (!refreshed) {
    await useAuthStore.getState().logout();
  }
  return refreshed;
}

export async function apiRequest(path, { method = 'GET', body, isFormData = false, retry = true } = {}) {
  const hasBody = body !== undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders({ isFormData, hasBody }),
    body: hasBody ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 401 && retry) {
    const refreshed = await handleUnauthorized();
    if (refreshed) {
      return apiRequest(path, { method, body, isFormData, retry: false });
    }
    throw new ApiError('Sessão expirada. Faça login novamente.', { status: 401, isUnauthorized: true });
  }

  const { data, message } = await readApiResponse(response);

  if (!response.ok) {
    throw new ApiError(message || 'Ocorreu um erro inesperado.', { status: response.status });
  }

  return { data, message, status: response.status };
}

function blobToDataUri(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ApiError('Não foi possível ler a imagem recebida.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Endpoints de foto exigem Bearer token, então não dá pra usar <Image source={{uri}}>
// direto com a URL do backend — baixamos os bytes autenticados e convertemos pra data URI.
export async function fetchAuthenticatedImage(path, { retry = true } = {}) {
  const accessToken = useAuthStore.getState().accessToken;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (response.status === 401 && retry) {
    const refreshed = await handleUnauthorized();
    if (refreshed) {
      return fetchAuthenticatedImage(path, { retry: false });
    }
    throw new ApiError('Sessão expirada. Faça login novamente.', { status: 401, isUnauthorized: true });
  }

  if (!response.ok) {
    throw new ApiError('Não foi possível carregar a imagem.', { status: response.status });
  }

  const blob = await response.blob();
  return blobToDataUri(blob);
}
