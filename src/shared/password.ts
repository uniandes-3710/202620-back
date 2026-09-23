import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

const DEFAULT_SEED = 'default-parcial';
const KEY_LENGTH = 64;

const seed = (): string => process.env.SEED || DEFAULT_SEED;

// El SEED actúa como "pepper": se mezcla con la contraseña antes de derivar el hash
const derive = (password: string, salt: Buffer): Buffer => {
  const peppered = createHmac('sha256', seed()).update(password).digest();
  return scryptSync(peppered, salt, KEY_LENGTH);
};

/** Retorna `salt:hash` en hexadecimal, listo para guardar en la columna password. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `${salt.toString('hex')}:${derive(password, salt).toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = derive(password, Buffer.from(saltHex, 'hex'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
