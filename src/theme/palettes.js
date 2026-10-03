// Tonalidades que o usuário pode escolher na tela de Perfil. Só a cor de
// destaque muda; fundos, textos, status (sucesso/alerta/erro) e as cores de
// categoria ficam fixos para o app continuar legível em qualquer escolha.
//
// Contraste de texto branco sobre `primary` (WCAG AA exige 4,5:1 para o texto
// dos botões, 16px bold): roxo 5,5 · verde, rosa, laranja e turquesa ≥ 4,5.
// O azul é a cor original do app e fica em 3,97:1 — abaixo do mínimo; mantida
// para não alterar o visual padrão.
export const TONALIDADES = {
  azul: { id: 'azul', nome: 'Azul', primary: '#2E86C1', primaryDark: '#1F6398' },
  verde: { id: 'verde', nome: 'Verde', primary: '#36844F', primaryDark: '#2B6B3F' },
  roxo: { id: 'roxo', nome: 'Roxo', primary: '#7456C0', primaryDark: '#6142B1' },
  laranja: { id: 'laranja', nome: 'Laranja', primary: '#B5601F', primaryDark: '#97501A' },
  rosa: { id: 'rosa', nome: 'Rosa', primary: '#C7467A', primaryDark: '#B33668' },
  turquesa: { id: 'turquesa', nome: 'Turquesa', primary: '#1D8480', primaryDark: '#166663' },
};

export const TONALIDADE_PADRAO = 'azul';
