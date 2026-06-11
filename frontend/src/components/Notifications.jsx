import { useApp } from '../context/AppContext';

export default function Notifications() {
  const { notifications } = useApp();

  const typeStyle = {
    danger:  { bg: '#fef2f2', border: '#fecaca', icon_bg: '#fee2e2', color: '#b91c1c' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon_bg: '#fef3c7', color: '#b45309' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', icon_bg: '#d1fae5', color: '#065f46' },
  };

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Notifications</h2>
        <p>Alerts and updates based on your spending behaviour.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state card">
          <div style={{fontSize:'3rem'}}>🔔</div>
          <h3>No notifications available.</h3>
          <p>Alerts are generated automatically based on your spending — budget overruns, goal completions, and spending increases will appear here.</p>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'.875rem'}}>
          {notifications.map((n, i) => {
            const s = typeStyle[n.type] || typeStyle.warning;
            return (
              <div key={n.id} className="notif-item anim-up" style={{animationDelay:`${i*.07}s`, background: s.bg, border:`1px solid ${s.border}`}}>
                <div className="notif-icon" style={{background: s.icon_bg, fontSize:'1.25rem', color: s.color}}>
                  {n.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600, fontSize:'.9375rem', color: s.color}}>{n.title}</div>
                  <p style={{fontSize:'.875rem', color:'var(--text-secondary)', marginTop:'.2rem'}}>{n.message}</p>
                </div>
                <div style={{fontSize:'.75rem', color:'var(--text-muted)', whiteSpace:'nowrap'}}>
                  {new Date(n.time).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips about notifications */}
      <div className="card anim-up" style={{marginTop:'1.5rem', background:'var(--blue-light)', border:'1px solid rgba(59,130,246,.2)'}}>
        <h4 style={{marginBottom:'.5rem', color:'var(--blue)'}}>How notifications work</h4>
        <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:'.5rem'}}>
          {[
            ['⚠️', 'Budget Exceeded — when spending surpasses a budget limit'],
            ['🔔', 'Budget Alert — when 80%+ of a budget is used'],
            ['🎉', 'Goal Achieved — when a savings goal is completed'],
          ].map(([icon, text], i) => (
            <li key={i} style={{fontSize:'.875rem', color:'var(--text-secondary)', display:'flex', gap:'.5rem'}}>
              <span>{icon}</span>{text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
