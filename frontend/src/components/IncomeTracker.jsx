import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function IncomeTracker() {
  const { transactions, addTransaction, currency } = useApp();

  const incomes = transactions.filter(t => t.type === 'income');
  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);

  const [form, setForm] = useState({ title: '', amount: '', category: 'Salary', date: new Date().toISOString().split('T')[0] });
  const [showForm, setShowForm] = useState(false);

  function saveIncome() {
    if (!form.title || !form.amount) return;
    addTransaction({
      id: Date.now().toString(),
      title: form.title,
      amount: Number(form.amount),
      type: 'income',
      category: form.category,
      date: form.date,
    });
    setForm({ title: '', amount: '', category: 'Salary', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Income Tracker</h2>
          <p>Log, track, and dissect all your monthly income flows and deposits.</p>
        </div>
        <button className="btn btn-emerald" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Log Income Source
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ background: 'var(--emerald-light)' }}>
          <h4 style={{ color: 'var(--emerald-dark)' }}>Total Earned (All Time)</h4>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-dark)', marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <ArrowUpRight size={28} />
            {fmt(totalIncome)}
          </div>
        </div>
        <div className="card">
          <h4>Income Streams Recorded</h4>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '.5rem' }}>
            {incomes.length}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--emerald)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--emerald-dark)' }}>💰 Add Income Credit</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Source Name</label>
              <input className="input" placeholder="e.g. Monthly Salary, Freelance Gig" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Amount</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="Salary">Primary Salary</option>
                <option value="Freelance">Freelance/Consulting</option>
                <option value="Investments">Investment Dividends</option>
                <option value="Gifts">Gifts & Refunds</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-emerald" onClick={saveIncome}>Save Credit</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1rem' }}>Ledger of Income Flows</h4>
        {incomes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No income credits logged yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {incomes.map(inc => (
              <div key={inc.id} className="flex-between" style={{ padding: '.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{inc.title}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>
                    <span className="badge badge-emerald">{inc.category}</span>
                    <span style={{ marginLeft: '.5rem' }}>Date: {inc.date}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--emerald-dark)', fontSize: '1.05rem' }}>
                  +{fmt(inc.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
