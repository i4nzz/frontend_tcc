# Task Kids — App (React Native / Expo)

App mobile do TCC **Task Kids**: gamifica tarefas domésticas/escolares para crianças e introduz educação financeira infantil através do acompanhamento da mesada. Este repositório é o **frontend**; a API consumida por ele vive em outro projeto (`GestaoTarefas.API`, .NET 8).

Fluxo central da aplicação:

1. Um **Pai** cadastra sua conta, confirma o e-mail e cadastra um ou mais **Filhos**.
2. O Pai cria **tarefas** com prazo e pontuação para um filho.
3. O Filho realiza a tarefa e envia uma **foto como comprovação**.
4. O Pai **aprova ou reprova** a comprovação; se aprovada, os pontos são creditados automaticamente.
5. O Filho acumula pontos e pode **resgatar recompensas** cadastradas pelo Pai.
6. Separadamente, existe um módulo **financeiro**: o Pai registra a **mesada** mensal do filho, e Pai/Filho lançam **gastos** vinculados a uma mesada e a uma categoria, com um resumo de gastos por categoria.

---

## Stack

- **React Native + Expo** (SDK 54), JavaScript puro (sem TypeScript), testado via **Expo Go**.
- [`@react-navigation`](https://reactnavigation.org/) (native-stack + bottom-tabs) para navegação.
- [`@tanstack/react-query`](https://tanstack.com/query) para cache e sincronização de dados do servidor.
- [`zustand`](https://github.com/pmndrs/zustand) para o estado global de autenticação.
- `expo-secure-store` para persistir os tokens JWT com segurança.
- `expo-image-picker` para captura/seleção da foto de comprovação de tarefa.

> **Nota de versão**: o projeto está fixado no Expo SDK 54 (não a versão mais nova) porque o app Expo Go do dispositivo de teste ficou preso nessa versão. Veja `AGENTS.md` — assim que o Expo Go do aparelho for atualizado, vale rodar `npm install expo@latest && npx expo install --fix`.

---

## Pré-requisitos

- Node.js `v22.14.0` (ou o LTS ativo mais próximo) e npm `11.x`.
- App **Expo Go** instalado no celular (Android/iOS), ou um emulador Android/simulador iOS.
- A API backend (`GestaoTarefas.API`) rodando localmente — ver seção abaixo.

## Instalação

```bash
npm install
```

## Configuração da URL da API

O app lê a URL base do backend da variável de ambiente `EXPO_PUBLIC_API_URL` (ver `src/config/env.js`). Existem dois arquivos de ambiente:

- **`.env`** — versionado, aponta para `http://localhost:5294` (usado quando o app roda no modo web/emulador na mesma máquina do backend).
- **`.env.local`** — **não versionado**, sobrescreve o anterior. Use para apontar para o IP da sua máquina na rede Wi-Fi quando testar num celular físico via Expo Go, já que `localhost` não resolve para o computador nesse cenário.

```bash
# .env.local
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:5294
```

Como descobrir o IP: rode `ipconfig` (Windows) e use o IPv4 do adaptador Wi-Fi. Esse IP muda a cada rede — atualize o `.env.local` sempre que necessário. No **emulador Android**, use `http://10.0.2.2:5294` em vez do IP da rede.

A API deve estar rodando no perfil **HTTP** (porta `5294`), não HTTPS — evita lidar com certificado autoassinado no Expo Go durante o desenvolvimento.

## Rodando o projeto

```bash
npm start        # abre o Metro/Expo Dev Tools — escaneie o QR code com o Expo Go
npm run android   # abre direto num emulador/dispositivo Android
npm run ios       # abre direto num simulador iOS
npm run web       # roda no navegador (sem CORS configurado no backend — ver observações)
```

---

## Estrutura de pastas

```
src/
├── api/            # Funções de chamada HTTP por módulo (auth, tarefa, comprovacao, pontuacao,
│                    #   recompensa, categoriaFinanceira, mesada, registroFinanceiro, usuario)
│   ├── client.js    # Wrapper de fetch: injeta Bearer token, trata 401 (refresh automático) e
│                    #   normaliza as 3 formas de resposta do backend
│   └── errors.js    # ApiError usado em toda a app para exibir mensagens de erro
├── components/      # Componentes de UI reutilizáveis (Button, Card, TextField, EmptyState, ...)
├── config/          # Leitura de variáveis de ambiente (URL da API)
├── constants/        # Enums espelhados do backend (status de tarefa, meses, etc.)
├── hooks/            # Hooks de React Query por módulo (useTarefas, useFinanceiro, ...)
├── navigation/        # Pilhas de navegação (Auth, Pai, Filho) e deep linking
├── screens/           # Telas, organizadas por área (auth, pai, tarefas, recompensas,
│                       #   pontuacao, financeiro)
├── store/             # Estado global (authStore com zustand — tokens, hidratação, refresh)
├── theme/             # Paleta de cores, espaçamento e tipografia compartilhados
└── utils/             # Helpers (parsing de resposta da API, leitura de claims do JWT)
```

## Navegação e perfis

A navegação raiz (`RootNavigator`) decide a pilha exibida conforme o estado de autenticação:

- **Sem sessão** → `AuthStack` (Login, Cadastro, Verifique seu e-mail, Esqueci minha senha).
- **Logado como Pai** → `PaiNavigator`: lista de filhos, cadastro de filho, área de um filho (tarefas/pontuação/recompensas/financeiro em abas), criação/edição de tarefas e recompensas, novo gasto.
- **Logado como Filho** → `FilhoNavigator`: vai direto para a própria área (mesma tela de abas do Pai, mas sem as ações de edição).

A área de um filho (`FilhoAreaTabs`) reúne em abas: **Tarefas**, **Pontuação**, **Recompensas** e **Financeiro**.

## Autenticação

- `accessToken` e `refreshToken` são salvos com `expo-secure-store` (nunca em `AsyncStorage`).
- Ao abrir o app, `authStore.hydrate()` tenta restaurar a sessão a partir do refresh token salvo.
- Todo request autenticado passa por `apiRequest` (`src/api/client.js`), que anexa `Authorization: Bearer`; em um `401` ele tenta `POST /Auth/RefreshToken` uma vez antes de deslogar o usuário.
- Não há endpoint de logout no backend — "sair" apenas apaga os tokens salvos localmente.
- Os fluxos de confirmação de e-mail e redefinição de senha terminam numa página HTML servida pelo **próprio backend** (fora do app); o app só precisa das telas de "verifique seu e-mail" e "esqueci minha senha".

## Integração com o backend

O backend não é consistente na forma como responde (às vezes devolve um envelope `{ sucesso, objetoRetorno, mensagem }`, às vezes o objeto cru, às vezes só uma string). `src/utils/apiResponse.js` centraliza esse parsing, e `src/api/client.js` lança um `ApiError` com a mensagem já extraída em qualquer um dos formatos, para as telas não precisarem tratar cada caso individualmente.

A documentação completa da API (regras de negócio, endpoints, DTOs, particularidades de cada controller) está em [`FRONTEND_REACT_NATIVE_SPEC.md`](../FRONTEND_REACT_NATIVE_SPEC.md), na raiz do repositório pai — é a referência a ser consultada antes de integrar qualquer tela nova com o backend.

## Observações conhecidas

- Sem CORS configurado no backend — não afeta o app nativo via Expo Go, mas impede o modo `npm run web` de funcionar contra um backend remoto/diferente de `localhost`.
- Fotos de comprovação de tarefa exigem token de autenticação para download, então não são exibidas via `<Image source={{ uri }}>` direto — são baixadas via `fetch` autenticado e convertidas para `data:` URI.
- Alguns endpoints do backend têm particularidades de status HTTP e "lista vazia" que fogem do padrão (ex.: editar/remover tarefa sempre retorna 200 mesmo em erro) — o tratamento dessas exceções está documentado na spec e já implementado nos pontos relevantes da app.
