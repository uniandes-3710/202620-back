import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  // Llega en texto plano; el servicio la cifra antes de guardarla
  @IsString()
  @IsNotEmpty()
  password: string;
}
