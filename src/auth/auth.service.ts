import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IUser } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthTokensDto } from './dto/auth-tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<IUser, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (user && passwordMatched) {
      delete user.password;
      return user;
    }
    return null;
  }

  async generateTokens(userId: number, email: string): Promise<AuthTokensDto> {
    const payload = { email, sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiration'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
      }),
    ]);

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(
        this.configService.get<string>('jwt.accessExpirationSeconds'),
      ),
    };
  }

  async signup(
    email: string,
    password: string,
  ): Promise<{ user: IUser; tokens: AuthTokensDto }> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.usersService.create(email, password);
    const tokens = await this.generateTokens(user.id, user.email);
    return { user, tokens };
  }

  async login(user: IUser): Promise<AuthTokensDto> {
    return this.generateTokens(user.id, user.email);
  }

  async refreshTokens(user: IUser): Promise<AuthTokensDto> {
    return this.generateTokens(user.id, user.email);
  }
}
