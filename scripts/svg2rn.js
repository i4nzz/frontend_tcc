// Converte mascote_rig.svg nas peças react-native-svg usadas pela tela de login.
// Roda uma vez; a saída é versionada. Uso:
//   node svg2rn.js <entrada.svg> <saida.js>
const fs = require('fs');

// `sax` entra junto com as dependencias do Expo. Como este script so roda
// para regerar MascotePolvoSvg.js (cuja saida e versionada), a falta dele
// nao afeta o app.
const sax = require('sax');

const [, , ENTRADA, SAIDA] = process.argv;
if (!ENTRADA || !SAIDA) {
  console.error('uso: node scripts/svg2rn.js <entrada.svg> <saida.js>');
  process.exit(1);
}

// ---------------------------------------------------------------- parse

function parse(xml) {
  const parser = sax.parser(true, { trim: false, normalize: false });
  const raiz = { name: '#root', attrs: {}, filhos: [] };
  const pilha = [raiz];

  parser.onopentag = (no) => {
    const atual = { name: no.name, attrs: no.attributes, filhos: [], pai: pilha[pilha.length - 1] };
    pilha[pilha.length - 1].filhos.push(atual);
    pilha.push(atual);
  };
  parser.onclosetag = () => pilha.pop();
  parser.write(xml).close();
  return raiz;
}

function acharPorId(no, id) {
  if (no.attrs && no.attrs.id === id) return no;
  for (const f of no.filhos || []) {
    const achado = acharPorId(f, id);
    if (achado) return achado;
  }
  return null;
}

// ---------------------------------------------------------------- atributos

const ELEMENTOS = { path: 'Path', ellipse: 'Ellipse', circle: 'Circle', g: 'G', clipPath: 'ClipPath' };

const RENOMEADOS = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
};

// Atributos de pintura que os filhos herdam — usados para achatar ancestrais.
const HERDAVEIS = new Set(Object.keys(RENOMEADOS).concat(['fill', 'stroke', 'opacity']));
HERDAVEIS.delete('clip-path');
HERDAVEIS.delete('clip-rule');

const IGNORADOS = new Set(['id', 'class', 'class-', 'data-nome', 'data-pivo', 'data-estados']);

function propsDe(attrs, { manterId = false } = {}) {
  const props = [];
  for (const [chave, valor] of Object.entries(attrs)) {
    if (IGNORADOS.has(chave) && !(manterId && chave === 'id')) continue;
    if (chave === 'transform') {
      // Só existe rotate(a cx cy) no arquivo — vira rotation/originX/originY.
      const m = /^rotate\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\)$/.exec(valor);
      if (!m) throw new Error(`transform não suportado: ${valor}`);
      props.push(`rotation="${m[1]}"`, `originX="${m[2]}"`, `originY="${m[3]}"`);
      continue;
    }
    props.push(`${RENOMEADOS[chave] || chave}="${valor}"`);
  }
  return props;
}

function herdadosDe(no) {
  // Atributos de pintura dos ancestrais que o próprio nó não redefine.
  const herdados = {};
  for (let pai = no.pai; pai && pai.name !== '#root'; pai = pai.pai) {
    for (const [chave, valor] of Object.entries(pai.attrs)) {
      if (!HERDAVEIS.has(chave)) continue;
      if (chave in no.attrs || chave in herdados) continue;
      herdados[chave] = valor;
    }
  }
  return herdados;
}

// ---------------------------------------------------------------- emissão

function emitir(no, nivel, pular = () => false) {
  const ident = '  '.repeat(nivel);
  if (pular(no)) return '';

  const Tag = ELEMENTOS[no.name];
  if (!Tag) throw new Error(`elemento não suportado: ${no.name}`);

  const props = propsDe(no.attrs, { manterId: no.name === 'clipPath' });
  const abertura = props.length ? `<${Tag} ${props.join(' ')}` : `<${Tag}`;

  if (!no.filhos.length) return `${ident}${abertura} />`;

  const filhos = no.filhos.map((f) => emitir(f, nivel + 1, pular)).filter(Boolean);
  return `${ident}${abertura}>\n${filhos.join('\n')}\n${ident}</${Tag}>`;
}

// `conteudo` emite os filhos do nó, achatando wrappers <g class="pose"> sem atributos.
function conteudo(no, nivel, pular) {
  const filhos = no.filhos.length === 1 && no.filhos[0].attrs.class === 'pose' ? no.filhos[0].filhos : no.filhos;
  return filhos.map((f) => emitir(f, nivel, pular)).filter(Boolean).join('\n');
}

