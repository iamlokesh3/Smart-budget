import { useApp } from '../context/AppContext';
import { ShieldAlert } from 'lucide-react';

export default function BudgetVsActual() {
  const { transactions, budgets, currency } = useApp();
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
    return (transactions || [])
      .filter(t => t.type === 'expense' && new Date(t.date) >= from)
      .reduce((s, t) => s + Number(t.amount || 0), 0);
  }

  // Combine budgets and actuals
  const data = (budgets || []).map(b => {
    const limit = Number(b.amount || 0);
    const actual = getSpent(b.type);
    const diff = limit - actual;
    const pct = limit > 0 ? Math.min(100, Math.round((actual / limit) * 100)) : 0;
    return {
      category: `${b.type} Budget`,
      limit,
      actual,
      diff,
      pct,
    };
  });

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  const overBudgets = data.filter(d => d.actual > d.limit);

  const totalBudget = (budgets || []).reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalActualSpent = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const utilization = totalBudget > 0 ? Math.round((totalActualSpent / totalBudget) * 100) : 0;

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Budget vs Actual</h2>
        <p>Compare your period budgets against your actual real-time spending.</p>
      </div>

      {overBudgets.length > 0 && (
        <div className="card anim-up" style={{ border: '1px solid var(--danger)', background: '#fef2f2', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--danger)' }}><ShieldAlert size={28} /></div>
          <div>
            <h4 style={{ color: '#991b1b' }}>Alert: Over Budget Limits!</h4>
            <p style={{ color: '#b91c1c', fontSize: '.875rem' }}>
              You have exceeded your limit in {overBudgets.length} budget period{overBudgets.length > 1 ? 's' : ''}:{' '}
              {overBudgets.map(o => o.category).join(', ')}.
            </p>
          </div>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h4>Total Budget</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue)', marginTop: '.5rem' }}>
            {fmt(totalBudget)}
          </div>
        </div>
        <div className="card">
          <h4>Total Actual Spent</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '.5rem' }}>
            {fmt(totalActualSpent)}
          </div>
        </div>
        <div className="card">
          <h4>Budget Utilization</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '.5rem' }}>
            {utilization}%
          </div>
        </div>
      </div>

      <div className="card anim-up" style={{ animationDelay: '.1s' }}>
        <h4 style={{ marginBottom: '1.25rem' }}>Period Wise Analysis</h4>
        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No active budgets found. Set up budgets in the Budgets section first.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.map(d => (
              <div key={d.category} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div className="flex-between" style={{ marginBottom: '.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{d.category}</div>
                  <div style={{ fontSize: '.875rem' }}>
                    <span style={{ fontWeight: 700, color: d.actual > d.limit ? 'var(--danger)' : 'var(--text-primary)' }}>{fmt(d.actual)}</span>
                    {' '}of{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{fmt(d.limit)}</span>
                  </div>
                </div>

                <div className="progress-track" style={{ marginBottom: '.5rem' }}>
                  <div
                    className={`progress-fill ${d.actual > d.limit ? 'danger' : ''}`}
                    style={{ width: `${d.pct}%`, background: d.actual > d.limit ? 'var(--danger)' : undefined }}
                  />
                </div>

                <div className="flex-between" style={{ fontSize: '.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{d.pct}% consumed</span>
                  {d.diff >= 0 ? (
                    <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>👍 {fmt(d.diff)} Remaining</span>
                  ) : (
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠️ {fmt(Math.abs(d.diff))} Over Limit</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
