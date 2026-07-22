import { createRemoteJWKSet, jwtVerify } from 'jose';

// Vérification JWT Supabase via JWKS (ES256, clés asymétriques) — PAS le
// secret partagé legacy HS256 documenté dans ENV_SETUP.md §1.2 : ce
// projet Supabase (créé 2026-07-22) sert déjà ses clés via
// /auth/v1/.well-known/jwks.json (vérifié en session), SUPABASE_JWT_SECRET
// n'existe pas pour ce type de projet. SUPABASE_URL reste la seule
// variable nécessaire ici.
const jwks = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

export interface SupabaseJwtPayload {
  userId: string;
  email?: string;
}

export async function verifySupabaseJwt(token: string): Promise<SupabaseJwtPayload> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    audience: 'authenticated',
  });

  return { userId: payload.sub as string, email: payload.email as string | undefined };
}
