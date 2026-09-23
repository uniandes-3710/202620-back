import { isURL, ValidateBy, ValidationOptions } from 'class-validator';
import { UPLOADED_IMAGE_PATH } from './uploads.config';

export function isImageReference(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    (UPLOADED_IMAGE_PATH.test(value) ||
      isURL(value, { protocols: ['http', 'https'], require_protocol: true }))
  );
}

/** Acepta un path devuelto por POST /uploads o una URL externa http(s). */
export function IsImageReference(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isImageReference',
      validator: {
        validate: isImageReference,
        defaultMessage: () =>
          '$property must be a path returned by POST /uploads or an http(s) URL',
      },
    },
    options,
  );
}
