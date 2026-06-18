import { useState, useMemo } from 'react';
import { Calculator, IndianRupee, Percent, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function EmiCalculator() {
  const { currency } = useApp();
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate]           = useState('8.5');
  const [tenure, setTenure]       = useState('60');
  const [tenureType, setTenureType] = useState('months');

  const result = useMemo(() => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 12 / 100;
    const n = tenureType === 'years'
      ? (parseInt(tenure) || 0) * 12
      : (parseInt(tenure) || 0);
    if (!P || !r || !n) return null;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    return {
      emi: Math.round(emi),
      total: Math.round(total),
      interest: Math.round(interest),
      months: n,
      principalPct: ((P / total) * 100).toFixed(1),
      interestPct:  ((interest / total) * 100).toFixed(1),
    };
  }, [principal, rate, tenure, tenureType]);

  const fmt = (n) => `${currency}${n?.toLocaleString('en-IN') ?? 0}`;

  const loanTypes = [
    { label: 'Home Loan',     principal: '5000000', rate: '8.5',  tenure: '240', type: 'months' },
    { label: 'Car Loan',      principal: '800000',  rate: '9.0',  tenure: '60',  type: 'months' },
    { label: 'Personal Loan', principal: '300000',  rate: '13.5', tenure: '36',  type: 'months' },
    { label: 'Education Loan',principal: '1000000', rate: '10.5', tenure: '84',  type: 'months' },
  ];

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>EMI Calculator</h2>
        <p>Calculate your Equated Monthly Instalment for any loan.</p>
      </div>

      {/* Quick presets */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {loanTypes.map(l => (
          <button key={l.label} className="btn btn-outline btn-sm"
            onClick={() => { setPrincipal(l.principal); setRate(l.rate); setTenure(l.tenure); setTenureType(l.type); }}>
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {/* Inputs */}
        <div className="card anim-up">
          <h4 style={{ marginBottom: '1.25rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
            <Calculator size={16} style={{ marginRight: '.5rem', verticalAlign: 'middle' }} />Loan Details
          </h4>
          <div className="input-group">
            <label className="label">Loan Amount ({currency})</label>
            <input className="input" type="number" value={principal}
              onChange={e => setPrincipal(e.target.value)} placeholder="e.g. 500000" />
          </div>
          <div className="input-group">
            <label className="label">Annual Interest Rate (%)</label>
            <input className="input" type="number" step="0.1" value={rate}
              onChange={e => setRate(e.target.value)} placeholder="e.g. 8.5" />
          </div>
          <div className="input-group">
            <label className="label">Loan Tenure</label>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <input className="input" type="number" value={tenure}
                onChange={e => setTenure(e.target.value)} placeholder="e.g. 60" />
              <select className="select" style={{ width: 110 }} value={tenureType} onChange={e => setTenureType(e.target.value)}>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card anim-up" style={{ animationDelay: '.08s' }}>
          <h4 style={{ marginBottom: '1.25rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
            📊 Calculation Result
          </h4>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Monthly EMI</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue)' }}>{fmt(result.emi)}</div>
              </div>
              {[
                { label: 'Principal Amount', value: fmt(parseFloat(principal)), color: 'var(--emerald)' },
                { label: 'Total Interest', value: fmt(result.interest), color: 'var(--danger)' },
                { label: 'Total Payment', value: fmt(result.total), color: 'var(--text-primary)' },
                { label: 'Loan Duration', value: `${result.months} months`, color: 'var(--amber)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-between" style={{ fontSize: '.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{value}</span>
                </div>
              ))}

              {/* Bar */}
              <div>
                <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Breakup</div>
                <div style={{ height: 10, borderRadius: 99, overflow: 'hidden', display: 'flex', background: 'var(--border)' }}>
                  <div style={{ width: `${result.principalPct}%`, background: 'var(--emerald)' }} />
                  <div style={{ width: `${result.interestPct}%`, background: 'var(--danger)' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '.75rem', marginTop: '.4rem' }}>
                  <span><span style={{ color: 'var(--emerald)', fontWeight: 700 }}>●</span> Principal {result.principalPct}%</span>
                  <span><span style={{ color: 'var(--danger)', fontWeight: 700 }}>●</span> Interest {result.interestPct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              Fill in loan details to calculate EMI
            </div>
          )}
        </div>
      </div>

      {/* Amortisation preview */}
      {result && (
        <div className="card anim-up" style={{ marginTop: '1.5rem', animationDelay: '.12s' }}>
          <h4 style={{ marginBottom: '1rem' }}>📅 Year-wise Amortisation</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  {['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Balance'].map(h => (
                    <th key={h} style={{ padding: '.6rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(Math.ceil(result.months / 12), 10) }, (_, yr) => {
                  const P = parseFloat(principal);
                  const r = (parseFloat(rate) || 0) / 12 / 100;
                  const n = result.months;
                  const emi = result.emi;
                  let balance = P;
                  let prPaid = 0, intPaid = 0;
                  const startMo = yr * 12;
                  const endMo   = Math.min((yr + 1) * 12, n);
                  for (let m = 0; m < startMo; m++) {
                    const intM = balance * r;
                    balance -= (emi - intM);
                  }
                  const balStart = balance;
                  for (let m = startMo; m < endMo; m++) {
                    const intM = balance * r;
                    intPaid += intM;
                    prPaid  += (emi - intM);
                    balance -= (emi - intM);
                  }
                  return (
                    <tr key={yr} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '.6rem 1rem', fontWeight: 600 }}>Year {yr + 1}</td>
                      <td style={{ padding: '.6rem 1rem', color: 'var(--emerald)' }}>{fmt(Math.round(prPaid))}</td>
                      <td style={{ padding: '.6rem 1rem', color: 'var(--danger)' }}>{fmt(Math.round(intPaid))}</td>
                      <td style={{ padding: '.6rem 1rem' }}>{fmt(Math.round(prPaid + intPaid))}</td>
                      <td style={{ padding: '.6rem 1rem', fontWeight: 600 }}>{fmt(Math.max(0, Math.round(balance)))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
