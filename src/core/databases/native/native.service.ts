import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class NativePostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  private readonly logger = new Logger(NativePostgresService.name);
  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('database.url'),
      max: this.configService.get<number>('database.poolSize', 100),
    });
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
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Failed to disconnect from database:', error);
      throw error;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    try {
      this.logger.log(`Executing query: ${text}`);
      const { rows } = await this.pool.query(text, params);
      return rows;
    } catch (error) {
      this.logger.error('Failed to query database:', error);
      throw error;
    }
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    try {
      this.logger.log(`Executing query: ${text}`);
      const { rows } = await this.pool.query(text, params);
      return rows[0] || null;
    } catch (error) {
      this.logger.error('Failed to query database:', error);
      throw error;
    }
  }
}
