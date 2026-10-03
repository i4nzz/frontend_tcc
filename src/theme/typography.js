// A DynaPuff é uma display font arredondada: usamos na marca, nos títulos de
// tela e nos cabeçalhos de navegação. Texto corrido, labels, inputs e botões
// seguem na fonte do sistema, bem mais legível nos tamanhos pequenos.
//
// Atenção: com fonte custom o fontWeight não troca o arquivo (no Android ele
// só gera negrito sintético). Cada peso é uma fontFamily própria, então as
// entradas em DynaPuff não levam fontWeight.
export const fonts = {
  brand: 'DynaPuff_700Bold',
  title: 'DynaPuff_700Bold',
  subtitle: 'DynaPuff_600SemiBold',
};

// As glifas da DynaPuff são altas; sem lineHeight explícito o Android corta
// as descendentes.
export const typography = {
  brand: { fontSize: 32, lineHeight: 44, fontFamily: fonts.brand },
  title: { fontSize: 24, lineHeight: 34, fontFamily: fonts.title },
  subtitle: { fontSize: 18, lineHeight: 26, fontFamily: fonts.subtitle },
  body: { fontSize: 16, fontWeight: '400' },
  bodyBold: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '700' },
};

// Usado no headerTitleStyle dos navegadores. O fontWeight explícito evita que
// o React Navigation aplique o negrito padrão por cima do arquivo já negrito.
export const headerTitle = { fontFamily: fonts.title, fontWeight: 'normal' };
