import { useState } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';

const RATES_FROM_INR = {
  '₹': 1, '$': 0.012, '€': 0.011, '£': 0.0094,
  '¥': 1.78, '₩': 16.28, '₦': 19.8, '฿': 0.43,
  'kr': 0.13, 'CHF': 0.011, 'CAD': 0.016, 'AUD': 0.018,
};

const CURRENCIES = [
  { code: '₹',   name: 'Indian Rupee',    flag: '🇮🇳' },
  { code: '$',   name: 'US Dollar',       flag: '🇺🇸' },
  { code: '€',   name: 'Euro',            flag: '🇪🇺' },
  { code: '£',   name: 'British Pound',   flag: '🇬🇧' },
  { code: '¥',   name: 'Japanese Yen',    flag: '🇯🇵' },
  { code: '₩',   name: 'South Korean Won',flag: '🇰🇷' },
  { code: '₦',   name: 'Nigerian Naira',  flag: '🇳🇬' },
  { code: '฿',   name: 'Thai Baht',       flag: '🇹🇭' },
  { code: 'kr',  name: 'Swedish Krona',   flag: '🇸🇪' },
  { code: 'CHF', name: 'Swiss Franc',     flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar',flag: '🇦🇺' },
];

function convert(amount, from, to) {
  const inINR = amount / RATES_FROM_INR[from];
  return inINR * RATES_FROM_INR[to];
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom]     = useState('₹');
  const [to, setTo]         = useState('$');

  const result = convert(parseFloat(amount) || 0, from, to);
  const rate   = convert(1, from, to);

  function swap() { setFrom(to); setTo(from); }

  const POPULAR_PAIRS = [
    { from: '₹', to: '$',  label: 'INR → USD' },
    { from: '₹', to: '€',  label: 'INR → EUR' },
    { from: '₹', to: '£',  label: 'INR → GBP' },
    { from: '$', to: '₹',  label: 'USD → INR' },
    { from: '€', to: '₹',  label: 'EUR → INR' },
    { from: '£', to: '₹',  label: 'GBP → INR' },
  ];

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Currency Converter</h2>
        <p>Convert between 12 world currencies in real time.</p>
      </div>

      {/* Quick pairs */}
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {POPULAR_PAIRS.map(p => (
          <button key={p.label} className="btn btn-outline btn-sm"
            onClick={() => { setFrom(p.from); setTo(p.to); }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {/* Converter card */}
        <div className="card anim-up" style={{ gridColumn: 'span 2' }}>
          <h4 style={{ marginBottom: '1.5rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
            <ArrowRightLeft size={16} style={{ marginRight: '.5rem', verticalAlign: 'middle' }} />Convert
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'end' }}>
            {/* From */}
            <div>
              <label className="label">Amount</label>
              <input className="input" type="number" value={amount}
                onChange={e => setAmount(e.target.value)} style={{ fontSize: '1.25rem', fontWeight: 700 }} />
              <select className="select" style={{ marginTop: '.5rem' }} value={from} onChange={e => setFrom(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            {/* Swap */}
            <button className="btn btn-outline" style={{ marginBottom: 42, borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={swap} title="Swap currencies">
              <RefreshCw size={16} />
            </button>

            {/* To */}
            <div>
              <label className="label">Converted</label>
              <div className="input" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)', background: 'var(--bg-subtle)', cursor: 'default' }}>
                {result.toLocaleString('en-IN', { maximumFractionDigits: 4 })}
              </div>
              <select className="select" style={{ marginTop: '.5rem' }} value={to} onChange={e => setTo(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: '.9rem', color: 'var(--text-muted)' }}>
            1 {from} = <strong style={{ color: 'var(--text-primary)' }}>{rate.toLocaleString('en-IN', { maximumFractionDigits: 6 })} {to}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            1 {to} = <strong style={{ color: 'var(--text-primary)' }}>{(1 / rate).toLocaleString('en-IN', { maximumFractionDigits: 6 })} {from}</strong>
          </div>
        </div>

        {/* All rates vs INR */}
        <div className="card anim-up" style={{ animationDelay: '.08s' }}>
          <h4 style={{ marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>📊 All Rates vs ₹ INR</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {CURRENCIES.filter(c => c.code !== '₹').map(c => {
              const r = convert(1, '₹', c.code);
              return (
                <div key={c.code} className="flex-between" style={{ padding: '.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{c.flag}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{c.code}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{c.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--emerald)' }}>{r.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>per ₹1</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            * Rates are approximate. Use official sources for financial transactions.
          </p>
        </div>

        {/* Conversion table */}
        <div className="card anim-up" style={{ animationDelay: '.12s' }}>
          <h4 style={{ marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>📋 Quick Reference</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                <th style={{ padding: '.5rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '.75rem' }}>{from}</th>
                <th style={{ padding: '.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '.75rem' }}>{to}</th>
              </tr>
            </thead>
            <tbody>
              {[1, 10, 50, 100, 500, 1000, 5000, 10000].map(v => (
                <tr key={v} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '.5rem', color: 'var(--text-muted)' }}>{v.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '.5rem', textAlign: 'right', fontWeight: 600 }}>{convert(v, from, to).toLocaleString('en-IN', { maximumFractionDigits: 4 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
