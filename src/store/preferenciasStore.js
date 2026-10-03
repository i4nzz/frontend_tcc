import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TONALIDADES, TONALIDADE_PADRAO } from '../theme/palettes';

// Preferências do aparelho: ficam só neste dispositivo, não vão para a API.
const TONALIDADE_KEY = 'taskkids.preferences.tonalidade';

export const usePreferenciasStore = create((set) => ({
  tonalidadeId: TONALIDADE_PADRAO,
  isHydrated: false,

  async hydrate() {
    try {
      const salva = await AsyncStorage.getItem(TONALIDADE_KEY);
      if (salva && TONALIDADES[salva]) set({ tonalidadeId: salva });
    } catch {
      // Falha ao ler a preferência não pode impedir o app de abrir: segue no padrão.
    } finally {
      set({ isHydrated: true });
    }
  },

  async definirTonalidade(id) {
    if (!TONALIDADES[id]) return;
    // Aplica antes de gravar: a troca é imediata mesmo se o armazenamento falhar.
    set({ tonalidadeId: id });
    try {
      await AsyncStorage.setItem(TONALIDADE_KEY, id);
    } catch {
      // Sem persistência a escolha vale até fechar o app; não é um erro para o usuário.
    }
  },
}));

// Paleta ativa. Componentes que usam a cor de destaque chamam este hook no
// render (em vez de ler `colors` no escopo do módulo), para reagir à troca.
export function useTema() {
  const tonalidadeId = usePreferenciasStore((state) => state.tonalidadeId);
  return TONALIDADES[tonalidadeId];
}
