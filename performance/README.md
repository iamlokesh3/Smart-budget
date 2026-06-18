# Smart Budget Performance Testing Framework

This directory contains the **k6 performance and load testing framework** for the Smart Budget web and Android application.

## 📁 Folder Structure

```
performance/
├── k6-config.js              # Shared config, thresholds, test data
├── package.json              # Node.js dependencies for report generation
├── run-tests.ps1             # Windows PowerShell runner
│
├── tests/
│   ├── loginTest.js          # TC_LOGIN_001..007 (7 test cases)
│   ├── registrationTest.js   # TC_REG_001..006   (6 test cases)
│   ├── dashboardTest.js      # TC_DASH_001..006  (6 test cases)
│   ├── expenseTest.js        # TC_EXP_001..006   (6 test cases)
│   ├── budgetTest.js         # TC_BUD_001..005   (5 test cases)
│   ├── aiAdvisorTest.js      # TC_AI_001..005    (5 test cases)
│   └── fullLoadTest.js       # Full ramp test — all APIs
│
├── scripts/
│   ├── generateReport.js     # → reports/Load_Test_Report.xlsx
│   └── generateDocs.js       # → docs/TestCases.xlsx
│
├── reports/                  # Auto-generated (gitignored)
│   ├── results.csv
│   ├── Load_Test_Report.xlsx
│   ├── *_summary.json
│   └── graphs/
│       └── performance_data.json
│
└── docs/                     # Auto-generated (gitignored)
    └── TestCases.xlsx
```

**Total Test Cases: 35** across 6 modules.

---

## 🛠️ Prerequisites

### 1. Install k6

```powershell
# Windows (via winget)
winget install k6 --source winget

# Or via Chocolatey
choco install k6

# Verify
k6 version
```

### 2. Install Node.js dependencies (report generator)

```powershell
cd performance
npm install
```

---

## 🚀 Running Tests

### Quick Start (Windows)

```powershell
cd performance
.\run-tests.ps1                      # Smoke test (10 users, 1 min)
.\run-tests.ps1 -Scenario load       # Load test (100 users, 5 min)
.\run-tests.ps1 -Scenario stress     # Stress test (500 users, 10 min)
.\run-tests.ps1 -Scenario spike      # Spike test (1000 users, 2 min)
.\run-tests.ps1 -Scenario full       # Full ramp (0→100→300→500→1000→0)
.\run-tests.ps1 -Scenario all        # Run ALL individual test files
.\run-tests.ps1 -ReportOnly          # Generate reports from existing data
```

### npm Scripts

```powershell
cd performance
npm run test:smoke         # Smoke — 10 VUs, 1 min
npm run test:load          # Load  — 100 VUs, 5 min
npm run test:stress        # Stress — ramp to 500
npm run test:spike         # Spike — 1000 VUs burst
npm run test:full          # Full ramp 0→1000→0

npm run test:login         # Only login tests
npm run test:registration  # Only registration tests
npm run test:dashboard     # Only dashboard tests
npm run test:expense       # Only expense tests
npm run test:budget        # Only budget tests
npm run test:ai            # Only AI advisor tests

npm run report:generate    # Generate Excel + CSV
npm run docs:generate      # Generate TestCases.xlsx
npm run report:all         # Both reports
npm run run:all            # Run all tests then generate reports
```

### Direct k6 Commands

```bash
# Individual test files
k6 run tests/loginTest.js
k6 run --env SCENARIO=smoke tests/loginTest.js

# Full load test with CSV output
k6 run --env SCENARIO=full --out csv=reports/results.csv tests/fullLoadTest.js

# With custom backend URL
k6 run --env BASE_URL=https://yourapp.onrender.com tests/fullLoadTest.js
```

---

## 📊 Test Scenarios

| Scenario | Users | Duration | Purpose |
|----------|-------|----------|---------|
| **Smoke** | 10 | 1 min | Sanity check |
| **Load** | 100 | 5 min | Normal production load |
| **Stress** | 500 | 10 min | Beyond normal capacity |
| **Spike** | 1000 | 2 min | Sudden traffic burst |
| **Full Ramp** | 0→100→300→500→1000→0 | 14 min | Gradual ramp + spike |

---

## 📈 Ramp-Up Stages (Full Load Test)

```
Users
1000 │          ████████
 800 │        ██        ██
 500 │    ████              ██
 300 │  ██                    ██
 100 │██                        ██
   0 ┼──────────────────────────────→ Time
     0  1  3  5  7  9  11 13 14 min
```

---

## 📋 Test Cases

| Module | Cases | Test IDs |
|--------|-------|----------|
| Login | 7 | TC_LOGIN_001..007 |
| Registration | 6 | TC_REG_001..006 |
| Dashboard | 6 | TC_DASH_001..006 |
| Expense | 6 | TC_EXP_001..006 |
| Budget | 5 | TC_BUD_001..005 |
| AI Advisor | 5 | TC_AI_001..005 |
| **Total** | **35** | |

---

## 📁 Generated Reports

After running tests + report generation:

| File | Contents |
|------|----------|
| `reports/Load_Test_Report.xlsx` | 5-sheet Excel: Summary, Metrics, Pass-Fail, HTTP Stats, Ramp Stages |
| `reports/results.csv` | k6 raw metric CSV output |
| `reports/graphs/performance_data.json` | Chart-ready JSON for visualization |
| `docs/TestCases.xlsx` | All 35 test cases with pass/fail, priority, automation file |

---

## 🔑 SLA Thresholds

| Metric | Smoke | Load | Stress | Spike |
|--------|-------|------|--------|-------|
| P95 response | < 1000 ms | < 2000 ms | < 2000 ms | < 5000 ms |
| P99 response | < 3000 ms | < 5000 ms | < 5000 ms | < 10000 ms |
| Error rate | < 1% | < 5% | < 5% | < 10% |

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:5000` | Backend API base URL |
| `SCENARIO` | `smoke` | Test scenario to run |

---

## 🤖 GitHub Actions

The workflow `.github/workflows/k6-performance-tests.yml`:
- Triggers on push to `main`/`develop`, PRs, and daily schedule
- Installs k6 and Node.js dependencies
- Starts the backend server automatically
- Runs all 6 test modules + full load test
- Generates Excel + CSV reports
- Uploads artifacts (30-day retention)
- Comments performance summary on PRs

**Manual Trigger:**
1. Go to GitHub → Actions → `k6 Performance & Load Tests`
2. Click **Run workflow**
3. Select scenario: `smoke`, `load`, `stress`, `spike`, `full`, or `all`