function componente(nome, corpo) {
  return `export function ${nome}() {\n  return (\n    <>\n${corpo}\n    </>\n  );\n}\n`;
}

// ---------------------------------------------------------------- alvos

const svg = parse(fs.readFileSync(ENTRADA, 'utf8'));

// `self`: o próprio nó (achatando ancestrais de pintura num <G> externo).
// `conteudo`: só os filhos, sem o wrapper do nó.
const ALVOS = [
  { nome: 'Cabeca', id: 'corpo-cabeca', modo: 'conteudo' },
  {
    nome: 'TentaculosFundo',
    id: 'tentaculos-fundo',
    modo: 'conteudo',
    pular: (no) => String(no.attrs.id || '').startsWith('raiz-tentaculo-'),
  },
  { nome: 'OmbroTentaculo7', id: 'raiz-tentaculo-7-braco-direito', modo: 'conteudo' },
  { nome: 'OmbroTentaculo1', id: 'raiz-tentaculo-1-curvo-esquerdo', modo: 'conteudo' },
  { nome: 'Bochechas', id: 'bochechas', modo: 'conteudo' },
  { nome: 'EscleraEsquerda', id: 'esclera-esquerda', modo: 'self' },
  { nome: 'EscleraDireita', id: 'esclera-direita', modo: 'self' },
  { nome: 'PupilaEsquerda', id: 'pupila-esquerda', modo: 'conteudo' },
  { nome: 'PupilaDireita', id: 'pupila-direita', modo: 'conteudo' },
  { nome: 'CiliosEsquerdo', id: 'cilios-esquerdo', modo: 'self' },
  { nome: 'CiliosDireito', id: 'cilios-direito', modo: 'self' },
  { nome: 'OlhoEsquerdoFechado', id: 'olho-esquerdo-fechado-calmo', modo: 'self' },
  { nome: 'OlhoDireitoFechado', id: 'olho-direito-fechado-calmo', modo: 'self' },
  { nome: 'Sobrancelhas', id: 'sobrancelhas-normal', modo: 'self' },
  { nome: 'Boca', id: 'boca-sorriso', modo: 'self' },
  { nome: 'Tentaculo7', id: 'tentaculo-7-braco-direito', modo: 'conteudo' },
  { nome: 'Tentaculo1', id: 'tentaculo-1-curvo-esquerdo', modo: 'conteudo' },
  // Estado triste: sobrancelhas, boca e lágrima caídas.
  { nome: 'SobrancelhasTriste', id: 'sobrancelhas-triste', modo: 'self' },
  { nome: 'BocaTriste', id: 'boca-triste', modo: 'self' },
  { nome: 'Lagrima', id: 'lagrima', modo: 'self' },
];

const partes = ALVOS.map(({ nome, id, modo, pular }) => {
  const no = acharPorId(svg, id);
  if (!no) throw new Error(`id não encontrado: ${id}`);

  if (modo === 'conteudo') return componente(nome, conteudo(no, 3, pular || (() => false)));

  // modo 'self': envolve num <G> com os atributos de pintura herdados dos ancestrais.
  const herdados = herdadosDe(no);
  const corpo = emitir(no, Object.keys(herdados).length ? 4 : 3, pular || (() => false));
  if (!Object.keys(herdados).length) return componente(nome, corpo);
  return componente(nome, `      <G ${propsDe(herdados).join(' ')}>\n${corpo}\n      </G>`);
});

// Os clipPaths das escleras (usados para a pupila não escapar do olho).
const defs = acharPorId(svg, 'recorte-esclera-esquerdo').pai;
const recortes = defs.filhos
  .filter((f) => String(f.attrs.id || '').startsWith('recorte-esclera-'))
  .map((f) => emitir(f, 3))
  .join('\n');

const saida = `// GERADO por scripts/svg2rn.js a partir de mascote_rig.svg — não editar à mão.
// Peças do estado "normal" do rig, convertidas para react-native-svg.
// Cada export é um fragmento posicionado na viewBox ${svg.filhos.find((f) => f.name === 'svg').attrs.viewBox} —
// a ordem de composição fica em MascotePolvo.js.
import { Circle, ClipPath, Ellipse, G, Path } from 'react-native-svg';

export const VIEW_BOX = '${svg.filhos.find((f) => f.name === 'svg').attrs.viewBox}';

export function RecortesDasEscleras() {
  return (
    <>
${recortes}
    </>
  );
}

${partes.join('\n')}`;

fs.writeFileSync(SAIDA, saida);
console.log(`ok: ${SAIDA} (${(saida.length / 1024).toFixed(1)} KB, ${ALVOS.length + 1} exports)`);
