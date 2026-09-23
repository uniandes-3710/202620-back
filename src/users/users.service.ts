import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../shared/password';
import { LoginDto } from './dto/login.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserEntity } from './user.entity';

export type AuthResponse = Pick<UserEntity, 'id' | 'userName'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const email = normalizeEmail(dto.email);
    if (await this.usersRepository.existsBy({ email })) {
      throw new ConflictException('A user with this email already exists');
    }

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        ...dto,
        email,
        password: hashPassword(dto.password),
      }),
    );
    return toAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findOneBy({
      email: normalizeEmail(dto.email),
    });
    // Mismo mensaje si el email no existe o la contraseña no coincide
    if (!user || !verifyPassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return toAuthResponse(user);
  }
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// Respuesta común de login y signin
const toAuthResponse = ({ id, userName }: UserEntity): AuthResponse => ({
  id,
  userName,
});
