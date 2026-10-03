import { ScreenContainer } from '../../components/ScreenContainer';
import { EmptyState } from '../../components/EmptyState';

// Módulo de jogos ainda sem conteúdo. A aba não chega a ser exibida: o toque
// nela abre o modal de "em desenvolvimento" (ver FilhoAreaTabs).
export function JogosScreen() {
  return (
    <ScreenContainer>
      <EmptyState icon="game-controller-outline" title="Jogos em breve" />
    </ScreenContainer>
  );
}
