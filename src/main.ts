import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { requestLogger, requestLoggingEnabled } from './shared/request-logger';
import { UPLOADS_ROUTE, uploadsDir } from './uploads/uploads.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Va primero para registrar todas las peticiones, incluidas las de /uploads
  if (requestLoggingEnabled()) {
    app.use(requestLogger);
  }
  // CORS_ORIGIN: orígenes permitidos separados por coma; si no se define se permite cualquiera
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? true,
  });
  // Valida los DTOs y descarta propiedades que no estén declaradas (p. ej. un "id" en signin)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Imágenes subidas con POST /uploads, servidas en GET /uploads/<archivo>
  app.useStaticAssets(uploadsDir(), {
    prefix: `${UPLOADS_ROUTE}/`,
    index: false,
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
