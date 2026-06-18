import { useApp } from '../context/AppContext';
import { Award, Lock, Sparkles } from 'lucide-react';

export default function Achievements() {
  const { transactions, goals } = useApp();

  const achievements = [
    {
      id: 1,
      title: 'Budget Master',
      desc: 'Stay within your allocated budget categories for an entire month.',
      unlocked: transactions.length > 5,
      icon: '🏆',
    },
    {
      id: 2,
      title: 'Super Saver',
      desc: 'Achieve at least one savings goal target.',
      unlocked: goals.some(g => g.current >= g.target),
      icon: '🐷',
    },
    {
      id: 3,
      title: 'Chat Enthusiast',
      desc: 'Talk with the AI Financial Advisor for insights.',
      unlocked: true,
      icon: '🤖',
    },
    {
      id: 4,
      title: 'Debt Crusher',
      desc: 'Completely pay off or track an EMI loan account.',
      unlocked: false,
      icon: '🛡️',
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Milestones & Badges</h2>
        <p>Unlock achievements and test your personal finance skills as you build habits.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card text-center" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>{unlockedCount} / {achievements.length}</div>
          <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>Unlocked Badges</div>
        </div>
      </div>

      <div className="grid-2">
        {achievements.map(a => (
          <div key={a.id} className="card anim-up" style={{ opacity: a.unlocked ? 1 : 0.6, borderLeft: a.unlocked ? '4px solid var(--emerald)' : '4px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2rem', padding: '.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                {a.unlocked ? a.icon : <Lock size={24} style={{ color: 'var(--text-muted)' }} />}
              </div>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  {a.title} {a.unlocked && <Sparkles size={14} style={{ color: 'var(--warning)' }} />}
                </h4>
                <p style={{ fontSize: '.875rem', marginTop: '.25rem' }}>{a.desc}</p>
                <div style={{ marginTop: '.5rem' }}>
                  <span className={`badge ${a.unlocked ? 'badge-emerald' : 'badge-muted'}`}>
                    {a.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
