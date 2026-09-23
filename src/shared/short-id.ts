import { randomInt } from 'node:crypto';

const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const SHORT_ID_LENGTH = 6;

/** Id aleatorio de 6 caracteres alfanuméricos (62^6 ≈ 56 mil millones de combinaciones). */
export function shortId(length = SHORT_ID_LENGTH): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += ALPHABET[randomInt(ALPHABET.length)];
  }
  return id;
}
