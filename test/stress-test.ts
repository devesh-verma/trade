import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as http from 'http';

// Configuration
const CONFIG = {
  // Base URL for the API
  BASE_URL: 'http://localhost:3000',

  // Endpoint to test (including the 'api' prefix)
  ENDPOINT: '/api/trades',

  // Number of concurrent requests (for traditional testing)
  CONCURRENT_REQUESTS: 50,

  // Total number of requests to make
  TOTAL_REQUESTS: 1000,

  // Delay between batches of requests (in ms)
  BATCH_DELAY: 1000,

  // Output file for results
  OUTPUT_FILE: 'stress-test-results.json',

  // Test scenarios
  SCENARIOS: [
    { name: 'All trades', params: '' },
    { name: 'Filter by buy type', params: '?type=buy' },
    { name: 'Filter by sell type', params: '?type=sell' },
    // Dynamic scenarios will be added based on user IDs
  ],

  // Staged testing configuration
  STAGED_TESTING: true,
  STAGES: [5, 10, 20, 50, 100], // Gradually increasing concurrency levels
  REQUESTS_PER_STAGE: 100, // Number of requests per stage
};

// Results storage
interface RequestResult {
  scenario: string;
  statusCode: number;
  responseTime: number;
  responseSize: number;
  timestamp: string;
  concurrentUsers?: number; // Added to track concurrency level
  error?: string;
}

interface ScenarioResult {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  minResponseTime: number;
  maxResponseTime: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  avgResponseSize: number;
}

interface StageResult {
  concurrentUsers: number;
  avgResponseTime: number;
  successRate: number;
  requestCount: number;
}

interface TestResults {
  startTime: string;
  endTime: string;
  totalRequests: number;
  concurrentRequests: number;
  scenarios: ScenarioResult[];
  stageResults?: StageResult[]; // Added for staged testing
  requestResults: RequestResult[];
}

const results: TestResults = {
  startTime: new Date().toISOString(),
  endTime: '',
  totalRequests: 0,
  concurrentRequests: CONFIG.CONCURRENT_REQUESTS,
  scenarios: [],
  stageResults: [], // Initialize stage results
  requestResults: [],
};

// Helper function to make a request and measure performance
function makeRequest(
  scenario: {
    name: string;
    params: string;
  },
  concurrentUsers?: number,
): Promise<RequestResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = `${CONFIG.BASE_URL}${CONFIG.ENDPOINT}${scenario.params}`;

    const req = http.get(url, (res) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let data = '';
      let responseSize = 0;

      res.on('data', (chunk) => {
        data += chunk;
        responseSize += chunk.length;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        resolve({
          scenario: scenario.name,
          statusCode: res.statusCode || 0,
          responseTime,
          responseSize,
          timestamp: new Date().toISOString(),
          concurrentUsers, // Track concurrency level
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      resolve({
        scenario: scenario.name,
        statusCode: 0,
        responseTime,
        responseSize: 0,
        timestamp: new Date().toISOString(),
        concurrentUsers, // Track concurrency level
        error: error.message,
      });
    });

    req.end();
  });
}

// Helper function to calculate percentile
function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;

  values.sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * values.length) - 1;
  return values[index];
}

// Process results for a scenario
function processScenarioResults(
  scenarioName: string,
  scenarioResults: RequestResult[],
): ScenarioResult {
  const responseTimes = scenarioResults.map((r) => r.responseTime);
  const successfulRequests = scenarioResults.filter(
    (r) => r.statusCode >= 200 && r.statusCode < 300,
  );

  return {
    name: scenarioName,
    totalRequests: scenarioResults.length,
    successfulRequests: successfulRequests.length,
    failedRequests: scenarioResults.length - successfulRequests.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    avgResponseTime:
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    p95ResponseTime: percentile(responseTimes, 95),
    avgResponseSize:
      scenarioResults.reduce((a, b) => a + b.responseSize, 0) /
      scenarioResults.length,
  };
}

// Generate dynamic test scenarios
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateDynamicScenarios(): Promise<void> {
  try {
    // Make a request to get some trades first
    const response = await new Promise<any>((resolve, reject) => {
      http
        .get(`${CONFIG.BASE_URL}${CONFIG.ENDPOINT}`, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        })
        .on('error', reject);
    });

    if (Array.isArray(response) && response.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(response.map((trade: any) => trade.user_id))];

      // Add a scenario with a random user ID if available
      if (userIds.length > 0) {
        const randomUserId = faker.helpers.arrayElement(userIds);
        CONFIG.SCENARIOS.push({
          name: `User ${randomUserId} trades`,
          params: `?user_id=${randomUserId}`,
        });
      }

      // Add a scenario with a random user ID and type
      const userIdsAndTypes = [
        ...new Set(
          response.map((trade: any) => ({
            user_id: trade.user_id,
            type: trade.type,
          })),
        ),
      ];
      if (userIdsAndTypes.length > 0) {
        const randomUserAndType = faker.helpers.arrayElement(userIdsAndTypes);
        CONFIG.SCENARIOS.push({
          name: `User ${randomUserAndType.user_id} ${randomUserAndType.type} trades`,
          params: `?user_id=${randomUserAndType.user_id}&type=${randomUserAndType.type}`,
        });
      }
    }
  } catch (error) {
    console.error('Error generating dynamic scenarios:', error);
    // Continue with default scenarios
  }
}

