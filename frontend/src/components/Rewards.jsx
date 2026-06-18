import { useApp } from '../context/AppContext';
import { Award, Star, Compass, Gift } from 'lucide-react';

export default function Rewards() {
  const { transactions, goals } = useApp();

  // Simple mock score calculations
  const txCount = transactions.length;
  const completedGoals = goals.filter(g => g.current >= g.target).length;
  const points = (txCount * 15) + (completedGoals * 100) + 150; // default 150

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Rewards & Points</h2>
        <p>Earn points by saving money, staying within budget, and completing goals.</p>
      </div>

      <div className="card anim-up" style={{ background: 'linear-gradient(135deg, var(--warning), #fffbeb)', border: '1px solid #f59e0b', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', width: '4rem', height: '4rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Star size={32} />
        </div>
        <div>
          <div style={{ fontSize: '.875rem', color: '#b45309', fontWeight: 600 }}>Your Active Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#92400e', lineHeight: 1.1 }}>{points} PTS</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card anim-up" style={{ animationDelay: '.05s' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
            <Award size={18} style={{ color: 'var(--blue)' }} /> How to Earn Points
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', fontSize: '.9rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              <span>Log a new transaction</span>
              <strong style={{ color: 'var(--emerald)' }}>+15 PTS</strong>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              <span>Complete a Savings Target</span>
              <strong style={{ color: 'var(--emerald)' }}>+100 PTS</strong>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              <span>Stay under budget category limit</span>
              <strong style={{ color: 'var(--emerald)' }}>+50 PTS</strong>
            </div>
          </div>
        </div>

        <div className="card anim-up" style={{ animationDelay: '.1s' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
            <Gift size={18} style={{ color: 'var(--danger)' }} /> Redeem Prizes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', fontSize: '.9rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              <span>Cashback Voucher (₹250)</span>
              <span style={{ color: 'var(--text-muted)' }}>2500 PTS</span>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              <span>Coffee Shop Discount</span>
              <span style={{ color: 'var(--text-muted)' }}>1000 PTS</span>
            </div>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              <span>Zero-fee Bank Transfer Ticket</span>
              <span style={{ color: 'var(--text-muted)' }}>500 PTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
