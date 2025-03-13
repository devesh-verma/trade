import { IsEnum, IsInt, IsNumber, IsPositive, IsString } from 'class-validator';
import { TradeType } from '../enums/trade.enum';

export class CreateTradeDto {
  @IsEnum(TradeType)
  type: TradeType;

  @IsInt()
  @IsPositive()
  user_id: number;

  @IsString()
  symbol: string;

  @IsInt()
  @IsPositive()
  shares: number;

  @IsNumber()
  @IsPositive()
  price: number;
}
