import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { Public } from 'src/core/decorators/public.decorator';
import { Serialize } from 'src/core/interceptors/serialize.interceptor';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@Public()
@Serialize(AuthResponseDto)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // This method is kept for reference but no longer used
  private setTokenCookies(
    res: Response,
    tokens: Pick<AuthTokensDto, 'accessToken' | 'refreshToken'>,
  ) {
    const secure = this.configService.get('NODE_ENV') === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge:
        parseInt(this.configService.get('jwt.accessExpirationSeconds')) * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge:
        parseInt(this.configService.get('jwt.refreshExpirationSeconds')) * 1000,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    const { user, tokens } = await this.authService.signup(
      signUpDto.email,
      signUpDto.password,
    );

    return {
      user: new UserResponseDto(user),
      ...tokens,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@User() user: any) {
    const tokens = await this.authService.login(user);

    return {
      user: new UserResponseDto(user),
      ...tokens,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshTokens(@User() user: any) {
    const tokens = await this.authService.generateTokens(user.id, user.email);

    return {
      user: new UserResponseDto(user),
      ...tokens,
    };
  }
}
