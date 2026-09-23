import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Activo con LOG_REQUESTS=true o arrancando con el flag --log-requests. */
export function requestLoggingEnabled(): boolean {
  return (
    process.env.LOG_REQUESTS === 'true' ||
    process.argv.includes('--log-requests')
  );
}

const logger = new Logger('HTTP');

// Registra método, ruta, status y duración. No registra el body (lleva contraseñas).
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`;
    if (res.statusCode >= 500) logger.error(line);
    else if (res.statusCode >= 400) logger.warn(line);
    else logger.log(line);
  });
  next();
}
