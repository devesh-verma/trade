import { Injectable } from '@nestjs/common';
import { Trade } from '@prisma/client';
import { NativePostgresService } from '../../core/databases/native/native.service';
import { ITradeRepository } from '../interfaces/repository.interface';
import { ITradeRequest } from '../interfaces/trade.interface';

@Injectable()
export class NativeTradeRepository implements ITradeRepository {
  constructor(private readonly postgres: NativePostgresService) {}

  async create(data: ITradeRequest): Promise<Trade> {
    const result = await this.postgres.queryOne<Trade>(
      `
      INSERT INTO trades (type, user_id, symbol, shares, price, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        data.type,
        data.user_id,
        data.symbol,
        data.shares,
        data.price,
        data.timestamp,
      ],
    );
    if (!result) {
      throw new Error('Failed to create trade');
    }

    return result;
  }

  async findAll(params: { type?: string; user_id?: number }): Promise<Trade[]> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.type) {
      conditions.push(`type = $${values.length + 1}`);
      values.push(params.type);
    }

    if (params.user_id) {
      conditions.push(`user_id = $${values.length + 1}`);
      values.push(params.user_id);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `SELECT * FROM trades ${whereClause} ORDER BY id ASC`;

    return this.postgres.query<Trade>(query, values);
  }

  async findById(id: number): Promise<Trade | null> {
    return this.postgres.queryOne<Trade>('SELECT * FROM trades WHERE id = $1', [
      id,
    ]);
  }
}
