import { ConfigService } from '@nestjs/config';
import { defineConfig } from 'drizzle-kit';

const configService = new ConfigService();

export default defineConfig({
  schema: '../../../trades/schemas/trades.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: configService.get('database.host') || 'localhost',
    port: configService.get('database.port') || 5432,
    user: configService.get('database.user') || 'postgres',
    password: configService.get('database.password') || 'postgres',
    database: configService.get('database.name') || 'trades',
  },
  verbose: true,
  strict: true,
});
