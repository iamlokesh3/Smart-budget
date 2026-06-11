import { useApp } from '../context/AppContext';
import { computeHealthScore } from '../utils/analytics';

const levelInfo = {
  poor:      { emoji: '😟', desc: 'Your finances need significant attention. Focus on budgeting and reducing unnecessary spending.', color: 'var(--danger)' },
  average:   { emoji: '😐', desc: 'You\'re on track but there\'s room to improve. Try setting budgets and saving goals.', color: 'var(--warning)' },
  good:      { emoji: '😊', desc: 'Great financial habits! Keep up the budgeting and work towards your goals.', color: 'var(--emerald)' },
  excellent: { emoji: '🌟', desc: 'Outstanding financial health! You\'re on top of your spending, budgets, and savings goals.', color: 'var(--blue)' },
};

function ScoreRing({ score, color }) {
  const r = 70, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={180} height={180} style={{transform:'rotate(-90deg)'}}>
      <circle cx={90} cy={90} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth={12}/>
      <circle cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={12}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:'stroke-dasharray .8s cubic-bezier(.4,0,.2,1)'}}/>
      <text x={90} y={95} textAnchor="middle" style={{fill:'var(--text-primary)', fontSize:'2rem', fontWeight:800, fontFamily:'Inter,sans-serif', transform:'rotate(90deg)', transformOrigin:'90px 90px'}}>
        {score}
      </text>
    </svg>
  );
}

export default function HealthScore() {
  const { transactions, budgets, goals } = useApp();
  const result = computeHealthScore(transactions, budgets, goals);

  if (!result) {
    return (
      <div className="page-content anim-fade">
        <div className="page-header">
          <h2>Financial Health Score</h2>
          <p>A dynamic score computed from your real financial data.</p>
        </div>
        <div className="empty-state card">
          <div style={{fontSize:'3rem'}}>💪</div>
          <h3>Score not available yet</h3>
          <p>Add at least 3 transactions to unlock your financial health score. The score considers your spending habits, budgets, and goals.</p>
        </div>
        <div className="card anim-up" style={{marginTop:'1.5rem', animationDelay:'.1s'}}>
          <h4 style={{marginBottom:'1rem'}}>How the score is calculated</h4>
          <div style={{display:'flex', flexDirection:'column', gap:'.75rem'}}>
            {[
              ['📝', 'Transaction tracking — the more you track, the better'],
              ['📋', 'Budget creation and adherence'],
              ['🎯', 'Savings goals and progress'],
              ['📉', 'Budget overruns reduce your score'],
            ].map(([icon, text], i) => (
              <div key={i} style={{display:'flex', gap:'.75rem', alignItems:'center', fontSize:'.9375rem'}}>
                <span style={{fontSize:'1.1rem'}}>{icon}</span>
                <span style={{color:'var(--text-secondary)'}}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const info = levelInfo[result.levelClass];

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Financial Health Score</h2>
        <p>Computed from your real transactions, budgets, and goals.</p>
      </div>

      <div className="card anim-up" style={{textAlign:'center', marginBottom:'1.5rem', padding:'2.5rem'}}>
        <div className="score-ring-wrap">
          <ScoreRing score={result.score} color={info.color}/>
        </div>
        <div style={{marginBottom:'1rem'}}>
          <span style={{fontSize:'2rem', marginRight:'.5rem'}}>{info.emoji}</span>
          <span className={`score-level ${result.levelClass}`}>{result.level}</span>
        </div>
        <p style={{maxWidth:420, margin:'0 auto', fontSize:'1rem'}}>{info.desc}</p>
      </div>

      {/* Score factors */}
      <div className="card anim-up" style={{animationDelay:'.1s'}}>
        <h4 style={{marginBottom:'1rem'}}>Score Factors</h4>
        <div style={{display:'flex', flexDirection:'column', gap:'.875rem'}}>
          {[
            { label: 'Transaction Tracking', value: Math.min(15, Math.floor(transactions.length / 2)), max: 15, icon: '📝' },
            { label: 'Budget Setup', value: budgets.length > 0 ? 10 : 0, max: 10, icon: '📋' },
            { label: 'Goals Created', value: goals.length > 0 ? 10 : 0, max: 10, icon: '🎯' },
            { label: 'Budget Adherence', value: result.score > 60 ? 15 : result.score > 40 ? 5 : 0, max: 15, icon: '✅' },
          ].map((f, i) => (
            <div key={i}>
              <div className="flex-between" style={{marginBottom:'.35rem'}}>
                <span style={{display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.9rem'}}>
                  <span>{f.icon}</span>{f.label}
                </span>
                <span style={{fontWeight:700, fontSize:'.9rem'}}>{f.value}/{f.max}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{width:`${(f.value/f.max*100)}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement tips */}
      <div className="card anim-up" style={{marginTop:'1.5rem', animationDelay:'.15s', background:'var(--blue-light)', border:'1.5px solid rgba(59,130,246,.2)'}}>
        <h4 style={{color:'var(--blue)', marginBottom:'.875rem'}}>💡 How to improve your score</h4>
        <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:'.625rem'}}>
          {[
            !budgets.length && '📋 Create a monthly budget to track your limits',
            !goals.length && '🎯 Add a savings goal to boost your score',
            transactions.length < 10 && '📝 Track more transactions for better accuracy',
            '🤖 Ask the AI advisor for personalized savings tips',
          ].filter(Boolean).map((tip, i) => (
            <li key={i} style={{fontSize:'.9rem', color:'var(--text-secondary)', display:'flex', gap:'.5rem'}}>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
