import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateTradeDtoWithUserId } from './dto/create-trade.dto';
import { FilterTradeDto } from './dto/filter-trade.dto';
import { ITradeRepository } from './interfaces/repository.interface';

@Injectable()
export class TradesService {
  private readonly logger = new Logger(TradesService.name);

  constructor(
    @Inject('TRADE_REPOSITORY')
    private readonly tradeRepository: ITradeRepository,
  ) {}

  /**
   * Create a new trade
   * @param payload - The trade data with user ID
   * @returns Promise resolving to the created trade with timestamp converted to string
   * @throws Will throw an error if trade creation fails
   */
  async create(payload: CreateTradeDtoWithUserId) {
    try {
      const result = await this.tradeRepository.create({
        ...payload,
        timestamp: BigInt(new Date().getTime()),
      });
      return { ...result, timestamp: result.timestamp.toString() };
    } catch (error) {
      this.logger.error('Failed to create trade', { payload, error });
      throw error;
    }
  }

  /**
   * Find all trades matching optional filters
   * @param filterDto - Optional filters for type and user_id
   * @returns Promise resolving to array of trades with timestamps converted to ISO string
   * @throws Will throw an error if trade retrieval fails
   */
  async findAll(filterDto?: FilterTradeDto) {
    try {
      const trades = await this.tradeRepository.findAll({
        type: filterDto?.type,
        user_id: filterDto?.user_id,
      });

      return trades.map((trade) => ({
        ...trade,
        timestamp: this.convertTimestamp(trade.timestamp),
      }));
    } catch (error) {
      this.logger.error('Failed to find trades', { filterDto, error });
      throw error;
    }
  }

  /**
   * Find a trade by its ID
   * @param id - The trade ID to search for
   * @returns Promise resolving to the trade if found with timestamp converted to ISO string, null otherwise
   * @throws Will throw an error if trade retrieval fails
   */
  async findOne(id: number) {
    try {
      const trade = await this.tradeRepository.findById(id);
      if (!trade) {
        return null;
      }
      return { ...trade, timestamp: this.convertTimestamp(trade.timestamp) };
    } catch (error) {
      this.logger.error(`Failed to find trade by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Convert a bigint timestamp to ISO string date
   * @param timestamp - The bigint timestamp to convert
   * @returns ISO string representation of the timestamp
   * @private
   */
  private convertTimestamp(timestamp: bigint): string {
    try {
      return new Date(Number(timestamp)).toISOString();
    } catch (error) {
      this.logger.error(`Failed to convert timestamp: ${timestamp}`, error);
      throw error;
    }
  }
}
