import { useState } from 'react';
import { Plus, Trash2, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, currency } = useApp();
  const cur = currency || '₹';
  const [form, setForm]   = useState({ name: '', target: '', current: '' });
  const [error, setError] = useState('');
  const [addingFunds, setAddingFunds] = useState(null);
  const [fundAmt, setFundAmt] = useState('');

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); setError(''); }

  function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return setError('Please enter a goal name.');
    const target = parseFloat(form.target);
    if (!target || target <= 0) return setError('Please enter a valid target amount.');
    const current = parseFloat(form.current) || 0;

    addGoal({
      id: Date.now().toString(),
      name: form.name.trim(),
      target,
      current,
      createdAt: new Date().toISOString(),
    });
    setForm({ name: '', target: '', current: '' });
    setError('');
  }

  function addFunds(id) {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) return;
    const goal = goals.find(g => g.id === id);
    if (goal) updateGoal(id, { current: Math.min(goal.target, goal.current + amt) });
    setAddingFunds(null);
    setFundAmt('');
  }

  function estimateETA(goal) {
    if (goal.current >= goal.target) return 'Completed! 🎉';
    const remaining = goal.target - goal.current;
    // Assume user adds ~₹3000/month if no specific saving rate known
    const monthlyRate = 3000;
    const months = Math.ceil(remaining / monthlyRate);
    const eta = new Date();
    eta.setMonth(eta.getMonth() + months);
    return `~${eta.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Savings Goals</h2>
        <p>Create goals and track your progress towards financial targets.</p>
      </div>

      {/* Create goal */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.25rem'}}>
          <span style={{fontSize:'1.25rem'}}>🎯</span>
          <span style={{fontWeight:600}}>Create New Goal</span>
        </div>

        <form onSubmit={handleAdd} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="input-group">
            <label className="label">Goal Name</label>
            <input className="input" placeholder='e.g. Laptop, Vacation, Emergency Fund' value={form.name} onChange={e => setF('name', e.target.value)}/>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div className="input-group">
              <label className="label">Target Amount ({cur})</label>
              <input className="input" type="number" min="1" placeholder="e.g. 50000" value={form.target} onChange={e => setF('target', e.target.value)}/>
            </div>
            <div className="input-group">
              <label className="label">Current Savings ({cur}) <span className="text-muted text-xs">optional</span></label>
              <input className="input" type="number" min="0" placeholder="0" value={form.current} onChange={e => setF('current', e.target.value)}/>
            </div>
          </div>
          {error && <p style={{color:'var(--danger)', fontSize:'.875rem'}}>{error}</p>}
          <div>
            <button className="btn btn-emerald" type="submit">
              <Plus size={16}/> Add Goal
            </button>
          </div>
        </form>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="empty-state card">
          <div style={{fontSize:'3rem'}}>🎯</div>
          <h3>No goals yet</h3>
          <p>Create your first savings goal above — whether it's a laptop, vacation, or emergency fund.</p>
        </div>
      ) : (
        <div className="grid-2">
          {goals.map((g, i) => {
            const pct = Math.min(100, (g.current / g.target) * 100);
            const done = g.current >= g.target;
            return (
              <div key={g.id} className="card goal-card anim-up" style={{animationDelay:`${i*.08}s`}}>
                <div className="flex-between" style={{marginBottom:'.875rem'}}>
                  <div>
                    <h4 style={{marginBottom:'.2rem'}}>{g.name}</h4>
                    {done
                      ? <span className="badge badge-emerald">✅ Completed</span>
                      : <span className="goal-eta">{estimateETA(g)}</span>
                    }
                  </div>
                  <button className="btn-icon" onClick={() => deleteGoal(g.id)} style={{color:'var(--danger)'}}>
                    <Trash2 size={14}/>
                  </button>
                </div>

                <div className="flex-between" style={{marginBottom:'.75rem'}}>
                  <div>
                    <div className="goal-amount">{cur}{g.current.toLocaleString('en-IN')}</div>
                    <div className="goal-sub">saved of {cur}{g.target.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'1.75rem', fontWeight:800, color: done ? 'var(--emerald)' : 'var(--blue)'}}>
                      {pct.toFixed(0)}%
                    </div>
                    <div style={{fontSize:'.75rem', color:'var(--text-muted)'}}>complete</div>
                  </div>
                </div>

                <div className="progress-track" style={{marginBottom:'.875rem'}}>
                  <div className="progress-fill" style={{width:`${pct}%`, background: done ? 'linear-gradient(90deg, var(--emerald), var(--emerald-dark))' : undefined}}/>
                </div>

                {/* Add funds */}
                {!done && (
                  addingFunds === g.id ? (
                    <div style={{display:'flex', gap:'.5rem'}}>
                      <input
                        className="input"
                        type="number" min="1"
                        placeholder={`Amount (${cur})`}
                        value={fundAmt}
                        onChange={e => setFundAmt(e.target.value)}
                        style={{flex:1}}
                        autoFocus
                      />
                      <button className="btn btn-emerald btn-sm" onClick={() => addFunds(g.id)}>Add</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setAddingFunds(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="btn btn-outline-blue btn-sm" onClick={() => setAddingFunds(g.id)} style={{width:'100%'}}>
                      <PlusCircle size={14}/> Add Funds
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
