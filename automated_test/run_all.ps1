# PowerShell-native DAST runner
Set-StrictMode -Version Latest
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InputFile = Join-Path $ScriptDir 'input.json'
if (-not (Test-Path $InputFile)) { Write-Error "input.json not found in $ScriptDir. Copy input.json.sample and fill tokens."; exit 2 }
$input = Get-Content $InputFile -Raw | ConvertFrom-Json
$BaseUrl = $input.baseUrl
if (-not $BaseUrl) { Write-Error "baseUrl missing in input.json"; exit 2 }
$Discovered = Join-Path $ScriptDir 'discovered_endpoints.json'
if (Test-Path (Join-Path $ScriptDir 'endpoints.json')) { Copy-Item (Join-Path $ScriptDir 'endpoints.json') $Discovered -Force }
if (-not (Test-Path $Discovered)) { Write-Error "No endpoints.json found. Place discovered endpoints as discovered_endpoints.json or endpoints.json."; exit 2 }
$endpoints = Get-Content $Discovered -Raw | ConvertFrom-Json
# Helper: create/overwrite tmp files
$tmpFiles = @('tmp_authn_results.jsonl','tmp_authz_results.jsonl','tmp_idor_results.jsonl','tmp_injection_results.jsonl','tmp_ratelimit_results.jsonl','tmp_secrets_results.jsonl')
foreach ($f in $tmpFiles) { New-Item -Path (Join-Path $ScriptDir $f) -ItemType File -Force | Out-Null }
# HttpClient helper
Add-Type -AssemblyName System.Net.Http
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect = $true
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [System.TimeSpan]::FromSeconds(15)
function Send-Request($method,$url,$headers,$body){
    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::$method,$url)
    if ($body) {
        $json = $body | ConvertTo-Json -Compress
        $req.Content = New-Object System.Net.Http.StringContent($json,[System.Text.Encoding]::UTF8,'application/json')
    }
    if ($headers) { foreach ($k in $headers.Keys) { $req.Headers.Remove($k) | Out-Null; $req.Headers.Add($k,$headers[$k]) } }
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $resp = $client.SendAsync($req).GetAwaiter().GetResult()
        $sw.Stop()
        $content = $resp.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        return @{StatusCode=$resp.StatusCode.value__; Body=$content; TimeMs=$sw.ElapsedMilliseconds}
    } catch {
        $sw.Stop()
        $err = $_
        $status = 0
        if ($err.Exception.Response -ne $null) {
            try { $status = $err.Exception.Response.StatusCode.value__ } catch { $status = 0 }
        }
        return @{StatusCode=$status; Body=$err.Exception.Message; TimeMs=$sw.ElapsedMilliseconds}
    }
}
# AUTHN BYPASS
$authnOut = Join-Path $ScriptDir 'tmp_authn_results.jsonl'
foreach ($ep in $endpoints) {
    if (-not $ep.protected) { continue }
    $path = $ep.path -replace ':id','123'
    $url = $BaseUrl.TrimEnd('/') + $path
    $res = Send-Request $ep.method $url $null $null
    $finding = $false
    if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 300) { $finding = $true }
    $rec = @{endpoint=$ep.path; method=$ep.method; role='anonymous'; status=$res.StatusCode; finding=$finding; test_category='authn_bypass'; response_time_ms=$res.TimeMs}
    $rec | ConvertTo-Json -Compress | Out-File -FilePath $authnOut -Append -Encoding utf8
}
# AUTHZ PRIVESC
$authzOut = Join-Path $ScriptDir 'tmp_authz_results.jsonl'
$userHeader = @{ 'x-user-id' = $input.roles.user }
foreach ($ep in $endpoints) {
    if (-not $ep.protected) { continue }
    $path = $ep.path -replace ':id','123'
    $url = $BaseUrl.TrimEnd('/') + $path
    $res = Send-Request $ep.method $url $userHeader $null
    $rec = @{endpoint=$ep.path; method=$ep.method; role='user'; status=$res.StatusCode; finding=$false; test_category='authz_privesc'; response_time_ms=$res.TimeMs}
    $rec | ConvertTo-Json -Compress | Out-File -FilePath $authzOut -Append -Encoding utf8
}
# IDOR
$idorOut = Join-Path $ScriptDir 'tmp_idor_results.jsonl'
foreach ($ep in $endpoints) {
    if ($ep.path -notmatch ':id') { continue }
    $path1 = $ep.path -replace ':id','123'
    $path2 = $ep.path -replace ':id','999999'
    $url1 = $BaseUrl.TrimEnd('/') + $path1
    $url2 = $BaseUrl.TrimEnd('/') + $path2
    $res1 = Send-Request $ep.method $url1 $userHeader $null
    $res2 = Send-Request $ep.method $url2 $userHeader $null
    $finding = $false
    if ($res2.StatusCode -ge 200 -and $res2.StatusCode -lt 300) { $finding = $true }
    $rec = @{endpoint=$ep.path; method=$ep.method; role='user'; status1=$res1.StatusCode; status2=$res2.StatusCode; finding=$finding; test_category='idor'; note="status1:$($res1.StatusCode) status2:$($res2.StatusCode)"}
    $rec | ConvertTo-Json -Compress | Out-File -FilePath $idorOut -Append -Encoding utf8
}
# INJECTION PROBE
$injOut = Join-Path $ScriptDir 'tmp_injection_results.jsonl'
$payloads = @("' OR '1'='1","<script>alert(1)</script>","../../etc/passwd")
foreach ($ep in $endpoints) {
    $path = $ep.path -replace ':id','123'
    $url = $BaseUrl.TrimEnd('/') + $path
    foreach ($p in $payloads) {
        $body = @{ q = $p }
        $res = Send-Request $ep.method $url $null $body
        $finding = $false
        if ($res.StatusCode -ge 500) { $finding = $true }
        $rec = @{endpoint=$ep.path; method=$ep.method; role='anonymous'; status=$res.StatusCode; finding=$finding; test_category='injection_probe'; response_time_ms=$res.TimeMs; note="payload:$p"}
        $rec | ConvertTo-Json -Compress | Out-File -FilePath $injOut -Append -Encoding utf8
    }
}
# RATE LIMIT
$rlOut = Join-Path $ScriptDir 'tmp_ratelimit_results.jsonl'
$ep = $endpoints | Where-Object { $_.protected -eq $true } | Select-Object -First 1
if (-not $ep) { $ep = $endpoints | Select-Object -First 1 }
$path = $ep.path -replace ':id','123'
$url = $BaseUrl.TrimEnd('/') + $path
for ($i=1; $i -le 30; $i++) {
    $res = Send-Request 'GET' $url $null $null
    $rec = @{endpoint=$ep.path; status=$res.StatusCode; response_time_ms=$res.TimeMs}
    $rec | ConvertTo-Json -Compress | Out-File -FilePath $rlOut -Append -Encoding utf8
}
# SCAN SECRETS (quick)
$secOut = Join-Path $ScriptDir 'tmp_secrets_results.jsonl'
Get-ChildItem -Path (Join-Path $ScriptDir '..') -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $file = $_.FullName
    $text = ""  
    try { $text = Get-Content $file -Raw -ErrorAction SilentlyContinue } catch {}
    if ($text -match '(API_KEY|APIKEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY|ACCESS_KEY)') {
        $rec = @{file=($file -replace "\\","/"); note="match"}
        $rec | ConvertTo-Json -Compress | Out-File -FilePath $secOut -Append -Encoding utf8
    }
}
# Generate aggregated report using Node script if available
$reportGen = Join-Path $ScriptDir 'report_generator.js'
if (Test-Path $reportGen) {
    Write-Output "Running report_generator.js"
    node $reportGen
} else {
    Write-Output "report_generator.js not found; tmp files are in $ScriptDir"
}
Write-Output "Run complete. See report.json in $ScriptDir (if generated) or tmp_*.jsonl files."
