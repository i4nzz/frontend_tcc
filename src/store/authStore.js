import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { publicRequest } from '../api/rawFetch';
import { getUserIdFromToken } from '../utils/jwtClaims';

const ACCESS_TOKEN_KEY = 'taskkids.accessToken';
const REFRESH_TOKEN_KEY = 'taskkids.refreshToken';
const USER_KEY = 'taskkids.user';

async function persistSession({ accessToken, refreshToken, user }) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

function mapLoginResponse(data) {
  return {
    tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken },
    user: { nome: data.nome, email: data.email, perfil: data.perfil },
  };
}

export const useAuthStore = create((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  user: null,
  isHydrated: false,
  refreshPromise: null,

  async hydrate() {
    const [accessToken, refreshToken, userRaw] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);

    if (!accessToken || !refreshToken || !userRaw) {
      set({ isHydrated: true });
      return;
    }

    set({ accessToken, refreshToken, userId: getUserIdFromToken(accessToken), user: JSON.parse(userRaw) });

    const refreshed = await get().refreshTokens();
    if (!refreshed) {
      await get().logout();
    }
    set({ isHydrated: true });
  },

  async login(email, senha) {
    const { data } = await publicRequest('/Auth/Login', { method: 'POST', body: { email, senha } });
    const { tokens, user } = mapLoginResponse(data);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: getUserIdFromToken(tokens.accessToken),
      user,
    });
    await persistSession({ ...tokens, user });
    return user;
  },

  // Coalesce chamadas concorrentes: se duas requisições tomam 401 ao mesmo
  // tempo, ambas aguardam o mesmo refresh em vez de disparar dois refreshes.
  async refreshTokens() {
    const inFlight = get().refreshPromise;
    if (inFlight) return inFlight;

    const currentRefreshToken = get().refreshToken;
    if (!currentRefreshToken) return false;

    const promise = (async () => {
      try {
        const { data } = await publicRequest('/Auth/RefreshToken', {
          method: 'POST',
          body: { refreshToken: currentRefreshToken },
        });
        const { tokens, user } = mapLoginResponse(data);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          userId: getUserIdFromToken(tokens.accessToken),
          user,
        });
        await persistSession({ ...tokens, user });
        return true;
      } catch {
        return false;
      } finally {
        set({ refreshPromise: null });
      }
    })();

    set({ refreshPromise: promise });
    return promise;
  },

  async logout() {
    set({ accessToken: null, refreshToken: null, userId: null, user: null });
    await clearSession();
  },
}));
