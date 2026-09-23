import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from './uploads.config';
import { UploadsService } from './uploads.service';

export interface UploadResponse {
  path: string;
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // Espera multipart/form-data con la imagen en el campo "file"
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // En memoria (máx. 5 MB) para revisar los bytes antes de escribir a disco
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
      // Filtro rápido por el tipo declarado; el contenido real se valida en el servicio
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only JPEG, PNG or WEBP images are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException(
        'An image must be sent in the "file" field',
      );
    }
    return { path: await this.uploadsService.saveImage(file) };
  }
}
