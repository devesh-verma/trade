import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TradeType } from '../enums/trade.enum';

export class CreateTradeDto {
  @IsEnum(TradeType)
  type: TradeType;

  @IsString()
  symbol: string;

  @IsInt()
  @Min(1)
  @Max(100)
  shares: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateTradeDtoWithUserId extends CreateTradeDto {
  user_id: number;
}
