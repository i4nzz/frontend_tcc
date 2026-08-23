export const PerfilUsuario = { PAI: 1, FILHO: 2 };

export const PerfilUsuarioLabel = { 1: 'Pai', 2: 'Filho' };

export const StatusValidacaoTarefa = {
  PENDENTE: 1,
  APROVADA: 2,
  REPROVADA: 3,
};

export const StatusValidacaoTarefaLabel = {
  1: 'Pendente',
  2: 'Aprovada',
  3: 'Reprovada',
};

export const TipoPontuacao = { GANHO: 1, RESGATE: 2 };

// StatusTarefaEnum — calculado pelo backend a cada consulta (Prazo + comprovações),
// não é um campo gravado no banco. Ver seção 5 da spec.
export const StatusTarefa = {
  PENDENTE: 1,
  AGUARDANDO_VALIDACAO: 2,
  CONCLUIDA: 3,
  EXPIRADA: 4,
};

export const StatusTarefaLabel = {
  1: 'Pendente',
  2: 'Aguardando',
  3: 'Concluída',
  4: 'Expirada',
};

export const MESES_LABEL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
