import { useApp } from '../context/AppContext';

const actionCards = [
  { id: 'entries',  icon: '✍️', color: '#eff6ff', border: '#3b82f6', title: 'Add Entry', desc: 'Record a transaction naturally', page: 'entries' },
  { id: 'chatbot', icon: '🤖', color: '#ecfdf5', border: '#10b981', title: 'Ask AI Advisor', desc: 'Get personalized financial guidance', page: 'chatbot' },
  { id: 'budgets', icon: '📋', color: '#f3e8ff', border: '#8b5cf6', title: 'Create Budget', desc: 'Set daily, weekly, or monthly limits', page: 'budgets' },
  { id: 'goals',   icon: '🎯', color: '#fff7ed', border: '#f97316', title: 'Create Goal', desc: 'Save towards something special', page: 'goals' },
];

export default function Dashboard() {
  const { user, setPage, transactions } = useApp();
  const userName = user?.name || 'User';

  return (
    <div className="page-content anim-fade" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(80vh - 64px)' }}>
      {/* Welcome hero */}
      <div className="welcome-hero" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem', animation: 'float 4s ease-in-out infinite' }}>✨</div>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Welcome, <span style={{ background: 'linear-gradient(135deg, var(--blue), var(--emerald))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{userName}</span>
        </h2>
        <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {transactions.length === 0
            ? 'You have not added any financial information yet. Start by recording your first transaction or chatting with your AI advisor.'
            : `You have successfully started building your financial ecosystem with ${transactions.length} entries. Keep recording or chat with your AI advisor.`
          }
        </p>
      </div>

      {/* Action cards */}
      <div className="action-grid" style={{ maxWidth: '900px', margin: '0 auto w-full', width: '100%' }}>
        {actionCards.map((card, i) => (
          <div
            key={card.id}
            className="action-card anim-up card-interactive"
            style={{
              animationDelay: `${i * 0.08}s`,
              border: `1.5px solid var(--border)`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-lg)'
            }}
            onClick={() => setPage(card.page)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = card.border;
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 10px 25px -5px ${card.border}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div className="action-card-icon" style={{ background: card.color, fontSize: '2.25rem', width: '4.5rem', height: '4.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifycontent: 'center', marginBottom: '1.25rem' }}>
              {card.icon}
            </div>
            {card.id === 'entries' && <h4 style={{ display: 'none' }}>Smart Entries</h4>}
            <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>{card.title}</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
