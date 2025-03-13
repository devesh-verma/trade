`NOTE`: I have primary worked with NoSQL.

### Running the server

```sh
# makes use of prisma
pnpm start:dev
# makes use of prisma
pnpm start:dev:prisma
# makes use of drizzle
pnpm start:drizzle
# makes use of native postgres
pnpm start:native
```

# Trade API Performance Testing

### Stress Testing

`NOTE`: Mark the route GET /trades as public using the `@Public` decorator.

I tried to stress test with prisma, drizzle and native postgres. For which I stress tested with staged testing, basically increasing load and traditional way with 1Lakh rows in trades table. My findings as follows for fetching all trades:

<details>
<summary>1️. GET /trades - Prisma: with rawQuery gave the best performance</summary>

<details>
<summary>Without staged testing: </summary>

```logs
  Checking if server is running...
  Starting traditional stress test with 50 concurrent requests...
  Total requests: 1000 per scenario
  Scenarios: All trades, Filter by buy type, Filter by sell type, User 125 trades, User 127 sell trades

  Running scenario: All trades
  Batch 1/4: 50 requests
    Success rate: 100.00%, Avg response time: 7604.40ms
  Batch 2/4: 50 requests
    Success rate: 100.00%, Avg response time: 7472.38ms
  Batch 3/4: 50 requests
    Success rate: 100.00%, Avg response time: 7222.76ms
  Batch 4/4: 50 requests
    Success rate: 100.00%, Avg response time: 7177.54ms

  Running scenario: Filter by buy type
  Batch 1/4: 50 requests
    Success rate: 100.00%, Avg response time: 3008.26ms
  Batch 2/4: 50 requests
    Success rate: 100.00%, Avg response time: 3028.14ms
  Batch 3/4: 50 requests
    Success rate: 100.00%, Avg response time: 2966.66ms
  Batch 4/4: 50 requests
    Success rate: 100.00%, Avg response time: 2988.54ms

  Running scenario: Filter by sell type
  Batch 1/4: 50 requests
    Success rate: 100.00%, Avg response time: 3115.20ms
  Batch 2/4: 50 requests
    Success rate: 100.00%, Avg response time: 3002.76ms
  Batch 3/4: 50 requests
    Success rate: 100.00%, Avg response time: 2995.56ms
  Batch 4/4: 50 requests
    Success rate: 100.00%, Avg response time: 2958.42ms

  Running scenario: User 125 trades
  Batch 1/4: 50 requests
    Success rate: 100.00%, Avg response time: 362.90ms
  Batch 2/4: 50 requests
    Success rate: 100.00%, Avg response time: 387.80ms
  Batch 3/4: 50 requests
    Success rate: 100.00%, Avg response time: 428.38ms
  Batch 4/4: 50 requests
    Success rate: 100.00%, Avg response time: 399.74ms

  Running scenario: User 127 sell trades
  Batch 1/4: 50 requests
    Success rate: 100.00%, Avg response time: 214.06ms
  Batch 2/4: 50 requests
    Success rate: 100.00%, Avg response time: 214.28ms
  Batch 3/4: 50 requests
    Success rate: 100.00%, Avg response time: 207.20ms
  Batch 4/4: 50 requests
    Success rate: 100.00%, Avg response time: 207.88ms

  === STRESS TEST SUMMARY ===
  Total requests: 1000
  Duration: 77939ms

  Scenario: All trades
    Requests: 200 (200 successful, 0 failed)
    Response time: min=444ms, avg=7369.27ms, max=7782ms, p95=7775ms
    Avg response size: 12067.91KB

  Scenario: Filter by buy type
    Requests: 200 (200 successful, 0 failed)
    Response time: min=232ms, avg=2997.90ms, max=3561ms, p95=3552ms
    Avg response size: 5996.84KB

  Scenario: Filter by sell type
    Requests: 200 (200 successful, 0 failed)
    Response time: min=240ms, avg=3017.99ms, max=3532ms, p95=3520ms
    Avg response size: 6071.07KB

  Scenario: User 125 trades
    Requests: 200 (200 successful, 0 failed)
    Response time: min=41ms, avg=394.70ms, max=746ms, p95=682ms
    Avg response size: 1225.10KB

  Scenario: User 127 sell trades
    Requests: 200 (200 successful, 0 failed)
    Response time: min=46ms, avg=210.85ms, max=370ms, p95=352ms
    Avg response size: 606.86KB
```

