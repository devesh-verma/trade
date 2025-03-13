import { Module } from '@nestjs/common';
import { PrismaModule } from '../core/databases/prisma/prisma.module';
import { DrizzleTradeRepository } from './repositories/drizzle.repository';
import { NativeTradeRepository } from './repositories/native.repository';
import { PrismaTradeRepository } from './repositories/prisma.repository';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

const repositories = {
  drizzle: DrizzleTradeRepository,
  native: NativeTradeRepository,
  prisma: PrismaTradeRepository,
};

@Module({
  imports: [PrismaModule],
  controllers: [TradesController],
  providers: [
    TradesService,
    {
      provide: 'TRADE_REPOSITORY',
      useClass: repositories[process.env.ORM_TYPE],
    },
  ],
})
export class TradesModule {}
