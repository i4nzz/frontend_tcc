export const QUANTIDADE_PERGUNTAS = 10;

// Rótulos de exibição das categorias da coleção bancoQuestionario. Uma categoria
// nova no banco ainda aparece, com o nome separado a partir do camelCase.
const CATEGORIAS = {
  EducacaoFinanceira: { emoji: '💰', nome: 'Educação financeira' },
  TarefasDomesticas: { emoji: '🧹', nome: 'Tarefas domésticas' },
  TomadaDeDecisao: { emoji: '🤔', nome: 'Tomada de decisão' },
  Responsabilidade: { emoji: '🤝', nome: 'Responsabilidade' },
};

export function categoriaDoQuestionario(chave) {
  if (CATEGORIAS[chave]) return CATEGORIAS[chave];
  const nome = String(chave ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return { emoji: '📚', nome: nome ? nome[0].toUpperCase() + nome.slice(1) : 'Geral' };
}

export const CATEGORIAS_DO_QUESTIONARIO = Object.keys(CATEGORIAS).map((chave) => ({
  chave,
  ...CATEGORIAS[chave],
}));

export const LETRAS_ALTERNATIVAS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Frases do mascote, escolhidas pela posição da pergunta para não repetir em sequência.
export const FALAS_PERGUNTA = [
  'Vamos ver se você sabe!',
  'Essa é boa!',
  'Pense com calma...',
  'Lá vem mais uma!',
  'Você consegue!',
];

export const FALAS_ACERTO = ['🎉 Muito bem!', '🎉 Mandou bem!', '🎉 Isso aí!'];

export const FALAS_ERRO = ['💡 Quase!', '💡 Boa tentativa!', '💡 Foi por pouco!'];

export function falaDaVez(falas, indice) {
  return falas[indice % falas.length];
}
