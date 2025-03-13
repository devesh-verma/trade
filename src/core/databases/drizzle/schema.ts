import {
  bigint,
  index,
  integer,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

export const trades = pgTable(
  'trades',
  {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 256 }).notNull(),
    user_id: integer('user_id').notNull(),
    symbol: varchar('symbol', { length: 256 }).notNull(),
    shares: integer('shares').notNull(),
    price: integer('price').notNull(),
    timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  },
  (table) => ({
    idIdx: index('trades_id_idx').on(table.id),
    typeIdx: index('trades_type_idx').on(table.type),
    userIdIdx: index('trades_user_id_idx').on(table.user_id),
    typeIdIdx: index('trades_type_id_idx').on(table.type, table.id),
    userIdIdIdx: index('trades_user_id_id_idx').on(table.user_id, table.id),
  }),
);
