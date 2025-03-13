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

// Generate HTML report
function generateReport(results: any) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR);
  }

  // Generate HTML file with charts
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stress Test Results</title>
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
      height: 300px;
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
    <h1>Stress Test Results</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <p><strong>Start Time:</strong> ${new Date(results.startTime).toLocaleString()}</p>
      <p><strong>End Time:</strong> ${new Date(results.endTime).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${(new Date(results.endTime).getTime() - new Date(results.startTime).getTime()) / 1000} seconds</p>
      <p><strong>Total Requests:</strong> ${results.totalRequests}</p>
      <p><strong>Concurrent Requests:</strong> ${results.concurrentRequests}</p>
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
          <th>Avg Response Size (KB)</th>
        </tr>
      </thead>
      <tbody>
        ${results.scenarios
          .map(
            (scenario) => `
          <tr>
            <td>${scenario.name}</td>
            <td>${scenario.totalRequests}</td>
            <td>${((scenario.successfulRequests / scenario.totalRequests) * 100).toFixed(2)}%</td>
            <td>${scenario.avgResponseTime.toFixed(2)}</td>
            <td>${scenario.minResponseTime}</td>
            <td>${scenario.maxResponseTime}</td>
            <td>${scenario.p95ResponseTime}</td>
            <td>${(scenario.avgResponseSize / 1024).toFixed(2)}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
    
    <div class="chart-container">
      <h2>Response Time Comparison</h2>
      <div class="chart">
        <canvas id="responseTimeChart"></canvas>
      </div>
    </div>
    
    <div class="chart-container">
      <h2>Success Rate Comparison</h2>
      <div class="chart">
        <canvas id="successRateChart"></canvas>
      </div>
    </div>
    
    <div class="chart-container">
      <h2>Response Size Comparison</h2>
      <div class="chart">
        <canvas id="responseSizeChart"></canvas>
      </div>
    </div>
    
    <script>
      // Response Time Chart
      const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
      new Chart(responseTimeCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(results.scenarios.map((s) => s.name))},
          datasets: [
            {
              label: 'Avg Response Time (ms)',
              data: ${JSON.stringify(results.scenarios.map((s) => s.avgResponseTime.toFixed(2)))},
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'P95 Response Time (ms)',
              data: ${JSON.stringify(results.scenarios.map((s) => s.p95ResponseTime))},
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Response Time (ms)'
              }
            }
          }
        }
      });
      
      // Success Rate Chart
      const successRateCtx = document.getElementById('successRateChart').getContext('2d');
      new Chart(successRateCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(results.scenarios.map((s) => s.name))},
          datasets: [
            {
              label: 'Success Rate (%)',
              data: ${JSON.stringify(results.scenarios.map((s) => ((s.successfulRequests / s.totalRequests) * 100).toFixed(2)))},
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Success Rate (%)'
              }
            }
          }
        }
      });
      
      // Response Size Chart
      const responseSizeCtx = document.getElementById('responseSizeChart').getContext('2d');
      new Chart(responseSizeCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(results.scenarios.map((s) => s.name))},
          datasets: [
            {
              label: 'Avg Response Size (KB)',
              data: ${JSON.stringify(results.scenarios.map((s) => (s.avgResponseSize / 1024).toFixed(2)))},
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Response Size (KB)'
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

  fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, 'report.html'), htmlContent);
  console.log(
    `Report generated at ${path.join(CONFIG.OUTPUT_DIR, 'report.html')}`,
  );
}

// Main function
function main() {
  console.log('Loading stress test results...');
  const results = loadResults();

  console.log('Generating report...');
  generateReport(results);

  console.log('Analysis complete!');
}

main();
