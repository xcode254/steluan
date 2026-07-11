// src/lib/errors.ts
//
// Supabase's PostgrestError/StorageError/AuthError shapes are
// typically plain objects ({ message, details, hint, code }) — not
// guaranteed to be instances of the native Error class. UI code
// throughout this app checks `err instanceof Error` to decide whether
// to show err.message or a generic fallback, so throwing a raw
// Supabase error object directly meant that check silently failed and
// the real message never reached the user, regardless of what
// actually went wrong. Every lib/*.ts function that throws should
// route through this first.
export function toError(err: unknown, fallback = 'Something went wrong.'): Error {
  if (err instanceof Error) return err
  if (err && typeof err === 'object' && 'message' in err) {
    return new Error(String((err as { message: unknown }).message))
  }
  return new Error(fallback)
}
