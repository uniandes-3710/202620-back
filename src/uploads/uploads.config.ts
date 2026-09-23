import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

/** Ruta pública bajo la que se sirven las imágenes: /uploads/<archivo> */
export const UPLOADS_ROUTE = '/uploads';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// Tipos declarados aceptados (primer filtro; el formato real se detecta por los bytes)
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Path relativo válido de una imagen subida, p. ej. /uploads/3f9a...c1.jpg */
export const UPLOADED_IMAGE_PATH = /^\/uploads\/[a-f0-9]{32}\.(jpg|png|webp)$/;

// Se lee al usarse (no al importar) para que el .env ya esté cargado
export function uploadsDir(): string {
  const dir = resolve(process.env.UPLOADS_DIR ?? 'uploads');
  mkdirSync(dir, { recursive: true });
  return dir;
}
