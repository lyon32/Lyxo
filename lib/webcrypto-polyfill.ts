import 'react-native-get-random-values';
import * as ExpoCrypto from 'expo-crypto';

// Hermes n'implémente pas `crypto.subtle` (WebCrypto) — sans ce polyfill,
// supabase-js retombe sur PKCE "plain" au lieu de "S256" (warning "WebCrypto
// API is not supported"). `expo-crypto` expose `Crypto.digest()` avec la
// même signature que `crypto.subtle.digest` (BufferSource -> ArrayBuffer),
// donc juste besoin de brancher l'un sur l'autre.
const ALGORITHM_MAP: Record<string, ExpoCrypto.CryptoDigestAlgorithm> = {
  'SHA-1': ExpoCrypto.CryptoDigestAlgorithm.SHA1,
  'SHA-256': ExpoCrypto.CryptoDigestAlgorithm.SHA256,
  'SHA-384': ExpoCrypto.CryptoDigestAlgorithm.SHA384,
  'SHA-512': ExpoCrypto.CryptoDigestAlgorithm.SHA512,
};

// @ts-expect-error -- polyfill global minimal, pas l'objet Crypto DOM complet
if (!globalThis.crypto) globalThis.crypto = {};

if (!globalThis.crypto.subtle) {
  // @ts-expect-error -- digest() seul suffit pour le PKCE de supabase-js
  globalThis.crypto.subtle = {
    digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      const mapped = ALGORITHM_MAP[name];
      if (!mapped) throw new Error(`Unsupported digest algorithm: ${name}`);
      return ExpoCrypto.digest(mapped, data as ArrayBuffer);
    },
  };
}
