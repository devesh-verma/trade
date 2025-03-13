import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../trades/schemas/trades.schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db: ReturnType<typeof drizzle<typeof schema>>;
  private readonly logger = new Logger(DrizzleService.name);

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('database.url');
    this.logger.log(
      `Connecting to database with connection string: ${connectionString}`,
    );

    this.pool = new Pool({
      connectionString,
      max: this.configService.get<number>('database.poolSize', 20),
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try {
      await this.pool.connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
      this.logger.log('Successfully closed database connection');
    } catch (error) {
      this.logger.error('Error closing database connection:', error);
      throw error;
    }
  }
}
