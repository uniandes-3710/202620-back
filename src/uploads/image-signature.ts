// Firmas ("magic bytes") con las que empieza cada formato
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const RIFF = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP = [0x57, 0x45, 0x42, 0x50]; // "WEBP", en el byte 8

const startsWith = (buf: Buffer, sig: number[], offset = 0) =>
  buf.length >= offset + sig.length &&
  sig.every((byte, i) => buf[offset + i] === byte);

/**
 * Detecta el formato real por el contenido, sin confiar en el tipo que declara el cliente.
 * Retorna la extensión con la que se debe guardar, o null si no es JPEG, PNG ni WEBP.
 */
export function detectImageExtension(buf: Buffer): string | null {
  if (startsWith(buf, PNG)) return '.png';
  if (startsWith(buf, JPEG)) return '.jpg';
  if (startsWith(buf, RIFF) && startsWith(buf, WEBP, 8)) return '.webp';
  return null;
}
