import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { detectImageExtension } from './image-signature';
import { UPLOADS_ROUTE, uploadsDir } from './uploads.config';

@Injectable()
export class UploadsService {
  /** Valida el contenido de la imagen, la guarda en disco y retorna su path relativo. */
  async saveImage(file: Express.Multer.File): Promise<string> {
    const extension = detectImageExtension(file.buffer);
    if (!extension) {
      throw new BadRequestException(
        'The file content is not a valid JPEG, PNG or WEBP image',
      );
    }

    // Nombre aleatorio: nunca se usa el nombre que manda el cliente
    const filename = randomBytes(16).toString('hex') + extension;
    await writeFile(join(uploadsDir(), filename), file.buffer, { flag: 'wx' });
    return `${UPLOADS_ROUTE}/${filename}`;
  }
}
