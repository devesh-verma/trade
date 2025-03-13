import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
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
      load: [jwtConfig, databaseConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
