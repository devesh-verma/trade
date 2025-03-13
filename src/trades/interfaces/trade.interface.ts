import { TradeType } from '../enums/trade.enum';

interface ITrade {
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
  id: number;
  timestamp: bigint;
}
