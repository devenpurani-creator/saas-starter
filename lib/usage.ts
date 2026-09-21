export const FREE_DECODE_LIMIT = 3;

// Accounts exempt from the free decode limit (e.g. for the owner to keep testing/demoing).
const UNLIMITED_DECODE_EMAILS = new Set(['devenpurani@gmail.com']);

export function hasUnlimitedDecodes(email: string) {
  return UNLIMITED_DECODE_EMAILS.has(email.toLowerCase());
}
