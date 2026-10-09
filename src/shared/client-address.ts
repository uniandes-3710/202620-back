import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { isIPv4 } from 'node:net';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const MAC_PATTERN = /\b([0-9a-f]{1,2}[:-]){5}[0-9a-f]{1,2}\b/i;

/** Convierte la IP de la petición (p. ej. "::ffff:10.0.0.5") a IPv4, o null si es IPv6 pura. */
export function toIPv4(ip: string | undefined): string | null {
  if (!ip) return null;
  if (ip === '::1') return '127.0.0.1';
  const candidate = ip.startsWith('::ffff:') ? ip.slice('::ffff:'.length) : ip;
  return isIPv4(candidate) ? candidate : null;
}

/** Normaliza a "aa:bb:cc:dd:ee:ff"; descarta entradas incompletas o broadcast. */
function normalizeMac(raw: string | undefined): string | null {
  const match = raw?.match(MAC_PATTERN);
  if (!match) return null;
  const mac = match[0]
    .toLowerCase()
    .split(/[:-]/)
    .map((part) => part.padStart(2, '0'))
    .join(':');
  return mac === '00:00:00:00:00:00' || mac === 'ff:ff:ff:ff:ff:ff'
    ? null
    : mac;
}

/**
 * Busca la MAC de una IPv4 en la tabla ARP del servidor.
 * La MAC no viaja en HTTP: solo se encuentra si el cliente está en la misma red local
 * (detrás de un router, proxy o Docker se obtiene null o la MAC del gateway).
 */
export async function lookupMac(ipv4: string): Promise<string | null> {
  try {
    if (process.platform === 'linux') {
      const table = await readFile('/proc/net/arp', 'utf8');
      const row = table
        .split('\n')
        .map((line) => line.trim().split(/\s+/))
        .find((columns) => columns[0] === ipv4);
      return normalizeMac(row?.[3]);
    }
    const { stdout } = await execFileAsync('arp', ['-n', ipv4], {
      timeout: 1000,
    });
    return normalizeMac(stdout);
  } catch {
    return null;
  }
}
