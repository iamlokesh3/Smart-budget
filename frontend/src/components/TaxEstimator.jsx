import { useState } from 'react';
import { useApp } from '../context/AppContext';

const TAX_SLABS_NEW = [
  { min: 0,       max: 300000,  rate: 0 },
  { min: 300001,  max: 600000,  rate: 5 },
  { min: 600001,  max: 900000,  rate: 10 },
  { min: 900001,  max: 1200000, rate: 15 },
  { min: 1200001, max: 1500000, rate: 20 },
  { min: 1500001, max: Infinity,rate: 30 },
];
const TAX_SLABS_OLD = [
  { min: 0,       max: 250000,  rate: 0 },
  { min: 250001,  max: 500000,  rate: 5 },
  { min: 500001,  max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity,rate: 30 },
];

function calcTax(income, slabs) {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= 0) break;
    const taxable = Math.min(income, slab.max) - slab.min;
    if (taxable <= 0) continue;
    tax += (taxable * slab.rate) / 100;
    income -= taxable;
  }
  return Math.round(tax);
}

export default function TaxEstimator() {
  const { currency } = useApp();
  const [income,     setIncome]     = useState('800000');
  const [regime,     setRegime]     = useState('new');
  const [hra,        setHra]        = useState('0');
  const [sec80c,     setSec80c]     = useState('150000');
  const [sec80d,     setSec80d]     = useState('25000');
  const [homeLoan,   setHomeLoan]   = useState('0');

  const gross = parseFloat(income) || 0;
  const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;

  const deductions = regime === 'old'
    ? (parseFloat(hra) || 0) + Math.min(parseFloat(sec80c) || 0, 150000) + Math.min(parseFloat(sec80d) || 0, 25000) + Math.min(parseFloat(homeLoan) || 0, 200000)
    : 75000; // Standard deduction for new regime

  const taxableIncome = Math.max(0, gross - deductions);
  const basicTax      = calcTax(taxableIncome, slabs);
  const surcharge     = taxableIncome > 5000000 ? basicTax * 0.10 : 0;
  const cess          = (basicTax + surcharge) * 0.04;
  const totalTax      = Math.round(basicTax + surcharge + cess);
  const effectiveRate = gross > 0 ? ((totalTax / gross) * 100).toFixed(2) : 0;
  const takeHome      = gross - totalTax;

  const fmt = (n) => `${currency}${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Tax Estimator</h2>
        <p>Estimate your Income Tax under Old or New Regime (India FY 2024-25).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {/* Input */}
        <div className="card anim-up">
          <h4 style={{ marginBottom: '1.25rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
            💼 Income Details
          </h4>

          <div className="input-group">
            <label className="label">Annual Gross Income ({currency})</label>
            <input className="input" type="number" value={income} onChange={e => setIncome(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="label">Tax Regime</label>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              {['new', 'old'].map(r => (
                <button key={r} className={`btn ${regime === r ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }} onClick={() => setRegime(r)}>
                  {r === 'new' ? '🆕 New Regime' : '📋 Old Regime'}
                </button>
              ))}
            </div>
          </div>

          {regime === 'old' && (
            <>
              <div className="input-group">
                <label className="label">HRA Exemption ({currency})</label>
                <input className="input" type="number" value={hra} onChange={e => setHra(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="label">80C Deductions ({currency}) <span style={{ color: 'var(--text-muted)' }}>max ₹1.5L</span></label>
                <input className="input" type="number" value={sec80c} onChange={e => setSec80c(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="label">80D Health Insurance ({currency}) <span style={{ color: 'var(--text-muted)' }}>max ₹25K</span></label>
                <input className="input" type="number" value={sec80d} onChange={e => setSec80d(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="label">Home Loan Interest ({currency}) <span style={{ color: 'var(--text-muted)' }}>max ₹2L</span></label>
                <input className="input" type="number" value={homeLoan} onChange={e => setHomeLoan(e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="card anim-up" style={{ animationDelay: '.08s' }}>
          <h4 style={{ marginBottom: '1.25rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
            📊 Tax Summary
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>Total Tax Payable</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--danger)', margin: '.5rem 0' }}>{fmt(totalTax)}</div>
              <div style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Effective Rate: <strong style={{ color: 'var(--text-primary)' }}>{effectiveRate}%</strong></div>
            </div>

            {[
              { label: 'Gross Income',       value: fmt(gross),          color: 'var(--text-primary)' },
              { label: 'Total Deductions',   value: `− ${fmt(deductions)}`, color: 'var(--emerald)' },
              { label: 'Taxable Income',     value: fmt(taxableIncome),  color: 'var(--blue)' },
              { label: 'Basic Tax',          value: fmt(basicTax),       color: 'var(--danger)' },
              { label: 'Surcharge',          value: fmt(surcharge),      color: 'var(--amber)' },
              { label: 'Health & Ed. Cess (4%)',value: fmt(cess),        color: 'var(--amber)' },
              { label: '✅ Take-Home Income', value: fmt(takeHome),      color: 'var(--emerald)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex-between" style={{ fontSize: '.875rem', padding: '.4rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slab breakdown */}
        <div className="card anim-up" style={{ animationDelay: '.12s' }}>
          <h4 style={{ marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
            📋 Tax Slab Breakdown ({regime === 'new' ? 'New' : 'Old'} Regime)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['Income Range', 'Rate', 'Tax'].map(h => (
                  <th key={h} style={{ padding: '.5rem', textAlign: 'left', fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slabs.map((slab, i) => {
                const slabIncome = Math.max(0, Math.min(taxableIncome, slab.max === Infinity ? taxableIncome : slab.max) - slab.min);
                const slabTax   = Math.round(slabIncome * slab.rate / 100);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', opacity: slabIncome > 0 ? 1 : 0.4 }}>
                    <td style={{ padding: '.5rem' }}>
                      {fmt(slab.min)} – {slab.max === Infinity ? 'Above' : fmt(slab.max)}
                    </td>
                    <td style={{ padding: '.5rem', fontWeight: 600, color: slab.rate > 0 ? 'var(--danger)' : 'var(--emerald)' }}>{slab.rate}%</td>
                    <td style={{ padding: '.5rem', fontWeight: 600 }}>{slabIncome > 0 ? fmt(slabTax) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            * Estimate only. Consult a tax professional for accurate computation.
          </p>
        </div>
      </div>
    </div>
  );
}
