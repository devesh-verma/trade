import { Expose, Transform } from 'class-transformer';
import { TradeType } from '../enums/trade.enum';

export class TradeResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: TradeType;

  @Expose()
  user_id: number;

  @Expose()
  symbol: string;

  @Expose()
  shares: number;

  @Expose()
  price: number;

  @Expose()
  @Transform(({ value }) => (value ? Number(value.toString()) : null))
  timestamp: number;
}