</details>
<details>
<summary>With staged testing</summary>

```
Checking if server is running...
Running staged stress test with gradually increasing concurrency...

Running scenario: All trades
Testing with 5 concurrent users...
  Success rate: 100.00%, Avg response time: 858.60ms
Testing with 10 concurrent users...
  Success rate: 100.00%, Avg response time: 1598.50ms
Testing with 20 concurrent users...
  Success rate: 100.00%, Avg response time: 3341.45ms
Testing with 50 concurrent users...
  Success rate: 100.00%, Avg response time: 7095.44ms
Testing with 100 concurrent users...
  Success rate: 100.00%, Avg response time: 14657.83ms

Running scenario: Filter by buy type
Testing with 5 concurrent users...
  Success rate: 100.00%, Avg response time: 476.00ms
Testing with 10 concurrent users...
  Success rate: 100.00%, Avg response time: 771.60ms
Testing with 20 concurrent users...
  Success rate: 100.00%, Avg response time: 1389.25ms
Testing with 50 concurrent users...
  Success rate: 100.00%, Avg response time: 3259.58ms
Testing with 100 concurrent users...
  Success rate: 100.00%, Avg response time: 5849.94ms

Running scenario: Filter by sell type
Testing with 5 concurrent users...
  Success rate: 100.00%, Avg response time: 529.40ms
Testing with 10 concurrent users...
  Success rate: 100.00%, Avg response time: 738.10ms
Testing with 20 concurrent users...
  Success rate: 100.00%, Avg response time: 1364.60ms
Testing with 50 concurrent users...
  Success rate: 100.00%, Avg response time: 3174.32ms
Testing with 100 concurrent users...
  Success rate: 100.00%, Avg response time: 5732.32ms

Running scenario: User 128 trades
Testing with 5 concurrent users...
  Success rate: 100.00%, Avg response time: 87.00ms
Testing with 10 concurrent users...
  Success rate: 100.00%, Avg response time: 114.50ms
Testing with 20 concurrent users...
  Success rate: 100.00%, Avg response time: 187.85ms
Testing with 50 concurrent users...
  Success rate: 100.00%, Avg response time: 536.48ms
Testing with 100 concurrent users...
  Success rate: 100.00%, Avg response time: 912.66ms

Running scenario: User 131 sell trades
Testing with 5 concurrent users...
  Success rate: 100.00%, Avg response time: 46.80ms
Testing with 10 concurrent users...
  Success rate: 100.00%, Avg response time: 69.40ms
Testing with 20 concurrent users...
  Success rate: 100.00%, Avg response time: 113.70ms
Testing with 50 concurrent users...
  Success rate: 100.00%, Avg response time: 292.56ms
Testing with 100 concurrent users...
  Success rate: 100.00%, Avg response time: 471.53ms

=== STRESS TEST SUMMARY ===
Total requests: 925
Duration: 84846ms

=== STAGE RESULTS ===
Concurrent Users: 5
  Success Rate: 100.00%
  Avg Response Time: 858.60ms
  Request Count: 5
---
Concurrent Users: 10
  Success Rate: 100.00%
  Avg Response Time: 1598.50ms
  Request Count: 10
---
Concurrent Users: 20
  Success Rate: 100.00%
  Avg Response Time: 3341.45ms
  Request Count: 20
---
Concurrent Users: 50
  Success Rate: 100.00%
  Avg Response Time: 7095.44ms
  Request Count: 50
---
Concurrent Users: 100
  Success Rate: 100.00%
  Avg Response Time: 14657.83ms
  Request Count: 100
---
Concurrent Users: 5
  Success Rate: 100.00%
  Avg Response Time: 476.00ms
  Request Count: 5
---
Concurrent Users: 10
  Success Rate: 100.00%
  Avg Response Time: 771.60ms
  Request Count: 10
---
Concurrent Users: 20
  Success Rate: 100.00%
  Avg Response Time: 1389.25ms
  Request Count: 20
---
Concurrent Users: 50
  Success Rate: 100.00%
  Avg Response Time: 3259.58ms
  Request Count: 50
---
Concurrent Users: 100
  Success Rate: 100.00%
  Avg Response Time: 5849.94ms
  Request Count: 100
---
Concurrent Users: 5
  Success Rate: 100.00%
  Avg Response Time: 529.40ms
  Request Count: 5
---
Concurrent Users: 10
  Success Rate: 100.00%
  Avg Response Time: 738.10ms
  Request Count: 10
---
Concurrent Users: 20
  Success Rate: 100.00%
  Avg Response Time: 1364.60ms
  Request Count: 20
---
Concurrent Users: 50
  Success Rate: 100.00%
  Avg Response Time: 3174.32ms
  Request Count: 50
---
Concurrent Users: 100
  Success Rate: 100.00%
  Avg Response Time: 5732.32ms
  Request Count: 100
---
Concurrent Users: 5
  Success Rate: 100.00%
  Avg Response Time: 87.00ms
  Request Count: 5
---
Concurrent Users: 10
  Success Rate: 100.00%
  Avg Response Time: 114.50ms
  Request Count: 10
---
Concurrent Users: 20
  Success Rate: 100.00%
  Avg Response Time: 187.85ms
  Request Count: 20
---
Concurrent Users: 50
  Success Rate: 100.00%
  Avg Response Time: 536.48ms
  Request Count: 50
---
Concurrent Users: 100
  Success Rate: 100.00%
  Avg Response Time: 912.66ms
  Request Count: 100
---
Concurrent Users: 5
  Success Rate: 100.00%
  Avg Response Time: 46.80ms
  Request Count: 5
---
Concurrent Users: 10
  Success Rate: 100.00%
  Avg Response Time: 69.40ms
  Request Count: 10
---
Concurrent Users: 20
  Success Rate: 100.00%
  Avg Response Time: 113.70ms
  Request Count: 20
---
Concurrent Users: 50
  Success Rate: 100.00%
  Avg Response Time: 292.56ms
  Request Count: 50
---
Concurrent Users: 100
  Success Rate: 100.00%
  Avg Response Time: 471.53ms
  Request Count: 100
---

Scenario: All trades
  Requests: 185 (185 successful, 0 failed)
  Response time: min=841ms, avg=10311.69ms, max=15149ms, p95=15137ms
  Avg response size: 12067.91KB

Scenario: Filter by buy type
  Requests: 185 (185 successful, 0 failed)
  Response time: min=218ms, avg=4247.86ms, max=7106ms, p95=7100ms
  Avg response size: 5996.84KB

Scenario: Filter by sell type
  Requests: 185 (185 successful, 0 failed)
  Response time: min=231ms, avg=4158.21ms, max=6762ms, p95=6758ms
  Avg response size: 6071.07KB

Scenario: User 128 trades
  Requests: 185 (185 successful, 0 failed)
  Response time: min=59ms, avg=667.17ms, max=1383ms, p95=1382ms
  Avg response size: 1211.94KB

Scenario: User 131 sell trades
  Requests: 185 (185 successful, 0 failed)
  Response time: min=35ms, avg=351.26ms, max=692ms, p95=692ms
  Avg response size: 606.06KB
```