// Run staged stress test with gradually increasing concurrency
async function runStagedStressTest() {
  console.log(
    'Running staged stress test with gradually increasing concurrency...',
  );

  for (const scenario of CONFIG.SCENARIOS) {
    console.log(`\nRunning scenario: ${scenario.name}`);

    for (const concurrentUsers of CONFIG.STAGES) {
      console.log(`Testing with ${concurrentUsers} concurrent users...`);

      // Create batch of concurrent requests
      const batchRequests = Array(concurrentUsers)
        .fill(null)
        .map(() => makeRequest(scenario, concurrentUsers));

      // Execute all requests concurrently
      const batchResults = await Promise.all(batchRequests);

      // Add results to overall results
      results.requestResults.push(...batchResults);
      results.totalRequests += batchResults.length;

      // Calculate success rate and average response time for this stage
      const successRate =
        (batchResults.filter((r) => r.statusCode >= 200 && r.statusCode < 300)
          .length /
          batchResults.length) *
        100;
      const avgResponseTime =
        batchResults.reduce((a, b) => a + b.responseTime, 0) /
        batchResults.length;

      // Add stage result
      results.stageResults?.push({
        concurrentUsers,
        avgResponseTime,
        successRate,
        requestCount: batchResults.length,
      });

      console.log(
        `  Success rate: ${successRate.toFixed(2)}%, Avg response time: ${avgResponseTime.toFixed(2)}ms`,
      );

      // Add delay between stages
      await new Promise((resolve) => setTimeout(resolve, CONFIG.BATCH_DELAY));
    }
  }
}

// Run traditional stress test with fixed concurrency
async function runTraditionalStressTest() {
  console.log(
    `Starting traditional stress test with ${CONFIG.CONCURRENT_REQUESTS} concurrent requests...`,
  );
  console.log(`Total requests: ${CONFIG.TOTAL_REQUESTS} per scenario`);
  console.log(`Scenarios: ${CONFIG.SCENARIOS.map((s) => s.name).join(', ')}`);

  const requestsPerScenario = Math.floor(
    CONFIG.TOTAL_REQUESTS / CONFIG.SCENARIOS.length,
  );
  const batchSize = CONFIG.CONCURRENT_REQUESTS;
  const batches = Math.ceil(requestsPerScenario / batchSize);

  for (const scenario of CONFIG.SCENARIOS) {
    console.log(`\nRunning scenario: ${scenario.name}`);

    for (let batch = 0; batch < batches; batch++) {
      const batchRequests = Math.min(
        batchSize,
        requestsPerScenario - batch * batchSize,
      );
      console.log(`Batch ${batch + 1}/${batches}: ${batchRequests} requests`);

      const requests = Array(batchRequests)
        .fill(null)
        .map(() => makeRequest(scenario));
      const batchResults = await Promise.all(requests);

      results.requestResults.push(...batchResults);
      results.totalRequests += batchResults.length;

      const successRate =
        (batchResults.filter((r) => r.statusCode >= 200 && r.statusCode < 300)
          .length /
          batchResults.length) *
        100;
      const avgResponseTime =
        batchResults.reduce((a, b) => a + b.responseTime, 0) /
        batchResults.length;

      console.log(
        `  Success rate: ${successRate.toFixed(2)}%, Avg response time: ${avgResponseTime.toFixed(2)}ms`,
      );

      // Add delay between batches
      if (batch < batches - 1) {
        await new Promise((resolve) => setTimeout(resolve, CONFIG.BATCH_DELAY));
      }
    }
  }
}

// Run the stress test
async function runStressTest() {
  // Generate dynamic scenarios based on actual data
  await generateDynamicScenarios();

  // Run either staged or traditional stress test based on configuration
  if (CONFIG.STAGED_TESTING) {
    await runStagedStressTest();
  } else {
    await runTraditionalStressTest();
  }

  // Process final results for scenarios
  for (const scenario of CONFIG.SCENARIOS) {
    const scenarioResults = results.requestResults.filter(
      (r) => r.scenario === scenario.name,
    );
    results.scenarios.push(
      processScenarioResults(scenario.name, scenarioResults),
    );
  }

  results.endTime = new Date().toISOString();

  // Save results to file
  fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n=== STRESS TEST SUMMARY ===');
  console.log(`Total requests: ${results.totalRequests}`);
  console.log(
    `Duration: ${new Date(results.endTime).getTime() - new Date(results.startTime).getTime()}ms`,
  );

  // Print stage results if staged testing was used
  if (CONFIG.STAGED_TESTING && results.stageResults) {
    console.log('\n=== STAGE RESULTS ===');
    for (const stageResult of results.stageResults) {
      console.log(`Concurrent Users: ${stageResult.concurrentUsers}`);
      console.log(`  Success Rate: ${stageResult.successRate.toFixed(2)}%`);
      console.log(
        `  Avg Response Time: ${stageResult.avgResponseTime.toFixed(2)}ms`,
      );
      console.log(`  Request Count: ${stageResult.requestCount}`);
      console.log('---');
    }
  }

  // Print scenario results
  for (const scenario of results.scenarios) {
    console.log(`\nScenario: ${scenario.name}`);
    console.log(
      `  Requests: ${scenario.totalRequests} (${scenario.successfulRequests} successful, ${scenario.failedRequests} failed)`,
    );
    console.log(
      `  Response time: min=${scenario.minResponseTime}ms, avg=${scenario.avgResponseTime.toFixed(2)}ms, max=${scenario.maxResponseTime}ms, p95=${scenario.p95ResponseTime}ms`,
    );
    console.log(
      `  Avg response size: ${(scenario.avgResponseSize / 1024).toFixed(2)}KB`,
    );
  }
}

// Check if server is running before starting the test
function checkServerStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`${CONFIG.BASE_URL}/`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

// Main function
async function main() {
  console.log('Checking if server is running...');
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.error(
      'Server is not running. Please start the server before running the stress test.',
    );
    process.exit(1);
  }

  await runStressTest();
}

main().catch(console.error);
