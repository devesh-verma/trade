import { Injectable } from '@nestjs/common';
import { Trade } from '@prisma/client';
import { PrismaService } from '../../core/databases/prisma/prisma.service';
import { ITradeRepository } from '../interfaces/repository.interface';
import { ITradeRequest } from '../interfaces/trade.interface';

@Injectable()
export class PrismaTradeRepository implements ITradeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ITradeRequest): Promise<Trade> {
    return this.prisma.trade.create({
      data,
    });
  }

  async findAll(params: { type?: string; user_id?: number }): Promise<Trade[]> {
    if (params.type && params.user_id) {
      return await this.prisma.$queryRaw<Trade[]>`
        SELECT id, type, user_id, symbol, shares, price, timestamp
        FROM trades
        WHERE type = ${params.type} AND user_id = ${params.user_id}
        ORDER BY id ASC
      `;
    } else if (params.type) {
      return await this.prisma.$queryRaw<Trade[]>`
        SELECT id, type, user_id, symbol, shares, price, timestamp
        FROM trades
        WHERE type = ${params.type}
        ORDER BY id ASC
      `;
    } else if (params.user_id) {
      return await this.prisma.$queryRaw<Trade[]>`
        SELECT id, type, user_id, symbol, shares, price, timestamp
        FROM trades
        WHERE user_id = ${params.user_id}
        ORDER BY id ASC
      `;
    } else {
      return await this.prisma.$queryRaw<Trade[]>`
        SELECT id, type, user_id, symbol, shares, price, timestamp
        FROM trades
        ORDER BY id ASC
      `;
    }
  }

  async findById(id: number): Promise<Trade | null> {
    return this.prisma.trade.findUnique({
      where: { id },
    });
  }
}
