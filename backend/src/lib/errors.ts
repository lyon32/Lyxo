// Codes fermés — API_SPEC.md §2. Ajouter un nouveau code ICI, jamais
// inventé inline dans une route (CONVENTIONS.md §5.4).
export const ERROR_STATUS = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  RESOURCE_NOT_FOUND: 404,
  CONFLICT: 409,
  DUPLICATE_REQUEST: 409,
  PAYMENT_REJECTED: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  PROVIDER_UNAVAILABLE: 503,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(code: ErrorCode, message: string, details: unknown = null) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
