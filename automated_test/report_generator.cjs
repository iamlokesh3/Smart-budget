const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname);
const out = [];
const tmpFiles = [
  'tmp_authn_results.jsonl',
  'tmp_authz_results.jsonl',
  'tmp_idor_results.jsonl',
  'tmp_injection_results.jsonl',
  'tmp_ratelimit_results.jsonl',
  'tmp_secrets_results.jsonl'
];
for (const f of tmpFiles) {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean);
  for (const l of lines) {
    try {
      out.push(JSON.parse(l));
    } catch (e) {
      try {
        out.push(eval('(' + l + ')'))
      } catch (e2) {
        out.push({raw: l});
      }
    }
  }
}
fs.writeFileSync(path.join(DIR, 'report.json'), JSON.stringify(out, null, 2));
console.log('Wrote report.json with', out.length, 'entries');
