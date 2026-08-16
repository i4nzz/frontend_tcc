function looksLikeEnvelope(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'sucesso' in value &&
    'objetoRetorno' in value
  );
}

// Lida com as 3 formas de resposta do backend (ver seção 6 da spec): envelope
// RespostaMetodos<T>, objeto/lista "crua", ou apenas uma string de mensagem.
export async function readApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return { data: null, message: null };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { data: null, message: text };
  }

  if (looksLikeEnvelope(parsed)) {
    return { data: parsed.objetoRetorno ?? null, message: parsed.mensagem ?? null };
  }

  if (typeof parsed === 'string') {
    return { data: null, message: parsed };
  }

  return { data: parsed, message: null };
}
