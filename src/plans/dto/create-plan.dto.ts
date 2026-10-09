import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsImageReference } from '../../uploads/is-image-reference.decorator';

// "id" se genera solo y "likes" empieza en 0 (lo mueve el endpoint de like)
export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(600)
  description: string;

  @IsNumber()
  @Min(0)
  estimatedPrice: number;

  // Duración en minutos
  @IsInt()
  @IsPositive()
  estimatedTime: number;

  @IsString()
  @IsNotEmpty()
  recomendations: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  // Lista de equipamiento; si no se envía queda vacía
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  equipment?: string[];

  // Path relativo devuelto por POST /uploads, o una URL externa http(s)
  @IsImageReference()
  image: string;

  // Id del usuario creador
  @IsUUID()
  userId: string;
}
