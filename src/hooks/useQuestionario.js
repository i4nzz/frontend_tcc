import { useCallback, useEffect, useRef, useState } from 'react';
import * as questionarioApi from '../api/questionario';
import { QUANTIDADE_PERGUNTAS } from '../constants/questionario';

export const FASES = {
  INTRO: 'INTRO',
  CARREGANDO: 'CARREGANDO',
  FALHA_CARREGAMENTO: 'FALHA_CARREGAMENTO',
  // A pergunta e as alternativas estão entrando: toques ainda bloqueados.
  PERGUNTA: 'PERGUNTA',
  RESPONDENDO: 'RESPONDENDO',
  VERIFICANDO: 'VERIFICANDO',
  // O mascote reage antes de o balão trocar para o feedback.
  ACERTO: 'ACERTO',
  ERRO: 'ERRO',
  FEEDBACK: 'FEEDBACK',
  RESULTADO: 'RESULTADO',
};

// O "Preparando seu desafio..." fica um mínimo na tela, senão vira um piscar.
const CARREGAMENTO_MINIMO_MS = 900;
const REACAO_ANTES_DO_FEEDBACK_MS = 650;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tempo de entrada da pergunta: balão, texto e alternativas uma a uma
// (precisa bater com os atrasos usados em QuestionarioJogo).
export function tempoDeEntrada(quantidadeOpcoes, reduzirMovimento) {
  if (reduzirMovimento) return 150;
  return 450 + quantidadeOpcoes * 90 + 260;
}

export function useQuestionario({ reduzirMovimento }) {
  const [fase, setFase] = useState(FASES.INTRO);
  const [perguntas, setPerguntas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [aviso, setAviso] = useState(null);

  // Cada partida tem um número: respostas da API que chegam depois de "Voltar"
  // ou "Jogar novamente" pertencem a uma partida antiga e são ignoradas.
  const partida = useRef(0);
  const timer = useRef(null);

  const limparTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      partida.current += 1;
      limparTimer();
    },
    [limparTimer]
  );

  const perguntaAtual = perguntas[indice] ?? null;

  // Libera os toques só depois que tudo terminou de entrar.
  useEffect(() => {
    if (fase !== FASES.PERGUNTA || !perguntaAtual) return undefined;
    const t = setTimeout(
      () => setFase(FASES.RESPONDENDO),
      tempoDeEntrada(perguntaAtual.opcoes.length, reduzirMovimento)
    );
    return () => clearTimeout(t);
  }, [fase, perguntaAtual, reduzirMovimento]);

  const iniciar = useCallback(async () => {
    limparTimer();
    const minhaPartida = ++partida.current;
    setFase(FASES.CARREGANDO);
    setPerguntas([]);
    setIndice(0);
    setEscolha(null);
    setResultado(null);
    setRespostas([]);
    setPontos(0);
    setAviso(null);

    try {
      const [{ data }] = await Promise.all([
        questionarioApi.iniciarQuestionario(QUANTIDADE_PERGUNTAS),
        esperar(CARREGAMENTO_MINIMO_MS),
      ]);
      if (minhaPartida !== partida.current) return;

      if (!data?.length) {
        setFase(FASES.FALHA_CARREGAMENTO);
        return;
      }
      setPerguntas(data);
      setFase(FASES.PERGUNTA);
    } catch {
      if (minhaPartida !== partida.current) return;
      setFase(FASES.FALHA_CARREGAMENTO);
    }
  }, [limparTimer]);

  const responder = useCallback(
    async (opcao) => {
      if (fase !== FASES.RESPONDENDO || !perguntaAtual) return;
      const minhaPartida = partida.current;
      setEscolha(opcao);
      setAviso(null);
      setFase(FASES.VERIFICANDO);

      try {
        const { data } = await questionarioApi.responderPergunta({
          perguntaId: perguntaAtual.id,
          respostaEscolhida: opcao,
        });
        if (minhaPartida !== partida.current) return;

        setResultado(data);
        setRespostas((anteriores) => [...anteriores, data]);
        setPontos((total) => total + (data.pontosGanhos ?? 0));
        setFase(data.correta ? FASES.ACERTO : FASES.ERRO);

        timer.current = setTimeout(() => {
          timer.current = null;
          setFase(FASES.FEEDBACK);
        }, reduzirMovimento ? 0 : REACAO_ANTES_DO_FEEDBACK_MS);
      } catch {
        if (minhaPartida !== partida.current) return;
        // Sem conferir no servidor não há resultado: devolve a vez para a criança.
        setEscolha(null);
        setAviso('Não consegui conferir sua resposta. Toque de novo!');
        setFase(FASES.RESPONDENDO);
      }
    },
    [fase, perguntaAtual, reduzirMovimento]
  );

  const proxima = useCallback(() => {
    if (fase !== FASES.FEEDBACK) return;
    if (indice + 1 >= perguntas.length) {
      setFase(FASES.RESULTADO);
      return;
    }
    setIndice((atual) => atual + 1);
    setEscolha(null);
    setResultado(null);
    setFase(FASES.PERGUNTA);
  }, [fase, indice, perguntas.length]);

  const voltar = useCallback(() => {
    partida.current += 1;
    limparTimer();
    setFase(FASES.INTRO);
  }, [limparTimer]);

  return {
    fase,
    perguntaAtual,
    indice,
    total: perguntas.length,
    escolha,
    resultado,
    respostas,
    pontos,
    aviso,
    iniciar,
    responder,
    proxima,
    voltar,
  };
}
