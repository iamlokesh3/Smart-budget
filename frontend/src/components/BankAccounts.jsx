import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Landmark, RefreshCw } from 'lucide-react';

export default function BankAccounts() {
  const { currency } = useApp();
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'HDFC Savings Account', bank: 'HDFC Bank', balance: 52400, lastSync: '10 mins ago' },
    { id: 2, name: 'SBI Credit Card Account', bank: 'State Bank of India', balance: -12500, lastSync: '1 hour ago' },
  ]);

  const [form, setForm] = useState({ name: '', bank: 'HDFC Bank', balance: '' });
  const [showForm, setShowForm] = useState(false);

  function addAccount() {
    if (!form.name || !form.balance) return;
    setAccounts(prev => [...prev, { id: Date.now(), ...form, balance: Number(form.balance), lastSync: 'Just now' }]);
    setForm({ name: '', bank: 'HDFC Bank', balance: '' });
    setShowForm(false);
  }

  function deleteAccount(id) {
    setAccounts(prev => prev.filter(a => a.id !== id));
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Bank Accounts</h2>
          <p>Link and view balances across your active bank accounts in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Link Bank Account
        </button>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>🏦 Link Bank Account</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Account Name</label>
              <input className="input" placeholder="e.g. Primary Savings" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Bank Name</label>
              <select className="select" value={form.bank} onChange={e => setForm(p => ({ ...p, bank: e.target.value }))}>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
              </select>
            </div>
            <div className="input-group">
              <label className="label">Current Balance ({currency})</label>
              <input className="input" type="number" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addAccount}>Link Account</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {accounts.map(a => (
          <div key={a.id} className="card anim-up">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <Landmark size={18} style={{ color: 'var(--blue)' }} /> {a.name}
              </h3>
              <button className="btn-icon" onClick={() => deleteAccount(a.id)} style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex-between" style={{ fontSize: '.875rem', marginBottom: '.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{a.bank}</span>
              <span style={{ fontWeight: 700, color: a.balance >= 0 ? 'var(--emerald-dark)' : 'var(--danger)' }}>{fmt(a.balance)}</span>
            </div>
            <div className="flex-between" style={{ fontSize: '.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '.5rem' }}>
              <span>Status: Mapped</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}><RefreshCw size={10} /> Sync: {a.lastSync}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
