// O backend (UrlsFrontend:BaseUrl / ConfirmacaoEmailPath / RedefinicaoSenhaPath
// no appsettings) precisa apontar pra "taskkids://confirmar-email" e
// "taskkids://redefinir-senha" pra esses links de e-mail abrirem o app.
export const linking = {
  prefixes: ['taskkids://'],
  config: {
    screens: {
      Login: 'login',
      Cadastro: 'cadastro',
      VerifiqueEmail: 'verifique-email',
      ConfirmarEmail: 'confirmar-email',
      EsqueciSenha: 'esqueci-senha',
      RedefinirSenha: 'redefinir-senha',
    },
  },
};
