import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, ShieldCheck } from 'lucide-react';

export default function SubscriptionManager() {
  const { currency } = useApp();
  const [subs, setSubs] = useState([
    { id: 1, name: 'Netflix Premium', cost: 649, interval: 'Monthly', nextBill: '2026-07-02', category: 'Entertainment' },
    { id: 2, name: 'Spotify Duo', cost: 149, interval: 'Monthly', nextBill: '2026-06-28', category: 'Entertainment' },
    { id: 3, name: 'Google One 100GB', cost: 1300, interval: 'Yearly', nextBill: '2026-12-15', category: 'Storage' },
    { id: 4, name: 'Gym Membership', cost: 1500, interval: 'Monthly', nextBill: '2026-07-01', category: 'Fitness' },
  ]);

  const [form, setForm] = useState({ name: '', cost: '', interval: 'Monthly', nextBill: '', category: 'Entertainment' });
  const [showForm, setShowForm] = useState(false);

  const monthlyTotal = subs.reduce((sum, s) => {
    const cost = Number(s.cost) || 0;
    return sum + (s.interval === 'Yearly' ? cost / 12 : cost);
  }, 0);

  function addSub() {
    if (!form.name || !form.cost) return;
    setSubs(prev => [...prev, { id: Date.now(), ...form, cost: Number(form.cost) }]);
    setForm({ name: '', cost: '', interval: 'Monthly', nextBill: '', category: 'Entertainment' });
    setShowForm(false);
  }

  function deleteSub(id) {
    setSubs(prev => prev.filter(s => s.id !== id));
  }

  const fmt = (n) => `${currency}${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Subscription Manager</h2>
          <p>Keep track of all your recurring subscriptions and service memberships.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Add Subscription
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h4>Active Subscriptions</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue)', marginTop: '.5rem' }}>
            {subs.length}
          </div>
        </div>
        <div className="card">
          <h4>Est. Cost / Month</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '.5rem' }}>
            {fmt(monthlyTotal)}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>➕ New Subscription</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Service Name</label>
              <input className="input" placeholder="e.g. Amazon Prime" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Cost ({currency})</label>
              <input className="input" type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Billing Interval</label>
              <select className="select" value={form.interval} onChange={e => setForm(p => ({ ...p, interval: e.target.value }))}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div className="input-group">
              <label className="label">Next Bill Date</label>
              <input className="input" type="date" value={form.nextBill} onChange={e => setForm(p => ({ ...p, nextBill: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Storage">Software/Storage</option>
                <option value="Fitness">Fitness & Health</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addSub}>Add</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1rem' }}>Your Subscriptions</h4>
        {subs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No subscriptions tracked yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {subs.map(s => (
              <div key={s.id} className="flex-between" style={{ padding: '.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.25rem' }}>
                    <span className="badge badge-blue">{s.category}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                      <Calendar size={12} /> Next: {s.nextBill || 'N/A'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>{fmt(s.cost)}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>per {s.interval.toLowerCase().replace('ly', '')}</div>
                  </div>
                  <button className="btn-icon" onClick={() => deleteSub(s.id)} style={{ color: 'var(--danger)' }}>
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
