import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/databases/prisma/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { FilterTradeDto } from './dto/filter-trade.dto';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto) {
    const result = await this.prisma.trade.create({
      data: {
        ...createTradeDto,
        timestamp: BigInt(new Date().getTime()),
      },
    });
    return { ...result, timestamp: result.timestamp.toString() };
  }

  async findAll(filterDto?: FilterTradeDto) {
    const where: any = {};

    if (filterDto?.type) {
      where.type = filterDto.type;
    }
    if (filterDto?.user_id) {
      where.user_id = filterDto.user_id;
    }

    const trades = await this.prisma.trade.findMany({
      where,
    });

    return trades.map((trade) => ({
      ...trade,
      timestamp: trade.timestamp.toString(),
    }));
  }

  async findOne(id: number) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
    });
    if (!trade) {
      return null;
    }
    return { ...trade, timestamp: trade.timestamp.toString() };
  }
}
