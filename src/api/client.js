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

// Codifica em base64 sem passar por Blob/FileReader (nem depender de `btoa`, que
// não é garantido no runtime do Hermes) — o Blob nativo do RN é lento e gera o
// aviso "Response.blob() is using React Native's Blob...".
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let resultado = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1];
    const b3 = bytes[i + 2];

    resultado += BASE64_CHARS[b1 >> 2];
    resultado += BASE64_CHARS[((b1 & 0x03) << 4) | (b2 >> 4 || 0)];
    resultado += i + 1 < bytes.length ? BASE64_CHARS[((b2 & 0x0f) << 2) | (b3 >> 6 || 0)] : '=';
    resultado += i + 2 < bytes.length ? BASE64_CHARS[b3 & 0x3f] : '=';
  }

  return resultado;
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

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = await response.arrayBuffer();
  return `data:${contentType};base64,${arrayBufferToBase64(buffer)}`;
}
