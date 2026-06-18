import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, ShieldAlert, Check } from 'lucide-react';

export default function SpendingLimits() {
  const { transactions, currency } = useApp();
  const [limits, setLimits] = useState([
    { id: 1, category: 'Dining Out', cap: 5000, threshold: 80 },
    { id: 2, category: 'Shopping', cap: 8000, threshold: 90 },
  ]);

  const [form, setForm] = useState({ category: 'Dining Out', cap: '', threshold: 80 });
  const [showForm, setShowForm] = useState(false);

  // Categories list
  const uniqueCats = Array.from(new Set(transactions.map(t => t.category))).filter(Boolean);

  function addLimit() {
    if (!form.cap) return;
    setLimits(prev => [...prev, { id: Date.now(), ...form, cap: Number(form.cap), threshold: Number(form.threshold) }]);
    setForm({ category: uniqueCats[0] || 'Food', cap: '', threshold: 80 });
    setShowForm(false);
  }

  function deleteLimit(id) {
    setLimits(prev => prev.filter(l => l.id !== id));
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  // Analyze actual expenses
  const actuals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Spending Limits & Alerts</h2>
          <p>Define spending caps and warning thresholds for specific categories.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Add Limit Alert
        </button>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>🛡️ New Limit Rule</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
                {uniqueCats.length === 0 && <option value="Food">Food</option>}
              </select>
            </div>
            <div className="input-group">
              <label className="label">Monthly Limit Cap ({currency})</label>
              <input className="input" type="number" value={form.cap} onChange={e => setForm(p => ({ ...p, cap: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Warning Threshold (%)</label>
              <input className="input" type="number" min="50" max="100" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addLimit}>Create Rule</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1rem' }}>Active Alerts & Limits</h4>
        {limits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No warning limits configured yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {limits.map(l => {
              const actual = actuals[l.category] || 0;
              const pct = Math.min(100, Math.round((actual / l.cap) * 100));
              const hasAlert = pct >= l.threshold;
              const hasExceeded = pct >= 100;

              return (
                <div key={l.id} className="card" style={{ padding: '1rem', border: hasExceeded ? '1px solid var(--danger)' : hasAlert ? '1px solid var(--warning)' : '1px solid var(--border)' }}>
                  <div className="flex-between" style={{ marginBottom: '.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      {hasAlert && <ShieldAlert size={16} style={{ color: hasExceeded ? 'var(--danger)' : 'var(--warning)' }} />}
                      <span style={{ fontWeight: 600 }}>{l.category}</span>
                    </div>
                    <div style={{ fontSize: '.875rem' }}>
                      <strong>{fmt(actual)}</strong> / {fmt(l.cap)} (Cap)
                    </div>
                  </div>

                  <div className="progress-track" style={{ marginBottom: '.5rem' }}>
                    <div className={`progress-fill ${hasExceeded ? 'danger' : ''}`} style={{ width: `${pct}%`, background: hasExceeded ? 'var(--danger)' : hasAlert ? 'var(--warning)' : undefined }} />
                  </div>

                  <div className="flex-between" style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                    <span>{pct}% consumed (Alert at {l.threshold}%)</span>
                    <button className="btn-icon" onClick={() => deleteLimit(l.id)} style={{ color: 'var(--danger)', width: '1.75rem', height: '1.75rem' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
