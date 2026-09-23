import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { IsImageReference } from '../../uploads/is-image-reference.decorator';

// "id" se genera solo y "likes" empieza en 0 (lo mueve el endpoint de like)
export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @IsString()
  @IsNotEmpty()
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

  // Path relativo devuelto por POST /uploads, o una URL externa http(s)
  @IsImageReference()
  image: string;

  // Id del usuario creador
  @IsUUID()
  userId: string;
}
