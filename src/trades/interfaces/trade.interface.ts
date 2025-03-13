import { TradeType } from '../enums/trade.enum';

interface ITrade {
  id: number;
  type: TradeType;
  user_id: number;
  symbol: string;
  shares: number;
  price: number;
}

export interface ITradeRequest extends ITrade {
  timestamp: bigint;
}

export interface ITradeResponse extends ITrade {
  timestamp: Date;
}
