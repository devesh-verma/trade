import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// Configuration for fake data generation
const CONFIG = {
  // Number of trades to generate
  TRADE_COUNT: 100_000,

  // Stock symbols to use (we'll generate more realistic ones with Faker)
  SYMBOLS: [
    'AAPL',
    'MSFT',
    'GOOGL',
    'AMZN',
    'META',
    'TSLA',
    'NVDA',
    'JPM',
    'V',
    'WMT',
    'DIS',
    'NFLX',
    'PYPL',
    'INTC',
    'AMD',
    'CSCO',
    'ADBE',
    'CRM',
    'CMCSA',
    'PEP',
    'KO',
    'BAC',
    'XOM',
    'CVX',
    'PFE',
    'MRK',
    'JNJ',
    'UNH',
    'HD',
    'NKE',
  ],

  // Range for shares
  SHARES_MIN: 1,
  SHARES_MAX: 100,

  // Range for price
  PRICE_MIN: 10,
  PRICE_MAX: 1000,

  // Date range for timestamps (last 30 days)
  DATE_RANGE_DAYS: 30,

  // Number of users to create
  USER_COUNT: 10,
};

// Helper function to generate a random date within the last n days
function getRandomDate(days: number): Date {
  return faker.date.recent({ days });
}

async function main() {
  console.log('Starting seed script...');

  // Create users with Faker data
  const userCount = await prisma.user.count();
  const targetUserCount = CONFIG.USER_COUNT;

  if (userCount < targetUserCount) {
    console.log(`Creating ${targetUserCount - userCount} users with Faker...`);

    for (let i = userCount; i < targetUserCount; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName });
      const hashedPassword = await bcryptjs.hash(faker.internet.password(), 10);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
    }

    console.log(`Created ${targetUserCount - userCount} users with Faker.`);
  } else {
    console.log(`Already have ${userCount} users in the database.`);
  }

  // Get all user IDs
  const users = await prisma.user.findMany({
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);

  // Check if we already have trades
  const existingTradeCount = await prisma.trade.count();
  if (existingTradeCount > 0) {
    console.log(`Database already has ${existingTradeCount} trades.`);
    console.log(`Adding ${CONFIG.TRADE_COUNT} more trades...`);
  }

  // Generate trades in batches to avoid memory issues
  const BATCH_SIZE = 100_000;
  const batches = Math.ceil(CONFIG.TRADE_COUNT / BATCH_SIZE);

  console.log(
    `Generating ${CONFIG.TRADE_COUNT} trades in ${batches} batches...`,
  );

  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(
      BATCH_SIZE,
      CONFIG.TRADE_COUNT - batch * BATCH_SIZE,
    );
    console.log(
      `Generating batch ${batch + 1}/${batches} (${batchSize} trades)...`,
    );

    const trades = [];

    for (let i = 0; i < batchSize; i++) {
      // Use Faker to generate more realistic data
      const randomUserId = faker.helpers.arrayElement(userIds);
      const randomSymbol = faker.helpers.arrayElement(CONFIG.SYMBOLS);
      const randomShares = faker.number.int({
        min: CONFIG.SHARES_MIN,
        max: CONFIG.SHARES_MAX,
      });
      const randomPrice = parseFloat(
        faker.finance.amount({
          min: CONFIG.PRICE_MIN,
          max: CONFIG.PRICE_MAX,
          dec: 2,
        }),
      );
      const randomDate = getRandomDate(CONFIG.DATE_RANGE_DAYS);
      const randomType = faker.helpers.arrayElement(['buy', 'sell']);

      trades.push({
        type: randomType,
        user_id: randomUserId,
        symbol: randomSymbol,
        shares: randomShares,
        price: randomPrice,
        timestamp: BigInt(randomDate.getTime()),
      });
    }

    // Insert trades in a batch
    await prisma.trade.createMany({
      data: trades,
      skipDuplicates: true,
    });

    console.log(`Batch ${batch + 1} completed.`);
  }

  const finalTradeCount = await prisma.trade.count();
  console.log(`Seed completed. Database now has ${finalTradeCount} trades.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
