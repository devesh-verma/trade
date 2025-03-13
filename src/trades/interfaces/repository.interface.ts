import { Trade } from '@prisma/client';
import { ITradeRequest } from './trade.interface';

export interface ITradeRepository {
  findAll(params: { type?: string; user_id?: number }): Promise<Trade[]>;

  findById(id: number): Promise<Trade | null>;

  create(data: ITradeRequest): Promise<Trade>;
}
