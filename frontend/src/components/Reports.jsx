import { useApp } from '../context/AppContext';
import { groupByCategory } from '../utils/analytics';

function printReport() { window.print(); }

export default function Reports() {
  const { transactions, budgets, goals, currency } = useApp();
  const cur = currency || '₹';

  const now = new Date();

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const thisWeek = transactions.filter(t => {
    const d = new Date(t.date);
    const wkStart = new Date(); wkStart.setDate(wkStart.getDate() - wkStart.getDay()); wkStart.setHours(0,0,0,0);
    return d >= wkStart;
  });

  const monthTotal = thisMonth.reduce((s, t) => s + t.amount, 0);
  const weekTotal  = thisWeek.reduce((s, t) => s + t.amount, 0);

  if (transactions.length < 3) {
    return (
      <div className="page-content anim-fade">
        <div className="page-header">
          <h2>Reports</h2>
          <p>Weekly and monthly summaries with PDF export.</p>
        </div>
        <div className="empty-state card">
          <div style={{fontSize:'3rem'}}>📄</div>
          <h3>No reports yet</h3>
          <p>Add at least 3 transactions to generate your first financial report.</p>
        </div>
      </div>
    );
  }

  const catBreakdown = groupByCategory(transactions);
  const monthlyBudget = budgets.find(b => b.type === 'Monthly');

  return (
    <div className="page-content anim-fade" id="report-printable">
      <div className="page-header flex-between" style={{flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <h2>Reports</h2>
          <p>Auto-generated from your {transactions.length} entries.</p>
        </div>
        <button className="btn btn-primary" onClick={printReport}>
          📄 Export PDF
        </button>
      </div>

      {/* Monthly report */}
      <div className="card report-section anim-up" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1.25rem'}}>
          <span style={{fontSize:'1.5rem'}}>📊</span>
          <div>
            <h3>Monthly Report</h3>
            <p style={{fontSize:'.875rem'}}>{now.toLocaleDateString('en-IN', {month:'long', year:'numeric'})}</p>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'1rem', marginBottom:'1.25rem'}}>
          {[
            { label: 'Total Spent', value: `${cur}${monthTotal.toLocaleString('en-IN')}`, color: 'var(--danger)' },
            { label: 'Transactions', value: thisMonth.length, color: 'var(--blue)' },
            { label: 'Daily Avg', value: `${cur}${(monthTotal / (now.getDate() || 1)).toLocaleString('en-IN', {maximumFractionDigits:0})}`, color: 'var(--emerald)' },
            monthlyBudget && { label: 'Budget Used', value: `${Math.min(100,(monthTotal/monthlyBudget.amount*100)).toFixed(0)}%`, color: monthTotal > monthlyBudget.amount ? 'var(--danger)' : 'var(--emerald)' },
          ].filter(Boolean).map((s, i) => (
            <div key={i} className="card" style={{textAlign:'center', padding:'1rem'}}>
              <div style={{fontSize:'1.25rem', fontWeight:800, color: s.color}}>{s.value}</div>
              <div style={{fontSize:'.75rem', color:'var(--text-muted)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <h4 style={{marginBottom:'.75rem'}}>Category Breakdown</h4>
        <div style={{display:'flex', flexDirection:'column', gap:'.5rem'}}>
          {groupByCategory(thisMonth).map(cat => (
            <div key={cat.name} style={{display:'flex', alignItems:'center', gap:'.75rem'}}>
              <span style={{fontSize:'1.1rem'}}>{cat.icon}</span>
              <span style={{flex:1, textTransform:'capitalize', fontSize:'.9rem'}}>{cat.name}</span>
              <div style={{width:120, height:6, background:'var(--bg-subtle)', borderRadius:'99px', overflow:'hidden'}}>
                <div style={{width:`${(cat.value/monthTotal*100).toFixed(0)}%`, height:'100%', background:'var(--blue)', borderRadius:'99px'}}/>
              </div>
              <span style={{fontWeight:600, fontSize:'.875rem', minWidth:80, textAlign:'right'}}>{cur}{cat.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly report */}
      <div className="card report-section anim-up" style={{animationDelay:'.1s', marginBottom:'1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1.25rem'}}>
          <span style={{fontSize:'1.5rem'}}>📅</span>
          <div>
            <h3>Weekly Report</h3>
            <p style={{fontSize:'.875rem'}}>This week</p>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'1rem', marginBottom:'1.25rem'}}>
          {[
            { label: 'This Week', value: `${cur}${weekTotal.toLocaleString('en-IN')}`, color: 'var(--blue)' },
            { label: 'Transactions', value: thisWeek.length, color: 'var(--emerald)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{textAlign:'center', padding:'1rem'}}>
              <div style={{fontSize:'1.25rem', fontWeight:800, color: s.color}}>{s.value}</div>
              <div style={{fontSize:'.75rem', color:'var(--text-muted)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {thisWeek.length === 0 ? (
          <p style={{color:'var(--text-muted)', fontSize:'.875rem'}}>No transactions this week yet.</p>
        ) : (
          <table className="transactions-table">
            <thead><tr><th>Entry</th><th>Category</th><th style={{textAlign:'right'}}>Amount</th></tr></thead>
            <tbody>
              {thisWeek.map(tx => (
                <tr key={tx.id}>
                  <td style={{fontWeight:500}}>{tx.categoryIcon} {tx.title}</td>
                  <td><span className="badge badge-blue" style={{textTransform:'capitalize'}}>{tx.category}</span></td>
                  <td style={{textAlign:'right', fontWeight:700, color:'var(--danger)'}}>{cur}{tx.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Goals summary */}
      {goals.length > 0 && (
        <div className="card report-section anim-up" style={{animationDelay:'.15s'}}>
          <h3 style={{marginBottom:'1rem'}}>Goals Progress</h3>
          {goals.map(g => {
            const pct = Math.min(100, (g.current/g.target*100)).toFixed(0);
            return (
              <div key={g.id} style={{marginBottom:'1rem'}}>
                <div className="flex-between" style={{marginBottom:'.375rem'}}>
                  <span style={{fontWeight:500}}>{g.name}</span>
                  <span style={{fontSize:'.875rem'}}>{cur}{g.current.toLocaleString('en-IN')} / {cur}{g.target.toLocaleString('en-IN')}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width:`${pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@media print { .btn, .sidebar, .topbar, .chat-fab { display: none !important; } }`}</style>
    </div>
  );
}
