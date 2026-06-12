const fs = require('fs');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const path = require('path');

const DIR = __dirname;
const endpoints = JSON.parse(fs.readFileSync(path.join(DIR, 'discovered_endpoints.json')));
const input = JSON.parse(fs.readFileSync(path.join(DIR, 'input.json')));
const BASE = input.baseUrl;
const roles = input.roles || {};

function request(opts, body, timeout = 10000) {
  return new Promise((resolve) => {
    const u = new URL(opts.url);
    const lib = u.protocol === 'https:' ? https : http;
    const headers = opts.headers || {};
    const req = lib.request(
      {
        method: opts.method || 'GET',
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + (u.search || ''),
        headers,
        timeout,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data, time: 0 });
        });
      }
    );
    req.on('error', (e) => resolve({ status: 0, body: '' }));
    if (body) req.write(body);
    req.end();
  });
}

function writeLine(file, obj) {
  fs.appendFileSync(path.join(DIR, file), JSON.stringify(obj) + '\n');
}

async function runAuthnBypass() {
  const out = 'tmp_authn_results.jsonl';
  fs.writeFileSync(path.join(DIR, out), '');
  for (const ep of endpoints) {
    if (!ep.protected) continue;
    const url = (BASE + ep.path).replace(':id', '123');
    const r = await request({ url, method: ep.method });
    const finding = String(r.status).startsWith('2');
    writeLine(out, { endpoint: ep.path, method: ep.method, role: 'anonymous', status: r.status, finding, test_category: 'authn_bypass', response_time_ms: r.time });
  }
}

async function runAuthzPrivesc() {
  const out = 'tmp_authz_results.jsonl';
  fs.writeFileSync(path.join(DIR, out), '');
  const user = roles.user || '';
  for (const ep of endpoints) {
    if (!ep.protected) continue;
    const url = (BASE + ep.path).replace(':id', '123');
    const headers = { 'Content-Type': 'application/json' };
    if (user) headers['x-user-id'] = user;
    const r = await request({ url, method: ep.method, headers });
    writeLine(out, { endpoint: ep.path, method: ep.method, role: 'user', status: r.status, finding: false, test_category: 'authz_privesc', response_time_ms: r.time });
  }
}

async function runIdor() {
  const out = 'tmp_idor_results.jsonl';
  fs.writeFileSync(path.join(DIR, out), '');
  const user = roles.user || '';
  for (const ep of endpoints) {
    if (!ep.path.includes(':id')) continue;
    const url1 = (BASE + ep.path).replace(':id', '123');
    const url2 = (BASE + ep.path).replace(':id', '999999');
    const headers = { 'Content-Type': 'application/json' };
    if (user) headers['x-user-id'] = user;
    const r1 = await request({ url: url1, method: ep.method, headers });
    const r2 = await request({ url: url2, method: ep.method, headers });
    const finding = String(r2.status).startsWith('2');
    writeLine(out, { endpoint: ep.path, method: ep.method, role: 'user', status1: r1.status, status2: r2.status, finding, test_category: 'idor' });
  }
}

async function runInjectionProbe() {
  const out = 'tmp_injection_results.jsonl';
  fs.writeFileSync(path.join(DIR, out), '');
  const payloads = ["' OR '1'='1", '<script>alert(1)</script>', '../../etc/passwd'];
  for (const ep of endpoints) {
    const url = (BASE + ep.path).replace(':id', '123');
    for (const p of payloads) {
      const body = JSON.stringify({ q: p });
      const r = await request({ url, method: ep.method, headers: { 'Content-Type': 'application/json' } }, body);
      const finding = String(r.status).startsWith('5');
      writeLine(out, { endpoint: ep.path, method: ep.method, test_category: 'injection_probe', payload: p, status: r.status, finding });
    }
  }
}

async function runRateLimit() {
  const out = 'tmp_ratelimit_results.jsonl';
  fs.writeFileSync(path.join(DIR, out), '');
  const ep = endpoints.find(e => e.protected) || endpoints[0];
  const url = (BASE + ep.path).replace(':id', '123');
  for (let i = 0; i < 30; i++) {
    const r = await request({ url, method: 'GET' });
    writeLine(out, { endpoint: ep.path, status: r.status, response_time_ms: r.time });
  }
}

async function runScanSecrets() {
  const out = 'tmp_secrets_results.jsonl';
  fs.writeFileSync(path.join(DIR, out), '');
  // Quick repo scan for likely secrets
  const repoRoot = path.join(DIR, '..');
  const walk = (dir) => fs.readdirSync(dir).flatMap(f => {
    const full = path.join(dir, f);
    try { const st = fs.statSync(full); if (st.isDirectory()) return walk(full); if (st.isFile()) return [full]; } catch (e) { return []; }
    return [];
  });
  const files = walk(repoRoot).filter(f => !f.includes('.git') && !f.includes('automated_test'));
  const re = /(API_KEY|APIKEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY|ACCESS_KEY)/i;
  for (const f of files) {
    try {
      const s = fs.readFileSync(f, 'utf8');
      if (re.test(s)) writeLine(out, { file: f.replace(/\\/g, '/'), note: 'possible secret match' });
    } catch (e) {}
  }
}

async function aggregate() {
  // reuse existing report_generator if present
  try {
    require('./report_generator.js');
  } catch (e) {
    // fallback: concatenate tmp files
    const tmp = ['tmp_authn_results.jsonl','tmp_authz_results.jsonl','tmp_idor_results.jsonl','tmp_injection_results.jsonl','tmp_ratelimit_results.jsonl','tmp_secrets_results.jsonl'];
    const out = [];
    for (const t of tmp) {
      const p = path.join(DIR, t);
      if (!fs.existsSync(p)) continue;
      const lines = fs.readFileSync(p,'utf8').trim().split(/\n+/).filter(Boolean);
      for (const l of lines) out.push(JSON.parse(l));
    }
    fs.writeFileSync(path.join(DIR,'report.json'), JSON.stringify(out, null, 2));
    console.log('Wrote report.json with', out.length, 'entries');
  }
}

async function main() {
  console.log('Starting tests against', BASE);
  await runAuthnBypass();
  await runAuthzPrivesc();
  await runIdor();
  await runInjectionProbe();
  await runRateLimit();
  await runScanSecrets();
  await aggregate();
  console.log('Done');
}

main().catch(e => { console.error(e); process.exit(1); });
