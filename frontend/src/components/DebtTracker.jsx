import { useState } from 'react';
import { Plus, Trash2, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEBT_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Education Loan', 'Business Loan', 'Other'];

export default function DebtTracker() {
  const { currency } = useApp();
  const [debts, setDebts] = useState([
    { id: 1, name: 'Home Loan',       type: 'Home Loan',     total: 3500000, remaining: 2800000, emi: 28000, rate: 8.5,  color: '#ef4444', icon: '🏠' },
    { id: 2, name: 'Car Loan',        type: 'Car Loan',      total: 600000,  remaining: 320000,  emi: 12000, rate: 9.0,  color: '#3b82f6', icon: '🚗' },
    { id: 3, name: 'Credit Card',     type: 'Credit Card',   total: 80000,   remaining: 45000,   emi: 5000,  rate: 36,   color: '#f59e0b', icon: '💳' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Personal Loan', total: '', remaining: '', emi: '', rate: '', icon: '💰' });

  const totalDebt   = debts.reduce((s, d) => s + d.remaining, 0);
  const totalEmi    = debts.reduce((s, d) => s + d.emi, 0);
  const totalOriginal = debts.reduce((s, d) => s + d.total, 0);
  const paidOff     = totalOriginal - totalDebt;

  function addDebt() {
    if (!form.name || !form.remaining) return;
    setDebts(p => [...p, {
      id: Date.now(), ...form,
      total: parseFloat(form.total) || parseFloat(form.remaining),
      remaining: parseFloat(form.remaining),
      emi: parseFloat(form.emi) || 0,
      rate: parseFloat(form.rate) || 0,
      color: `hsl(${Math.random() * 360},70%,50%)`,
    }]);
    setForm({ name: '', type: 'Personal Loan', total: '', remaining: '', emi: '', rate: '', icon: '💰' });
    setShowForm(false);
  }
  function makePayment(id, amt) {
    setDebts(p => p.map(d => d.id === id ? { ...d, remaining: Math.max(0, d.remaining - (parseFloat(amt) || 0)) } : d));
  }
  function deleteDebt(id) { setDebts(p => p.filter(d => d.id !== id)); }
  const fmt = (n) => `${currency}${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Debt Tracker</h2>
          <p>Monitor all your loans, EMIs, and credit card dues.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Add Debt
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Debt',    value: fmt(totalDebt),    color: 'var(--danger)',  bg: '#fef2f2' },
          { label: 'Monthly EMI',   value: fmt(totalEmi),     color: 'var(--amber)',   bg: '#fffbeb' },
          { label: 'Paid Off',      value: fmt(paidOff),      color: 'var(--emerald)', bg: '#f0fdf4' },
          { label: 'Active Debts',  value: debts.length,      color: 'var(--blue)',    bg: '#eff6ff' },
        ].map(k => (
          <div key={k.label} className="card" style={{ background: k.bg, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>➕ Add Debt</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem' }}>
            {[
              { label: 'Loan Name', key: 'name', type: 'text', placeholder: 'e.g. HDFC Home Loan' },
              { label: `Total Amount (${currency})`, key: 'total', type: 'number', placeholder: 'Original loan' },
              { label: `Remaining (${currency})`, key: 'remaining', type: 'number', placeholder: 'Balance left' },
              { label: `Monthly EMI (${currency})`, key: 'emi', type: 'number', placeholder: 'EMI amount' },
              { label: 'Interest Rate (%)', key: 'rate', type: 'number', placeholder: 'Annual rate' },
            ].map(f => (
              <div key={f.key} className="input-group">
                <label className="label">{f.label}</label>
                <input className="input" type={f.type} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="input-group">
              <label className="label">Type</label>
              <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={addDebt}>Save</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Debt cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {debts.map((debt, i) => {
          const pct = ((1 - debt.remaining / debt.total) * 100).toFixed(1);
          const monthsLeft = debt.emi > 0 ? Math.ceil(debt.remaining / debt.emi) : '—';
          const [payInput, setPayInput] = useState('');
          return (
            <div key={debt.id} className="card anim-up" style={{ animationDelay: `${i * 0.06}s`, borderLeft: `4px solid ${debt.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{debt.name}</div>
                  <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>{debt.type} • {debt.rate}% p.a.</div>
                </div>
                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteDebt(debt.id)}><Trash2 size={14} /></button>
              </div>

              <div style={{ margin: '1rem 0' }}>
                <div className="flex-between" style={{ fontSize: '.875rem', marginBottom: '.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{fmt(debt.remaining)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: debt.color, borderRadius: 99, transition: 'width .3s ease' }} />
                </div>
                <div className="flex-between" style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.3rem' }}>
                  <span>{pct}% paid</span>
                  <span>{fmt(debt.remaining)} left of {fmt(debt.total)}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', fontSize: '.8125rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{fmt(debt.emi)}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Monthly EMI</div>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '.5rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{monthsLeft === '—' ? '—' : `${monthsLeft} mo`}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Months Left</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input className="input" type="number" placeholder={`Extra payment (${currency})`}
                  value={payInput} onChange={e => setPayInput(e.target.value)} style={{ flex: 1, fontSize: '.875rem' }} />
                <button className="btn btn-primary btn-sm" onClick={() => { makePayment(debt.id, payInput); setPayInput(''); }}>Pay</button>
              </div>
            </div>
          );
        })}
      </div>

      {debts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <TrendingDown size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No debts tracked. You're debt-free! 🎉</p>
        </div>
      )}
    </div>
  );
}
