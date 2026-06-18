import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Users, Landmark, Trash2 } from 'lucide-react';

export default function FamilyBudget() {
  const { currency } = useApp();
  const [members, setMembers] = useState([
    { id: 1, name: 'Lokesh (Self)', role: 'Owner', contribution: 45000 },
    { id: 2, name: 'Anjali (Spouse)', role: 'Co-Contributor', contribution: 30000 },
  ]);

  const [form, setForm] = useState({ name: '', role: 'Co-Contributor', contribution: '' });
  const [showForm, setShowForm] = useState(false);

  const sharedPool = members.reduce((sum, m) => sum + (Number(m.contribution) || 0), 0);

  function addMember() {
    if (!form.name || !form.contribution) return;
    setMembers(prev => [...prev, { id: Date.now(), ...form, contribution: Number(form.contribution) }]);
    setForm({ name: '', role: 'Co-Contributor', contribution: '' });
    setShowForm(false);
  }

  function deleteMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Shared Family Budget</h2>
          <p>Create a joint account simulation with family members to combine monthly savings.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Link Family Member
        </button>
      </div>

      <div className="card anim-up" style={{ background: 'linear-gradient(135deg, var(--blue-light), var(--bg-card))', borderLeft: '4px solid var(--blue)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
          <div style={{ background: 'var(--blue)', color: '#fff', borderRadius: '50%', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
            <Landmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>Combined Monthly Pool</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue-dark)' }}>{fmt(sharedPool)}</div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card anim-up" style={{ marginBottom: '1.5rem', border: '1px solid var(--blue)' }}>
          <h4 style={{ marginBottom: '1rem' }}>👥 Link Member</h4>
          <div className="grid-3">
            <div className="input-group">
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. Ramesh (Father)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Monthly Contribution</label>
              <input className="input" type="number" value={form.contribution} onChange={e => setForm(p => ({ ...p, contribution: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="label">Access Level</label>
              <select className="select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="Co-Contributor">Co-Contributor</option>
                <option value="Viewer">Viewer Only</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={addMember}>Link Member</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Users size={16} /> Budget Contributors
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {members.map(m => (
            <div key={m.id} className="flex-between" style={{ padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{m.role}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontWeight: 700 }}>{fmt(m.contribution)}</div>
                {m.role !== 'Owner' && (
                  <button className="btn-icon" onClick={() => deleteMember(m.id)} style={{ color: 'var(--danger)', width: '2rem', height: '2rem' }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
