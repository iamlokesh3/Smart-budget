import { useApp } from '../context/AppContext';
import { ShieldAlert, TrendingUp, Smile, AlertTriangle } from 'lucide-react';

export default function BudgetVsActual() {
  const { transactions, budgets, currency } = useApp();

  // Calculate actual spending per category
  const actuals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  // Combine budgets and actuals
  const data = budgets.map(b => {
    const actual = actuals[b.type] || 0;
    const diff = b.limit - actual;
    const pct = Math.min(100, Math.round((actual / b.limit) * 100));
    return {
      category: b.type,
      limit: b.limit,
      actual,
      diff,
      pct,
    };
  });

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  const overBudgets = data.filter(d => d.actual > d.limit);

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Budget vs Actual</h2>
        <p>Compare your monthly budget limits against your actual real-time spending.</p>
      </div>

      {overBudgets.length > 0 && (
        <div className="card anim-up" style={{ border: '1px solid var(--danger)', background: '#fef2f2', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ color: 'var(--danger)' }}><ShieldAlert size={28} /></div>
          <div>
            <h4 style={{ color: '#991b1b' }}>Alert: Over Budget Limits!</h4>
            <p style={{ color: '#b91c1c', fontSize: '.875rem' }}>
              You have exceeded your budget in {overBudgets.length} category{overBudgets.length > 1 ? 'ies' : ''}:{' '}
              {overBudgets.map(o => o.category).join(', ')}. Try to cut back on discretionary spend.
            </p>
          </div>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h4>Total Budget</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--blue)', marginTop: '.5rem' }}>
            {fmt(budgets.reduce((s, b) => s + b.limit, 0))}
          </div>
        </div>
        <div className="card">
          <h4>Total Actual Spent</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '.5rem' }}>
            {fmt(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0))}
          </div>
        </div>
        <div className="card">
          <h4>Budget Utilization</h4>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '.5rem' }}>
            {budgets.length > 0
              ? `${Math.round((transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) / budgets.reduce((s, b) => s + b.limit, 0)) * 100)}%`
              : '0%'}
          </div>
        </div>
      </div>

      <div className="card anim-up" style={{ animationDelay: '.1s' }}>
        <h4 style={{ marginBottom: '1.25rem' }}>Category Wise Analysis</h4>
        {data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No active category budgets found. Set up budgets in the Budgets section first.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.map(d => (
              <div key={d.category} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div className="flex-between" style={{ marginBottom: '.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{d.category}</div>
                  <div style={{ fontSize: '.875rem' }}>
                    <span style={{ fontWeight: 700, color: d.pct > 100 ? 'var(--danger)' : 'var(--text-primary)' }}>{fmt(d.actual)}</span>
                    {' '}of{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{fmt(d.limit)}</span>
                  </div>
                </div>

                <div className="progress-track" style={{ marginBottom: '.5rem' }}>
                  <div
                    className={`progress-fill ${d.pct > 100 ? 'danger' : ''}`}
                    style={{ width: `${d.pct}%`, background: d.pct > 100 ? 'var(--danger)' : undefined }}
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
