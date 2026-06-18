import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, CreditCard, ShieldCheck } from 'lucide-react';

export default function CardManager() {
  const { currency } = useApp();
  const [cards, setCards] = useState([
    { id: 1, name: 'HDFC Regalia Credit Card', limit: 300000, dueDay: 20, num: '•••• 4859' },
    { id: 2, name: 'Amazon Pay ICICI Card', limit: 150000, dueDay: 15, num: '•••• 1204' },
  ]);

  const [form, setForm] = useState({ name: '', limit: '', dueDay: '15', num: '' });
  const [showForm, setShowForm] = useState(false);

  function addCard() {
    if (!form.name || !form.limit) return;
    setCards(prev => [...prev, { id: Date.now(), ...form, limit: Number(form.limit), dueDay: Number(form.dueDay) }]);
    setForm({ name: '', limit: '', dueDay: '15', num: '' });
    setShowForm(false);
  }

  function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Card Manager</h2>
          <p>Track your credit and debit cards, spending limits, and due dates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Link Card
        </button>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>💳 Link Card</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Card Name</label>
              <input className="input" placeholder="e.g. HDFC Regalia" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Credit Limit</label>
              <input className="input" type="number" value={form.limit} onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Card Number (Last 4 Digits)</label>
              <input className="input" placeholder="e.g. 1234" value={form.num} onChange={e => setForm(p => ({ ...p, num: e.target.value ? `•••• ${e.target.value}` : '' }))} />
            </div>
            <div className="input-group">
              <label className="label">Due Day of Month</label>
              <input className="input" type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm(p => ({ ...p, dueDay: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addCard}>Save Card</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {cards.map(c => (
          <div key={c.id} className="card anim-up" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff', border: 'none' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <CreditCard size={24} style={{ color: 'var(--blue)' }} />
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{c.name}</span>
              </div>
              <button className="btn-icon" onClick={() => deleteCard(c.id)} style={{ color: 'var(--danger)', background: 'rgba(255,255,255,0.1)', borderColor: 'transparent' }}>
                <Trash2 size={14} />
              </button>
            </div>
            <div style={{ fontSize: '1.25rem', letterSpacing: '.15em', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
              {c.num || '•••• •••• •••• 0000'}
            </div>
            <div className="flex-between" style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
              <div>
                <div>Limit</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>{fmt(c.limit)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Due Day</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>Day {c.dueDay}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
