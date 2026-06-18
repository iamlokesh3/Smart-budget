import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Heart, Check, Sparkles } from 'lucide-react';

export default function WishlistTracker() {
  const { currency } = useApp();
  const [items, setItems] = useState([
    { id: 1, name: 'Sony WH-1000XM5 Headphones', price: 29999, saved: 12000, link: '' },
    { id: 2, name: 'Ergonomic Desk Chair', price: 15000, saved: 15000, link: '' },
  ]);

  const [form, setForm] = useState({ name: '', price: '', saved: '0', link: '' });
  const [showForm, setShowForm] = useState(false);
  const [addingFunds, setAddingFunds] = useState(null);
  const [fundAmt, setFundAmt] = useState('');

  function addItem() {
    if (!form.name || !form.price) return;
    setItems(prev => [...prev, { id: Date.now(), ...form, price: Number(form.price), saved: Number(form.saved) }]);
    setForm({ name: '', price: '', saved: '0', link: '' });
    setShowForm(false);
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function saveFunds(id) {
    const amt = Number(fundAmt) || 0;
    if (amt <= 0) return;
    setItems(prev => prev.map(item => item.id === id ? { ...item, saved: Math.min(item.price, item.saved + amt) } : item));
    setAddingFunds(null);
    setFundAmt('');
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Wishlist Tracker</h2>
          <p>Add gadgets, courses, or gear you want to buy and save up for them.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Add Wish Item
        </button>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>💖 Add to Wishlist</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Item Name</label>
              <input className="input" placeholder="e.g. iPad Pro" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Estimated Price</label>
              <input className="input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Initial Savings</label>
              <input className="input" type="number" value={form.saved} onChange={e => setForm(p => ({ ...p, saved: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addItem}>Add Item</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {items.map(item => {
          const pct = Math.min(100, Math.round((item.saved / item.price) * 100));
          const completed = item.saved >= item.price;

          return (
            <div key={item.id} className="card anim-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="flex-between" style={{ marginBottom: '.75rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <Heart size={16} style={{ color: completed ? 'var(--emerald)' : 'var(--danger)', fill: completed ? 'var(--emerald)' : 'none' }} />
                    {item.name}
                  </h4>
                  <button className="btn-icon" onClick={() => deleteItem(item.id)} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex-between" style={{ fontSize: '.875rem', marginBottom: '.5rem' }}>
                  <span>Price: {fmt(item.price)}</span>
                  <span>Saved: {fmt(item.saved)}</span>
                </div>

                <div className="progress-track" style={{ marginBottom: '.5rem' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: completed ? 'linear-gradient(90deg, var(--emerald), var(--emerald-dark))' : undefined }} />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                {completed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: 'var(--emerald-dark)', fontSize: '.875rem', fontWeight: 600 }}>
                    <Sparkles size={16} /> Fully saved! Ready to buy.
                  </div>
                ) : addingFunds === item.id ? (
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <input className="input" type="number" placeholder="Amt" value={fundAmt} onChange={e => setFundAmt(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-emerald btn-sm" onClick={() => saveFunds(item.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingFunds(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-outline-blue btn-sm" style={{ width: '100%' }} onClick={() => setAddingFunds(item.id)}>
                    Add Savings towards item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
