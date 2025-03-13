import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  // Input file with stress test results
  INPUT_FILE: 'stress-test-results.json',

  // Output directory for charts
  OUTPUT_DIR: 'stress-test-charts',
};

// Load results from file
function loadResults() {
  try {
    const data = fs.readFileSync(CONFIG.INPUT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading results file: ${error}`);
    process.exit(1);
  }
}

// Generate HTML report with staged test visualization
function generateStagedReport(results: any) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR);
  }

  // Extract stage results
  const stageResults = results.stageResults || [];

  // Prepare data for charts
  const concurrencyLevels = stageResults.map(
    (stage: any) => stage.concurrentUsers,
  );
  const responseTimes = stageResults.map((stage: any) => stage.avgResponseTime);
  const successRates = stageResults.map((stage: any) => stage.successRate);

  // Generate HTML file with charts
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staged Stress Test Results</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1, h2 {
      color: #333;
    }
    .summary {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    .chart-container {
      margin-bottom: 30px;
      padding: 15px;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0,0,0,0.05);
    }
    .chart {
      height: 400px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Staged Stress Test Results</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <p><strong>Start Time:</strong> ${new Date(results.startTime).toLocaleString()}</p>
      <p><strong>End Time:</strong> ${new Date(results.endTime).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${(new Date(results.endTime).getTime() - new Date(results.startTime).getTime()) / 1000} seconds</p>
      <p><strong>Total Requests:</strong> ${results.totalRequests}</p>
    </div>
    
    <h2>Stage Results</h2>
    <table>
      <thead>
        <tr>
          <th>Concurrent Users</th>
          <th>Success Rate</th>
          <th>Avg Response Time (ms)</th>
          <th>Request Count</th>
        </tr>
      </thead>
      <tbody>
        ${stageResults
          .map(
            (stage: any) => `
          <tr>
            <td>${stage.concurrentUsers}</td>
            <td>${stage.successRate.toFixed(2)}%</td>
            <td>${stage.avgResponseTime.toFixed(2)}</td>
            <td>${stage.requestCount}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
    
    <div class="chart-container">
      <h2>Response Time vs Concurrency</h2>
      <div class="chart">
        <canvas id="responseTimeChart"></canvas>
      </div>
    </div>
    
    <div class="chart-container">
      <h2>Success Rate vs Concurrency</h2>
      <div class="chart">
        <canvas id="successRateChart"></canvas>
      </div>
    </div>
    
    <h2>Scenario Results</h2>
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Requests</th>
          <th>Success Rate</th>
          <th>Avg Response Time (ms)</th>
          <th>Min Response Time (ms)</th>
          <th>Max Response Time (ms)</th>
          <th>P95 Response Time (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${results.scenarios
          .map(
            (scenario: any) => `
          <tr>
            <td>${scenario.name}</td>
            <td>${scenario.totalRequests}</td>
            <td>${((scenario.successfulRequests / scenario.totalRequests) * 100).toFixed(2)}%</td>
            <td>${scenario.avgResponseTime.toFixed(2)}</td>
            <td>${scenario.minResponseTime}</td>
            <td>${scenario.maxResponseTime}</td>
            <td>${scenario.p95ResponseTime}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
    
    <script>
      // Response Time vs Concurrency Chart
      const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
      new Chart(responseTimeCtx, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(concurrencyLevels)},
          datasets: [
            {
              label: 'Avg Response Time (ms)',
              data: ${JSON.stringify(responseTimes.map((time: number) => time.toFixed(2)))},
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Concurrent Users'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Response Time (ms)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'How Response Time Scales with Concurrency',
              font: {
                size: 16
              }
            }
          }
        }
      });
      
      // Success Rate vs Concurrency Chart
      const successRateCtx = document.getElementById('successRateChart').getContext('2d');
      new Chart(successRateCtx, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(concurrencyLevels)},
          datasets: [
            {
              label: 'Success Rate (%)',
              data: ${JSON.stringify(successRates.map((rate: number) => rate.toFixed(2)))},
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              tension: 0.1,
              pointRadius: 5,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Concurrent Users'
              }
            },
            y: {
              min: 0,
              max: 100,
              title: {
                display: true,
                text: 'Success Rate (%)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'How Success Rate Changes with Concurrency',
              font: {
                size: 16
              }
            }
          }
        }
      });
    </script>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'staged-report.html'),
    htmlContent,
  );
  console.log(
    `Staged report generated at ${path.join(CONFIG.OUTPUT_DIR, 'staged-report.html')}`,
  );
}

// Main function
function main() {
  console.log('Loading stress test results...');
  const results = loadResults();

  if (!results.stageResults || results.stageResults.length === 0) {
    console.error(
      'No staged test results found. Please run a staged stress test first.',
    );
    process.exit(1);
  }

  console.log('Generating staged report...');
  generateStagedReport(results);

  console.log('Visualization complete!');
}

main();
