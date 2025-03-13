import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ConfigModule } from './config/config.module';
import { DrizzleModule } from './core/databases/drizzle/drizzle.module';
import { NativeModule } from './core/databases/native/native.module';
import { PrismaModule } from './core/databases/prisma/prisma.module';
import { TradesModule } from './trades/trades.module';
import { UsersModule } from './users/users.module';

const imports = [ConfigModule, AuthModule, UsersModule, TradesModule];

switch (process.env.ORM_TYPE) {
  case 'prisma':
    imports.push(PrismaModule);
    break;
  case 'drizzle':
    imports.push(DrizzleModule);
    break;
  case 'native':
    imports.push(NativeModule);
    break;
  default:
    imports.push(NativeModule);
}

@Module({
  imports,
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
