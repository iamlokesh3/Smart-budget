# Smart Budget — k6 Performance Test Runner (PowerShell / Windows)
# ==================================================================
# Usage:
#   .\run-tests.ps1                    # Run smoke test (default)
#   .\run-tests.ps1 -Scenario load     # Load test
#   .\run-tests.ps1 -Scenario stress   # Stress test
#   .\run-tests.ps1 -Scenario spike    # Spike test
#   .\run-tests.ps1 -Scenario full     # Full ramp test
#   .\run-tests.ps1 -Scenario all      # All individual tests
#   .\run-tests.ps1 -ReportOnly        # Generate reports from existing summaries
# ==================================================================

param(
    [string]$Scenario   = "smoke",
    [string]$BaseUrl    = "http://localhost:5000",
    [switch]$ReportOnly = $false,
    [switch]$SkipBackend= $false
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Colors
function Write-Header   { param([string]$msg) Write-Host "`n$msg" -ForegroundColor Cyan }
function Write-Success  { param([string]$msg) Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn     { param([string]$msg) Write-Host "  ⚠  $msg" -ForegroundColor Yellow }
function Write-Fail     { param([string]$msg) Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Step     { param([string]$msg) Write-Host "  → $msg" -ForegroundColor White }

Write-Header "═══════════════════════════════════════════════════"
Write-Header "   Smart Budget — k6 Performance Testing Framework"
Write-Header "═══════════════════════════════════════════════════"
Write-Host "  Scenario : $Scenario" -ForegroundColor Magenta
Write-Host "  Base URL : $BaseUrl"  -ForegroundColor Magenta
Write-Host "  Time     : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Header "═══════════════════════════════════════════════════"

# 1. Check k6 is installed
Write-Header "[1/5] Checking k6 installation..."
try {
    $k6Ver = (k6 version 2>&1)
    Write-Success "k6 found: $k6Ver"
} catch {
    Write-Fail "k6 not found. Install from https://k6.io/docs/getting-started/installation/"
    Write-Host "   Windows: winget install k6 --source winget"
    Write-Host "   Or:      choco install k6"
    exit 1
}

# 2. Check Node.js is installed
Write-Header "[2/5] Checking Node.js..."
try {
    $nodeVer = (node --version 2>&1)
    Write-Success "Node.js found: $nodeVer"
} catch {
    Write-Fail "Node.js not found. Install from https://nodejs.org"
    exit 1
}

# 3. Install npm dependencies
Write-Header "[3/5] Installing report dependencies..."
Push-Location $ScriptDir
if (!(Test-Path "node_modules")) {
    Write-Step "Running npm install..."
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "npm install had warnings (continuing anyway)"
    } else {
        Write-Success "Dependencies installed"
    }
} else {
    Write-Success "node_modules already present (skipping install)"
}

# 4. Create directories
Write-Header "[4/5] Setting up directories..."
@("reports", "reports\graphs", "docs") | ForEach-Object {
    if (!(Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Success "Created: $_"
    }
}

if ($ReportOnly) {
    Write-Warn "ReportOnly mode — skipping k6 tests"
    Write-Header "[5/5] Generating reports from existing summaries..."
    node scripts/generateReport.js
    node scripts/generateDocs.js
    Write-Success "Reports generated!"
    Write-Host ""
    Write-Host "  📊 Excel:  reports\Load_Test_Report.xlsx" -ForegroundColor Cyan
    Write-Host "  📄 CSV:    reports\results.csv"           -ForegroundColor Cyan
    Write-Host "  📋 Docs:   docs\TestCases.xlsx"           -ForegroundColor Cyan
    Pop-Location
    exit 0
}

# 5. Run k6 tests
Write-Header "[5/5] Running k6 Performance Tests..."

$testFiles = @(
    @{ Name = "Login";        File = "tests\loginTest.js";        CSV = "reports\login_results.csv" },
    @{ Name = "Registration"; File = "tests\registrationTest.js"; CSV = "reports\registration_results.csv" },
    @{ Name = "Dashboard";    File = "tests\dashboardTest.js";     CSV = "reports\dashboard_results.csv" },
    @{ Name = "Expense";      File = "tests\expenseTest.js";       CSV = "reports\expense_results.csv" },
    @{ Name = "Budget";       File = "tests\budgetTest.js";        CSV = "reports\budget_results.csv" },
    @{ Name = "AI Advisor";   File = "tests\aiAdvisorTest.js";     CSV = "reports\ai_results.csv" }
)

$passedTests  = 0
$failedTests  = 0
$skippedTests = 0

if ($Scenario -eq "all") {
    # Run each test module individually with smoke scenario
    foreach ($test in $testFiles) {
        Write-Step "Running: $($test.Name) Test..."
        k6 run `
            --env SCENARIO=smoke `
            --env BASE_URL=$BaseUrl `
            --out "csv=$($test.CSV)" `
            $test.File

        if ($LASTEXITCODE -eq 0) {
            Write-Success "$($test.Name) Test PASSED"
            $passedTests++
        } else {
            Write-Warn "$($test.Name) Test completed with threshold violations (check CSV)"
            $failedTests++
        }

        Write-Host ""
    }
}

# Always run the full load test with the specified scenario
Write-Step "Running: Full Load Test (Scenario: $Scenario)..."
k6 run `
    --env SCENARIO=$Scenario `
    --env BASE_URL=$BaseUrl `
    --out "csv=reports\results.csv" `
    tests\fullLoadTest.js

if ($LASTEXITCODE -eq 0) {
    Write-Success "Full Load Test PASSED"
    $passedTests++
} else {
    Write-Warn "Full Load Test completed with threshold violations (check reports)"
    $failedTests++
}

# 6. Generate Reports
Write-Header "Generating Reports..."

Write-Step "Generating Excel + CSV reports..."
node scripts/generateReport.js
if ($LASTEXITCODE -eq 0) {
    Write-Success "Excel report generated: reports\Load_Test_Report.xlsx"
} else {
    Write-Warn "Report generation had issues (check Node.js output above)"
}

Write-Step "Generating test cases document..."
node scripts/generateDocs.js
if ($LASTEXITCODE -eq 0) {
    Write-Success "Test cases document: docs\TestCases.xlsx"
} else {
    Write-Warn "Docs generation had issues"
}

Pop-Location

# 7. Final Summary
Write-Header "═══════════════════════════════════════════════════"
Write-Header "   Test Run Complete — Summary"
Write-Header "═══════════════════════════════════════════════════"
Write-Host "  Scenario     : $Scenario"                     -ForegroundColor Magenta
Write-Host "  Tests Passed : $passedTests"                  -ForegroundColor Green
Write-Host "  Tests Failed : $failedTests"                  -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "  📊 Excel Report  : $ScriptDir\reports\Load_Test_Report.xlsx" -ForegroundColor Cyan
Write-Host "  📄 CSV Results   : $ScriptDir\reports\results.csv"           -ForegroundColor Cyan
Write-Host "  📋 Test Cases    : $ScriptDir\docs\TestCases.xlsx"           -ForegroundColor Cyan
Write-Host "  📈 Graph Data    : $ScriptDir\reports\graphs\"               -ForegroundColor Cyan
Write-Header "═══════════════════════════════════════════════════"

# Open Excel report automatically if it exists
$excelPath = "$ScriptDir\reports\Load_Test_Report.xlsx"
if (Test-Path $excelPath) {
    $open = Read-Host "`n  Open Excel report now? (Y/N)"
    if ($open -eq "Y" -or $open -eq "y") {
        Start-Process $excelPath
    }
}
