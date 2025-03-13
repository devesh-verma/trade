# Staged Stress Testing for GET /trades Endpoint

This document explains how to perform staged stress testing on the GET /trades endpoint, gradually increasing the concurrency level to identify performance bottlenecks.

## What is Staged Stress Testing?

Staged stress testing involves gradually increasing the load on your API to observe how it behaves under different levels of concurrency. This approach helps you:

1. Identify the point at which performance begins to degrade
2. Understand how response time scales with increasing load
3. Determine the maximum concurrency your API can handle before failure
4. Make data-driven decisions about scaling and optimization

## How Our Staged Testing Works

Our implementation:

1. Starts with a low number of concurrent users (e.g., 5)
2. Gradually increases to higher concurrency levels (e.g., 50, 100, 200)
3. Measures response time and success rate at each stage
4. Visualizes the results to identify performance patterns

## Running the Staged Stress Test

### Prerequisites

- Node.js and npm/pnpm installed
- PostgreSQL database running with test data
- Trade API application running

### Step 1: Seed the Database

Before running the stress test, populate the database with test data:

```bash
pnpm seed
```

### Step 2: Run the Staged Stress Test

```bash
# Start the API server in one terminal
pnpm start:dev

# Run the staged stress test in another terminal
pnpm staged-test
```

The test will:

- Run through each defined concurrency stage
- Test different API scenarios (all trades, filtered by type, etc.)
- Collect performance metrics at each stage
- Save the results to a JSON file

### Step 3: Visualize the Results

```bash
# Generate an HTML report with visualizations
pnpm visualize-staged
```

This will create a report at `stress-test-charts/staged-report.html` with:

- Line charts showing how response time scales with concurrency
- Line charts showing how success rate changes with concurrency
- Detailed tables of results for each stage and scenario

## Configuring the Staged Test

You can customize the staged test by modifying the `CONFIG` object in `test/stress-test.ts`:

```typescript
const CONFIG = {
  // ... other settings ...

  // Staged testing configuration
  STAGED_TESTING: true,
  STAGES: [5, 50, 100, 200], // Concurrency levels to test
  REQUESTS_PER_STAGE: 100, // Number of requests per stage
};
```

## Interpreting the Results

When analyzing the staged test results, look for:

### 1. Response Time Scaling

The relationship between concurrency and response time typically follows one of these patterns:

- **Linear**: Response time increases proportionally with concurrency
- **Exponential**: Response time grows rapidly after a certain concurrency threshold
- **Plateau**: Response time stabilizes after initial growth

### 2. Success Rate Drops

Watch for points where the success rate begins to drop. This often indicates:

- Database connection pool exhaustion
- CPU/memory limitations
- Timeouts or other resource constraints

### 3. Optimal Concurrency

The "knee point" in the response time curve often represents the optimal concurrency level for your API - the point where you get maximum throughput without excessive response times.

## Next Steps After Testing

Based on the results, consider:

1. **Database Optimization**:

   - Add indexes for frequently queried fields
   - Optimize query patterns

2. **API Optimization**:

   - Implement pagination
   - Limit result set size
   - Add caching

3. **Infrastructure Scaling**:
   - Increase database connection pool
   - Scale horizontally with more API instances
   - Implement load balancing

## Conclusion

Staged stress testing provides valuable insights into how your API performs under different load conditions. By gradually increasing concurrency and measuring the results, you can make informed decisions about optimization and scaling strategies.
