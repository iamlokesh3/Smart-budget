import { useState } from 'react';
import { Bell, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BILL_ICONS = ['🏠', '💡', '📱', '🌐', '🚗', '📺', '💧', '🏥', '🎓', '🛡️'];

export default function BillReminders() {
  const { currency } = useApp();
  const [bills, setBills] = useState([
    { id: 1, name: 'House Rent',     amount: 15000, dueDay: 1,  icon: '🏠', category: 'Housing',  paid: false },
    { id: 2, name: 'Electricity',    amount: 2200,  dueDay: 10, icon: '💡', category: 'Utilities', paid: false },
    { id: 3, name: 'Mobile Recharge',amount: 699,   dueDay: 15, icon: '📱', category: 'Telecom',   paid: true  },
    { id: 4, name: 'Internet',       amount: 899,   dueDay: 20, icon: '🌐', category: 'Telecom',   paid: false },
    { id: 5, name: 'OTT Streaming',  amount: 649,   dueDay: 22, icon: '📺', category: 'Leisure',   paid: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '1', icon: '🏠', category: 'Utilities' });

  const today     = new Date().getDate();
  const totalDue  = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const totalPaid = bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);
  const overdue   = bills.filter(b => !b.paid && b.dueDay < today);
  const upcoming  = bills.filter(b => !b.paid && b.dueDay >= today).sort((a, b) => a.dueDay - b.dueDay);

  function addBill() {
    if (!form.name || !form.amount) return;
    setBills(prev => [...prev, { id: Date.now(), ...form, amount: parseFloat(form.amount), dueDay: parseInt(form.dueDay), paid: false }]);
    setForm({ name: '', amount: '', dueDay: '1', icon: '🏠', category: 'Utilities' });
    setShowForm(false);
  }
  function togglePaid(id) { setBills(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b)); }
  function deleteBill(id) { setBills(prev => prev.filter(b => b.id !== id)); }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Bill Reminders</h2>
          <p>Track and manage all your monthly bills and due dates.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Add Bill
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Due', value: fmt(totalDue),  color: 'var(--danger)',  bg: '#fef2f2' },
          { label: 'Total Paid', value: fmt(totalPaid), color: 'var(--emerald)', bg: '#f0fdf4' },
          { label: 'Overdue',    value: overdue.length, color: 'var(--amber)',   bg: '#fffbeb' },
          { label: 'Upcoming',   value: upcoming.length,color: 'var(--blue)',    bg: '#eff6ff' },
        ].map(k => (
          <div key={k.label} className="card" style={{ background: k.bg, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)', boxShadow: '0 0 0 3px #3b82f620' }}>
          <h4 style={{ marginBottom: '1rem' }}>➕ New Bill</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label className="label">Bill Name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Electricity Bill" />
            </div>
            <div className="input-group">
              <label className="label">Amount ({currency})</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Due Day (1-31)</label>
              <input className="input" type="number" min={1} max={31} value={form.dueDay} onChange={e => setForm(p => ({ ...p, dueDay: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Icon</label>
              <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                {BILL_ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                    style={{ fontSize: '1.25rem', padding: '.2rem .4rem', borderRadius: 6, border: form.icon === ic ? '2px solid var(--blue)' : '2px solid transparent', cursor: 'pointer', background: 'none' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={addBill}>Save Bill</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--danger)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <AlertCircle size={16} /> Overdue Bills
          </h4>
          {overdue.map(b => <BillRow key={b.id} bill={b} today={today} onPaid={togglePaid} onDelete={deleteBill} fmt={fmt} />)}
        </div>
      )}

      {/* Upcoming */}
      <div className="card anim-up" style={{ animationDelay: '.08s' }}>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Bell size={16} /> Upcoming & Paid Bills
        </h4>
        {[...upcoming, ...bills.filter(b => b.paid)].map(b => (
          <BillRow key={b.id} bill={b} today={today} onPaid={togglePaid} onDelete={deleteBill} fmt={fmt} />
        ))}
        {bills.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bills added yet. Click + Add Bill.</div>
        )}
      </div>
    </div>
  );
}

function BillRow({ bill, today, onPaid, onDelete, fmt }) {
  const daysLeft = bill.dueDay - today;
  const isOverdue = daysLeft < 0 && !bill.paid;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem 0', borderBottom: '1px solid var(--border)', opacity: bill.paid ? 0.6 : 1 }}>
      <span style={{ fontSize: '1.5rem' }}>{bill.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '.9rem', textDecoration: bill.paid ? 'line-through' : 'none' }}>{bill.name}</div>
        <div style={{ fontSize: '.8125rem', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
          {bill.paid ? '✅ Paid' : isOverdue ? `⚠️ Overdue by ${Math.abs(daysLeft)} days` : daysLeft === 0 ? '🔴 Due today!' : `Due in ${daysLeft} days (Day ${bill.dueDay})`}
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: '.95rem', minWidth: 80, textAlign: 'right' }}>{fmt(bill.amount)}</div>
      <button className="btn-icon" style={{ color: bill.paid ? 'var(--emerald)' : 'var(--text-muted)' }} onClick={() => onPaid(bill.id)} title="Mark paid"><Check size={15} /></button>
      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => onDelete(bill.id)} title="Delete"><Trash2 size={14} /></button>
    </div>
  );
}
