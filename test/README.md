# Stress Testing the GET /trades Endpoint

This directory contains tools for stress testing the GET /trades endpoint of the Trade API.

## Overview

The stress testing process consists of three main steps:

1. **Seed the database** with fake trade data
2. **Run the stress test** against the API
3. **Analyze the results** to identify performance bottlenecks

## Prerequisites

- Node.js and npm/pnpm installed
- PostgreSQL database running
- Trade API application configured and ready to run

## Step 1: Seed the Database

Before running the stress test, you need to populate the database with a large number of fake trade records.

```bash
# Run the seed script
pnpm seed
```

This will:

- Create a test user if one doesn't exist
- Generate thousands of random trade records
- Insert them into the database in batches

You can configure the number of trades to generate by modifying the `TRADE_COUNT` constant in `prisma/seed.ts`.

## Step 2: Run the Stress Test

Once the database is populated, you can run the stress test against the API.

```bash
# Start the API server in one terminal
pnpm start:dev

# Run the stress test in another terminal
pnpm stress-test
```

The stress test will:

- Send concurrent requests to the GET /trades endpoint
- Test different scenarios (all trades, filtered by type, etc.)
- Measure response times, success rates, and response sizes
- Save the results to a JSON file

You can configure the test parameters by modifying the `CONFIG` object in `test/stress-test.ts`.

## Step 3: Analyze the Results

After running the stress test, you can analyze the results to identify performance bottlenecks.

```bash
# Generate an HTML report with charts
pnpm analyze-results
```

This will:

- Load the results from the JSON file
- Generate an HTML report with charts and tables
- Save the report to the `stress-test-charts` directory

Open the `stress-test-charts/report.html` file in a web browser to view the results.

## Customizing the Tests

### Modifying the Seed Data

You can customize the seed data by modifying the `CONFIG` object in `prisma/seed.ts`:

- `TRADE_COUNT`: Number of trades to generate
- `SYMBOLS`: Array of stock symbols to use
- `SHARES_MIN` and `SHARES_MAX`: Range for shares
- `PRICE_MIN` and `PRICE_MAX`: Range for price
- `DATE_RANGE_DAYS`: Date range for timestamps

### Modifying the Stress Test

You can customize the stress test by modifying the `CONFIG` object in `test/stress-test.ts`:

- `BASE_URL`: Base URL for the API
- `ENDPOINT`: Endpoint to test
- `CONCURRENT_REQUESTS`: Number of concurrent requests
- `TOTAL_REQUESTS`: Total number of requests to make
- `BATCH_DELAY`: Delay between batches of requests
- `SCENARIOS`: Test scenarios to run

### Modifying the Analysis

You can customize the analysis by modifying the `CONFIG` object in `test/analyze-results.ts`:

- `INPUT_FILE`: Input file with stress test results
- `OUTPUT_DIR`: Output directory for charts

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, check that:

- PostgreSQL is running
- The DATABASE_URL in .env is correct
- The database exists and is accessible

### API Server Issues

If you encounter API server issues, check that:

- The API server is running
- The BASE_URL in the stress test configuration is correct
- The API server is accessible from the stress test script

### Memory Issues

If you encounter memory issues when running the seed script or stress test, try:

- Reducing the TRADE_COUNT in the seed script
- Reducing the CONCURRENT_REQUESTS in the stress test
- Increasing the BATCH_DELAY in the stress test
