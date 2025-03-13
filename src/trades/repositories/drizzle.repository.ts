import { Injectable, Logger } from '@nestjs/common';
import { Trade } from '@prisma/client';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../../core/databases/drizzle/drizzle.service';
import { ITradeRepository } from '../interfaces/repository.interface';
import { ITradeRequest } from '../interfaces/trade.interface';
import { trades } from '../schemas/trades.schema';

@Injectable()
export class DrizzleTradeRepository implements ITradeRepository {
  private readonly logger = new Logger(DrizzleTradeRepository.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(data: ITradeRequest): Promise<Trade> {
    const [result] = await this.drizzle.db
      .insert(trades)
      .values({
        ...data,
        timestamp: Number(data.timestamp),
      })
      .returning();
    return result as unknown as Trade;
  }

  async findAll(params: { type?: string; user_id?: number }): Promise<Trade[]> {
    const conditions = [];
    if (params.type) conditions.push(eq(trades.type, params.type));
    if (params.user_id) conditions.push(eq(trades.user_id, params.user_id));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.drizzle.db.query.trades.findMany({
      where: whereClause,
      orderBy: (fields) => [fields.id],
    });
    return data as unknown as Trade[];
  }

  async findById(id: number): Promise<Trade | null> {
    const result = await this.drizzle.db.query.trades.findFirst({
      where: eq(trades.id, id),
    });
    return result as unknown as Trade | null;
  }
}
