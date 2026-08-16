import { jwtDecode } from 'jwt-decode';

// RetornoLoginDto não traz o Id do usuário — só dá pra saber lendo o claim do
// próprio JWT. O ASP.NET Core costuma remapear ClaimTypes.NameIdentifier pro
// URI legado do WS-Federation ao gerar o token (a menos que o backend limpe
// JwtSecurityTokenHandler.DefaultInboundClaimTypeMap), então checamos todas
// as chaves possíveis em vez de confiar só em "sub"/"nameid".
const NAME_IDENTIFIER_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

export function getUserIdFromToken(accessToken) {
  if (!accessToken) return null;
  try {
    const claims = jwtDecode(accessToken);
    const rawId =
      claims[NAME_IDENTIFIER_CLAIM] ?? claims.nameid ?? claims.sub ?? claims.id ?? claims.Id;
    const id = Number(rawId);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}
