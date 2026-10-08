import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Acompanha a opção "reduzir movimento" do sistema.
export function useReduzirMovimento() {
  const [reduzir, setReduzir] = useState(false);

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (ativo) setReduzir(valor);
    });
    const inscricao = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      inscricao?.remove?.();
    };
  }, []);

  return reduzir;
}
