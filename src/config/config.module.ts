import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation';
import jwtConfig from './jwt.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate,
      envFilePath: ['.env'],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [jwtConfig],
      validationOptions: {
        abortEarly: true,
        allowUnknown: false,
        whitelist: true,
        forbidNonWhitelisted: true,
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
