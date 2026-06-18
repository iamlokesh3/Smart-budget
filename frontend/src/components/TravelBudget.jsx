import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, MapPin, Compass } from 'lucide-react';

export default function TravelBudget() {
  const { currency } = useApp();
  const [trips, setTrips] = useState([
    { id: 1, destination: 'Goa Summer Trip', budget: 25000, spent: 18450 },
    { id: 2, destination: 'Himalayan Trekking', budget: 15000, spent: 4500 },
  ]);

  const [form, setForm] = useState({ destination: '', budget: '', spent: '0' });
  const [showForm, setShowForm] = useState(false);

  function addTrip() {
    if (!form.destination || !form.budget) return;
    setTrips(prev => [...prev, { id: Date.now(), ...form, budget: Number(form.budget), spent: Number(form.spent) }]);
    setForm({ destination: '', budget: '', spent: '0' });
    setShowForm(false);
  }

  function deleteTrip(id) {
    setTrips(prev => prev.filter(t => t.id !== id));
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Travel Budget Planner</h2>
          <p>Create separate pocket budgets for your vacations, flights, and road trips.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Plan New Vacation
        </button>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>✈️ Travel Planner</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Destination/Trip Name</label>
              <input className="input" placeholder="e.g. Europe 2026" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Allocated Budget</label>
              <input className="input" type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Pre-spent Expenses</label>
              <input className="input" type="number" value={form.spent} onChange={e => setForm(p => ({ ...p, spent: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addTrip}>Save Trip</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {trips.map(t => {
          const pct = Math.min(100, Math.round((t.spent / t.budget) * 100));
          const remaining = t.budget - t.spent;

          return (
            <div key={t.id} className="card anim-up" style={{ position: 'relative' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <MapPin size={18} style={{ color: 'var(--blue)' }} /> {t.destination}
                </h3>
                <button className="btn-icon" onClick={() => deleteTrip(t.id)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex-between" style={{ fontSize: '.875rem', marginBottom: '.5rem' }}>
                <span>Budget: {fmt(t.budget)}</span>
                <span>Spent: {fmt(t.spent)}</span>
              </div>

              <div className="progress-track" style={{ marginBottom: '.5rem' }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>

              <div className="flex-between" style={{ fontSize: '.75rem', color: 'var(--text-secondary)' }}>
                <span>{pct}% utilized</span>
                <span style={{ fontWeight: 600, color: remaining >= 0 ? 'var(--emerald)' : 'var(--danger)' }}>
                  {remaining >= 0 ? `${fmt(remaining)} Left` : `${fmt(Math.abs(remaining))} Overspent`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
