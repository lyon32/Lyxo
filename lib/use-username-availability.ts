import { useEffect, useState } from 'react';

import { apiFetch } from './api-client';

export type UsernameAvailability = {
  status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
  suggestions: string[];
};

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

interface AsyncResult {
  forValue: string;
  status: 'available' | 'taken';
  suggestions: string[];
}

// Debounce 300 ms (API_SPEC.md §4.2, écran 3 signup) — endpoint léger,
// sans JWT. idle/invalid dérivés au rendu ; seul le résultat réseau
// (async, dans le setTimeout) déclenche un setState.
export function useUsernameAvailability(value: string): UsernameAvailability {
  const [asyncResult, setAsyncResult] = useState<AsyncResult | null>(null);

  useEffect(() => {
    if (!value || !USERNAME_REGEX.test(value)) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const response = await apiFetch(
          `/v1/profiles/check-username?value=${encodeURIComponent(value)}`,
        );
        const data = await response.json();
        if (cancelled) return;
        setAsyncResult(
          data.available
            ? { forValue: value, status: 'available', suggestions: [] }
            : { forValue: value, status: 'taken', suggestions: data.suggestions ?? [] },
        );
      } catch {
        if (!cancelled) setAsyncResult(null);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value]);

  if (!value) return { status: 'idle', suggestions: [] };
  if (!USERNAME_REGEX.test(value)) return { status: 'invalid', suggestions: [] };
  if (asyncResult?.forValue === value) {
    return { status: asyncResult.status, suggestions: asyncResult.suggestions };
  }
  return { status: 'checking', suggestions: [] };
}
