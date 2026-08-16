import { publicRequest } from './rawFetch';

export function confirmarEmail(token) {
  return publicRequest('/Auth/ConfirmarEmail', { method: 'POST', body: { token } });
}
