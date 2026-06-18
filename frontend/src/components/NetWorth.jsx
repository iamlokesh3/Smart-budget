import { useApp } from '../context/AppContext';
import { DollarSign, Landmark, ArrowDownCircle, ShieldCheck } from 'lucide-react';

export default function NetWorth() {
  const { transactions, goals, currency } = useApp();

  // Calculate Asset components
  const incomes = transactions.filter(t => t.type === 'income').reduce((s, i) => s + Number(i.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
  const cashOnHand = Math.max(0, incomes - expenses);

  const totalSavedInGoals = goals.reduce((s, g) => s + Number(g.current), 0);
  
  // Custom mock investments
  const investments = 120000; // stock holdings/mutual funds mock

  // Liabilities (mock loans/debts)
  const outstandingLoans = 45000;

  const totalAssets = cashOnHand + totalSavedInGoals + investments;
  const netWorth = totalAssets - outstandingLoans;

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Net Worth Dashboard</h2>
        <p>Monitor your overall financial health by tracking assets against liabilities.</p>
      </div>

      <div className="card anim-up" style={{ background: 'linear-gradient(135deg, var(--blue-light), var(--bg-card))', borderLeft: '4px solid var(--blue)', marginBottom: '1.5rem', padding: '2rem' }}>
        <h4 style={{ color: 'var(--text-secondary)' }}>Your Calculated Net Worth</h4>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue-dark)', marginTop: '.5rem' }}>
          {fmt(netWorth)}
        </div>
        <p style={{ fontSize: '.875rem', marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.4rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--emerald)' }} /> Calculated using active ledger cash-flows, goals, and mapped accounts.
        </p>
      </div>

      <div className="grid-2">
        {/* Assets Card */}
        <div className="card anim-up" style={{ animationDelay: '.05s' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--emerald)', marginBottom: '1.25rem' }}>
            <Landmark size={20} /> Assets ({fmt(totalAssets)})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Liquid Cash (Ledger Bal)', val: cashOnHand },
              { name: 'Goal Savings Deposits', val: totalSavedInGoals },
              { name: 'Investment Portfolios', val: investments },
            ].map(a => (
              <div key={a.name} className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
                <span style={{ fontSize: '.9rem' }}>{a.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald-dark)' }}>{fmt(a.val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities Card */}
        <div className="card anim-up" style={{ animationDelay: '.1s' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--danger)', marginBottom: '1.25rem' }}>
            <ArrowDownCircle size={20} /> Liabilities ({fmt(outstandingLoans)})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'Credit Cards Outstanding', val: 15000 },
              { name: 'Personal/Educational Loans', val: 30000 },
            ].map(l => (
              <div key={l.name} className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
                <span style={{ fontSize: '.9rem' }}>{l.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{fmt(l.val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