</details>

</details>

2. GET /trades - Native Postgres: was comparable with prisma rawQuery but saw failures with increasing concurrency
3. GET /trades - Drizzle: has almost double the time when compared to prisma raw query
4. GET /trades - Prisma: without rawQuery has the worst time

## ORM Implementation Comparison

This project includes three different ORM implementations for the Trade APIs:

1. **Prisma ORM**
2. **Drizzle ORM**
3. **Native PostgreSQL**

### Running Performance Tests

You can run stress tests with different ORM implementations using the following commands:

```bash
# Run tests with specific implementation
pnpm stress:prisma
pnpm stress:drizzle
pnpm stress:native
```

The test results will be saved in the `results` directory:

- Individual results: `stress-test-results-{orm}.json`
- Comparison report: `comparison-report.json`

### Switching ORM Implementation

The active ORM implementation can be switched using the `ORM_TYPE` environment variable:

```bash
pnpm start:dev:prisma  # Use Prisma ORM
pnpm start:dev:drizzle # Use Drizzle ORM
pnpm start:dev:native  # Use Native PostgreSQL
```

### Implementation Details

Each ORM implementation follows the Repository pattern and implements the same interface:

```typescript
interface ITradeRepository {
  findAll(params: {
    type?: string;
    userId?: string;
  }): Promise<{Trade[]}>;

  findById(id: string): Promise<Trade | null>;

  create(data: ITradeRequest): Promise<Trade>;
}
```

This allows for easy comparison between different implementations while maintaining consistent behavior across the application.
