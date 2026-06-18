import { useApp } from '../context/AppContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function CashFlow() {
  const { transactions, currency } = useApp();

  const totalIn = transactions.filter(t => t.type === 'income').reduce((s, i) => s + Number(i.amount), 0);
  const totalOut = transactions.filter(t => t.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
  const netFlow = totalIn - totalOut;

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Cash Flow Statement</h2>
        <p>Monitor your overall liquidity and see if you are operating on a positive net flow.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ background: '#f0fdf4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.875rem', color: 'var(--emerald-dark)', fontWeight: 600 }}>Total Inflows</span>
            <ArrowUpRight size={18} style={{ color: 'var(--emerald)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-dark)', marginTop: '.5rem' }}>
            {fmt(totalIn)}
          </div>
        </div>

        <div className="card" style={{ background: '#fef2f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.875rem', color: 'var(--danger)', fontWeight: 600 }}>Total Outflows</span>
            <ArrowDownRight size={18} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '.5rem' }}>
            {fmt(totalOut)}
          </div>
        </div>

        <div className="card" style={{ background: netFlow >= 0 ? 'var(--blue-light)' : '#fffbeb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.875rem', color: 'var(--blue-dark)', fontWeight: 600 }}>Net Cash Flow</span>
            <TrendingUp size={18} style={{ color: 'var(--blue)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: netFlow >= 0 ? 'var(--blue-dark)' : 'var(--warning)', marginTop: '.5rem' }}>
            {netFlow >= 0 ? '+' : ''}{fmt(netFlow)}
          </div>
        </div>
      </div>

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1.25rem' }}>Monthly Transactions Analysis</h4>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No recent transactions found in ledger database.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {transactions.slice(0, 10).map(t => (
              <div key={t.id} className="flex-between" style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{t.title}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{t.date} • {t.category}</div>
                </div>
                <div style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--emerald-dark)' : 'var(--text-primary)' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
