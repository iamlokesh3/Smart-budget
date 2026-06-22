# Smart Budget AI — K6 Load Testing Framework

This directory contains the production-grade, highly scalable load testing project for the **Smart Budget AI Expense Tracker and Financial Advisor** web and mobile application.

## Project Structure

```
load-testing/
│
├── config/
│    └── config.js        # Global configs (target URL, duration, SLA thresholds)
├── data/
│    └── data.js          # Seed users and data generation utilities
├── utils/
│    └── utils.js         # Reusable request functions (GET, POST, PUT, DELETE) and check assertions
├── scenarios/            # 40 Screen-specific scenario files
│    ├── login.js
│    ├── dashboard.js
│    ├── ...
│    └── logout.js
│
├── reports/              # Generated summary JSON, CSV metrics, HTML charts, and Excel workbooks
├── main.js               # Central entry-point orchestrating all 40 scenarios
├── package.json          # Node script and dependency orchestrator
└── README.md             # Guide and usage instructions
```

## Setup & Prerequisites

1. **Install Grafana K6**:
   Follow instructions at [k6.io](https://k6.io/docs/getting-started/installation/) to install the K6 runner on your environment.
   - For Windows: `winget install k6` or `choco install k6`
   - For Linux: `sudo apt-get install k6`
   - For macOS: `brew install k6`

2. **Install Node.js Dependencies**:
   Install ExcelJS dependencies to compile the consolidated Excel workbook:
   ```bash
   npm install --prefix load-testing
   ```

## Running the Performance Scan

### 1. Default Peak Load Scan (310 VUs per module, 1 minute)
Ensure the Express backend is running (typically on `http://localhost:5000`), then trigger the central runner:
```bash
k6 run load-testing/main.js
```

### 2. Overriding Execution Variables via Environment
You can easily scale the duration, target URL, and concurrent users:
```bash
# Target production server with 100 concurrent VUs for 5 minutes
k6 run -e BASE_URL=https://your-production.com -e VUS=100 -e TEST_DURATION=5m load-testing/main.js
```

## Compiling Performance Reports

Once K6 completes execution, it outputs a summary JSON under `load-testing/reports/summary.json`. Run the reporting suite to compile the Navy-blue styled spreadsheet:
```bash
# Run report generator
npm run --prefix load-testing report:all
```

This compiles:
- **`load-testing/reports/Load_Testing_Report.xlsx`**: An styled Excel workbook with Summary Dashboard, Screen Performance Metrics, 400 Test Cases, and Execution Logs.
- **`load-testing/reports/Load_Testing_Test_Cases.md`**: Consolidated Markdown matrix showing exactly 400 test cases with assertion verification details.

## SLA Targets & Thresholds
- **Success Rate:** ≥ 99.00%
- **Error Rate:** < 1.00%
- **Average Response Time:** < 500 ms
- **95th Percentile Response Time:** < 1000 ms
