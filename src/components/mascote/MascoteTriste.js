import { memo } from 'react';
import Svg, { Defs, G } from 'react-native-svg';
import {
  Bochechas,
  BocaTriste,
  Cabeca,
  CiliosDireito,
  CiliosEsquerdo,
  EscleraDireita,
  EscleraEsquerda,
  Lagrima,
  OmbroTentaculo1,
  OmbroTentaculo7,
  PupilaDireita,
  PupilaEsquerda,
  RecortesDasEscleras,
  SobrancelhasTriste,
  Tentaculo1,
  Tentaculo7,
  TentaculosFundo,
  VIEW_BOX,
} from './MascotePolvoSvg';

// Versão estática do mascote no estado "triste" do rig: sem animação, só para
// acompanhar mensagens (ex.: módulo em desenvolvimento). Usa as mesmas peças
// do login, com as sobrancelhas, a boca e a lágrima caídas.
function Triste({ largura = 180 }) {
  const [, , rigLargura, rigAltura] = VIEW_BOX.split(' ').map(Number);
  const altura = (largura * rigAltura) / rigLargura;
  const svg = { width: largura, height: altura, viewBox: VIEW_BOX };

  return (
    <Svg {...svg} accessible={false} importantForAccessibility="no-hide-descendants">
      <Defs>
        <RecortesDasEscleras />
      </Defs>
      <Cabeca />
      <TentaculosFundo />
      <OmbroTentaculo1 />
      <OmbroTentaculo7 />
      <Bochechas />
      <EscleraEsquerda />
      <G clipPath="url(#recorte-esclera-esquerdo)">
        <PupilaEsquerda />
      </G>
      <EscleraDireita />
      <G clipPath="url(#recorte-esclera-direito)">
        <PupilaDireita />
      </G>
      <CiliosEsquerdo />
      <CiliosDireito />
      <SobrancelhasTriste />
      <BocaTriste />
      <Tentaculo7 />
      <Tentaculo1 />
      <Lagrima />
    </Svg>
  );
}

export const MascoteTriste = memo(Triste);
