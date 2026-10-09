// Bogotá no tiene horario de verano: siempre es UTC-5
const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

/** Fecha en hora de Bogotá con su offset, p. ej. "2026-10-08T21:48:39-05:00". */
export function toBogotaIso(date: Date): string {
  const local = new Date(date.getTime() + BOGOTA_OFFSET_MS);
  return `${local.toISOString().slice(0, 19)}-05:00`;
}
