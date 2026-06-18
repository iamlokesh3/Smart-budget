import { useState } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const INVEST_TYPES = ['Stocks', 'Mutual Funds', 'SIP', 'Fixed Deposit', 'PPF', 'NPS', 'Gold', 'Real Estate', 'Crypto', 'Bonds'];

export default function InvestmentTracker() {
  const { currency } = useApp();
  const [investments, setInvestments] = useState([
    { id: 1, name: 'Nifty 50 Index Fund', type: 'Mutual Funds', invested: 120000, current: 148000, color: '#3b82f6', icon: '📊' },
    { id: 2, name: 'TCS Shares',           type: 'Stocks',       invested: 50000,  current: 62000,  color: '#10b981', icon: '📈' },
    { id: 3, name: 'SBI PPF',              type: 'PPF',          invested: 150000, current: 163500, color: '#f59e0b', icon: '🏦' },
    { id: 4, name: 'Gold ETF',             type: 'Gold',         invested: 30000,  current: 34200,  color: '#f97316', icon: '🥇' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Mutual Funds', invested: '', current: '', icon: '📊' });

  const totalInvested = investments.reduce((s, i) => s + i.invested, 0);
  const totalCurrent  = investments.reduce((s, i) => s + i.current, 0);
  const totalGain     = totalCurrent - totalInvested;
  const totalReturn   = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

  function addInvestment() {
    if (!form.name || !form.invested) return;
    setInvestments(p => [...p, { id: Date.now(), ...form, invested: parseFloat(form.invested), current: parseFloat(form.current) || parseFloat(form.invested), color: `hsl(${Math.random()*360},65%,50%)` }]);
    setForm({ name: '', type: 'Mutual Funds', invested: '', current: '', icon: '📊' });
    setShowForm(false);
  }
  function deleteInvestment(id) { setInvestments(p => p.filter(i => i.id !== id)); }
  const fmt = (n) => `${currency}${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Investment Tracker</h2>
          <p>Track your portfolio — stocks, mutual funds, gold, and more.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}><Plus size={15} /> Add Investment</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Invested',  value: fmt(totalInvested), color: 'var(--blue)',    bg: '#eff6ff' },
          { label: 'Current Value',   value: fmt(totalCurrent),  color: 'var(--emerald)', bg: '#f0fdf4' },
          { label: 'Total Gain',      value: fmt(totalGain),     color: totalGain >= 0 ? 'var(--emerald)' : 'var(--danger)', bg: totalGain >= 0 ? '#f0fdf4' : '#fef2f2' },
          { label: 'Total Returns',   value: `${totalReturn}%`,  color: totalReturn >= 0 ? 'var(--emerald)' : 'var(--danger)', bg: '#f5f3ff' },
        ].map(k => (
          <div key={k.label} className="card" style={{ background: k.bg, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Portfolio Pie (simple visual) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        <div className="card anim-up">
          <h4 style={{ marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>📊 Portfolio Allocation</h4>
          {investments.map(inv => {
            const pct = ((inv.current / totalCurrent) * 100).toFixed(1);
            return (
              <div key={inv.id} style={{ marginBottom: '.75rem' }}>
                <div className="flex-between" style={{ fontSize: '.875rem', marginBottom: '.3rem' }}>
                  <span style={{ fontWeight: 500 }}>{inv.icon} {inv.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '.8125rem' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: inv.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card anim-up" style={{ animationDelay: '.08s' }}>
          <h4 style={{ marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>💼 Holdings</h4>
          {investments.map(inv => {
            const gain    = inv.current - inv.invested;
            const returns = ((gain / inv.invested) * 100).toFixed(1);
            return (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.5rem' }}>{inv.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{inv.name}</div>
                  <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>{inv.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{fmt(inv.current)}</div>
                  <div style={{ fontSize: '.8125rem', color: gain >= 0 ? 'var(--emerald)' : 'var(--danger)' }}>
                    {gain >= 0 ? '+' : ''}{returns}% ({gain >= 0 ? '+' : ''}{fmt(gain)})
                  </div>
                </div>
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteInvestment(inv.id)}><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card anim-up" style={{ marginTop: '1.5rem', border: '1px solid var(--emerald)' }}>
          <h4 style={{ marginBottom: '1rem' }}>➕ Add Investment</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. HDFC Top 100 Fund" />
            </div>
            <div className="input-group">
              <label className="label">Type</label>
              <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {INVEST_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="label">Amount Invested ({currency})</label>
              <input className="input" type="number" value={form.invested} onChange={e => setForm(p => ({ ...p, invested: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Current Value ({currency})</label>
              <input className="input" type="number" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={addInvestment}>Save</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
