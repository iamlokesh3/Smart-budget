import { useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BUDGET_TYPES = ['Daily', 'Weekly', 'Monthly'];

export default function BudgetPlanner() {
  const { budgets, addBudget, deleteBudget, transactions, currency } = useApp();
  const [selectedType, setSelectedType] = useState('Monthly');
  const [amount, setAmount]   = useState('');
  const [error, setError]     = useState('');
  const cur = currency || '₹';

  const now = new Date();

  function getSpent(type) {
    let from = new Date();
    if (type === 'Daily') {
      from.setHours(0,0,0,0);
    } else if (type === 'Weekly') {
      from.setDate(from.getDate() - from.getDay());
      from.setHours(0,0,0,0);
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return transactions
      .filter(t => new Date(t.date) >= from)
      .reduce((s, t) => s + t.amount, 0);
  }

  function handleAdd(e) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Please enter a valid amount.'); return; }
    addBudget({
      id: Date.now().toString(),
      type: selectedType,
      amount: num,
      createdAt: new Date().toISOString(),
    });
    setAmount('');
    setError('');
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Budget Planner</h2>
        <p>Set daily, weekly, or monthly spending limits. Progress bars appear once you have transactions.</p>
      </div>

      {/* Create budget */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1.25rem'}}>
          <Wallet size={16} color="var(--blue)"/>
          <span style={{fontWeight:600}}>Create Budget</span>
        </div>

        <form onSubmit={handleAdd}>
          <div className="budget-types">
            {BUDGET_TYPES.map(t => (
              <button
                key={t} type="button"
                className={`budget-type-btn ${selectedType === t ? 'selected' : ''}`}
                onClick={() => setSelectedType(t)}
              >
                {t === 'Daily' ? '📅' : t === 'Weekly' ? '📆' : '📊'} {t}
              </button>
            ))}
          </div>

          <div style={{display:'flex', gap:'.75rem', alignItems:'flex-end'}}>
            <div className="input-group" style={{flex:1}}>
              <label className="label">{selectedType} Budget Amount</label>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontWeight:600}}>{cur}</span>
                <input
                  className="input"
                  style={{paddingLeft:'2rem'}}
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" style={{whiteSpace:'nowrap', height:47}}>
              <Plus size={16}/> Add Budget
            </button>
          </div>
          {error && <p style={{color:'var(--danger)', fontSize:'.875rem', marginTop:'.5rem'}}>{error}</p>}
        </form>
      </div>

      {/* Budget list */}
      {budgets.length === 0 ? (
        <div className="empty-state card">
          <div style={{fontSize:'3rem'}}>📋</div>
          <h3>No budgets yet</h3>
          <p>Create your first budget above. Progress bars will appear automatically once you have matching transactions.</p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          {budgets.map(b => {
            const spent = getSpent(b.type);
            const pct = Math.min(100, (spent / b.amount) * 100);
            const over = spent > b.amount;
            const hasTransactions = transactions.length > 0;

            return (
              <div key={b.id} className="card anim-up">
                <div className="flex-between" style={{marginBottom:'.875rem'}}>
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                      <span style={{fontSize:'1.25rem'}}>{b.type === 'Daily' ? '📅' : b.type === 'Weekly' ? '📆' : '📊'}</span>
                      <h4>{b.type} Budget</h4>
                      {over && <span className="badge badge-danger">Exceeded</span>}
                    </div>
                    <p style={{fontSize:'.875rem', marginTop:'.2rem'}}>
                      Limit: <strong>{cur}{b.amount.toLocaleString('en-IN')}</strong>
                      {hasTransactions && (
                        <> · Spent: <strong style={{color: over ? 'var(--danger)' : 'var(--text-primary)'}}>
                          {cur}{spent.toLocaleString('en-IN')}
                        </strong> · Remaining: <strong style={{color: over ? 'var(--danger)' : 'var(--emerald)'}}>
                          {over ? `-${cur}${(spent - b.amount).toLocaleString('en-IN')}` : `${cur}${(b.amount - spent).toLocaleString('en-IN')}`}
                        </strong></>
                      )}
                    </p>
                  </div>
                  <button className="btn-icon" onClick={() => deleteBudget(b.id)} style={{color:'var(--danger)'}}>
                    <Trash2 size={15}/>
                  </button>
                </div>

                {hasTransactions ? (
                  <>
                    <div className="progress-track">
                      <div className={`progress-fill ${over ? 'danger' : ''}`} style={{width:`${pct}%`}}/>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginTop:'.5rem', fontSize:'.8rem', color:'var(--text-muted)'}}>
                      <span>{pct.toFixed(1)}% used</span>
                      <span style={{color: over ? 'var(--danger)' : 'var(--emerald)', fontWeight:600}}>
                        {over ? '⚠️ Over budget' : '✅ On track'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{padding:'.75rem', background:'var(--bg-subtle)', borderRadius:'var(--radius-md)', fontSize:'.875rem', color:'var(--text-muted)', textAlign:'center'}}>
                    Add transactions to see your progress bar
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
