import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, RefreshCw } from 'lucide-react';

export default function RecurringTransactions() {
  const { currency } = useApp();
  const [recurrings, setRecurrings] = useState([
    { id: 1, title: 'Monthly Salary Credit', amount: 80000, type: 'income', interval: 'Monthly', lastDate: '2026-06-01' },
    { id: 2, title: 'Apartment Rent', amount: 16000, type: 'expense', interval: 'Monthly', lastDate: '2026-06-02' },
    { id: 3, title: 'SIP Mutual Fund Savings', amount: 5000, type: 'expense', interval: 'Monthly', lastDate: '2026-06-10' },
  ]);

  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', interval: 'Monthly' });
  const [showForm, setShowForm] = useState(false);

  function addRecurring() {
    if (!form.title || !form.amount) return;
    setRecurrings(prev => [...prev, { id: Date.now(), ...form, amount: Number(form.amount), lastDate: 'N/A' }]);
    setForm({ title: '', amount: '', type: 'expense', interval: 'Monthly' });
    setShowForm(false);
  }

  function deleteRecurring(id) {
    setRecurrings(prev => prev.filter(r => r.id !== id));
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Recurring Transactions</h2>
          <p>Schedule your monthly incomes or recurring expenses to auto-update.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Add Recurring Schedule
        </button>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>🔄 Schedule New Transaction</h4>
          <div className="grid-2">
            <div className="input-group">
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Monthly Salary, House Rent" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Amount</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Transaction Type</label>
              <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="input-group">
              <label className="label">Frequency</label>
              <select className="select" value={form.interval} onChange={e => setForm(p => ({ ...p, interval: e.target.value }))}>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addRecurring}>Create Schedule</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <RefreshCw size={16} /> Active Auto-Schedules
        </h4>
        {recurrings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No recurring transactions scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {recurrings.map(r => (
              <div key={r.id} className="flex-between" style={{ padding: '.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.25rem' }}>
                    <span className={`badge ${r.type === 'income' ? 'badge-emerald' : 'badge-danger'}`}>{r.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>Interval: {r.interval}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}><Calendar size={12} /> Last post: {r.lastDate}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontWeight: 700, color: r.type === 'income' ? 'var(--emerald)' : 'var(--text-primary)' }}>
                    {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                  </div>
                  <button className="btn-icon" onClick={() => deleteRecurring(r.id)} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
