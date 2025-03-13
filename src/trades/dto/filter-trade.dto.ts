import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TradeType } from '../enums/trade.enum';

export class FilterTradeDto {
  @IsOptional()
  @IsEnum(TradeType)
  type?: TradeType;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  user_id?: number;
}
