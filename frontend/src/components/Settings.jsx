import { useApp } from '../context/AppContext';

const CURRENCIES = [
  { symbol: '₹', name: 'Indian Rupee (INR)' },
  { symbol: '$', name: 'US Dollar (USD)' },
  { symbol: '€', name: 'Euro (EUR)' },
  { symbol: '£', name: 'British Pound (GBP)' },
  { symbol: '¥', name: 'Japanese Yen (JPY)' },
  { symbol: '₩', name: 'South Korean Won (KRW)' },
];

function Toggle({ on, onToggle }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} type="button">
      <div className="toggle-knob"/>
    </button>
  );
}

export default function Settings() {
  const { darkMode, setDarkMode, currency, setCurrency, notifSettings, setNotifSettings } = useApp();

  function toggleNotif(key) {
    setNotifSettings(p => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Customize your Smart Budget experience.</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'1.5rem'}}>
        {/* Appearance */}
        <div className="card anim-up">
          <h4 style={{marginBottom:'1.25rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--border)'}}>🎨 Appearance</h4>
          <div className="settings-row">
            <div>
              <div style={{fontWeight:500}}>Dark Mode</div>
              <div style={{fontSize:'.8125rem', color:'var(--text-muted)'}}>Switch to a dark colour scheme</div>
            </div>
            <Toggle on={darkMode} onToggle={() => setDarkMode(d => !d)}/>
          </div>
        </div>

        {/* Currency */}
        <div className="card anim-up" style={{animationDelay:'.08s'}}>
          <h4 style={{marginBottom:'1.25rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--border)'}}>💱 Currency</h4>
          <div className="input-group">
            <label className="label">Display Currency</label>
            <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c.symbol} value={c.symbol}>{c.symbol} — {c.name}</option>
              ))}
            </select>
          </div>
          <p style={{fontSize:'.8125rem', color:'var(--text-muted)', marginTop:'.75rem'}}>
            Changing currency updates the display symbol only. Your stored amounts remain the same.
          </p>
        </div>

        {/* Notifications */}
        <div className="card anim-up" style={{animationDelay:'.12s'}}>
          <h4 style={{marginBottom:'1.25rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--border)'}}>🔔 Notifications</h4>
          {[
            { key: 'budget', label: 'Budget Alerts', desc: 'Notify when spending approaches or exceeds budget' },
            { key: 'goals', label: 'Goal Updates', desc: 'Notify when a savings goal is completed' },
            { key: 'weekly', label: 'Weekly Summary', desc: 'Receive a weekly spending overview' },
          ].map(({ key, label, desc }) => (
            <div className="settings-row" key={key}>
              <div>
                <div style={{fontWeight:500}}>{label}</div>
                <div style={{fontSize:'.8125rem', color:'var(--text-muted)'}}>{desc}</div>
              </div>
              <Toggle on={notifSettings[key]} onToggle={() => toggleNotif(key)}/>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="card anim-up" style={{animationDelay:'.16s'}}>
          <h4 style={{marginBottom:'1.25rem', paddingBottom:'.75rem', borderBottom:'1px solid var(--border)'}}>ℹ️ About</h4>
          <div style={{display:'flex', flexDirection:'column', gap:'.625rem'}}>
            {[
              ['Version', '2.0.0'],
              ['Built with', 'React + Vite'],
              ['AI Engine', 'Client-side NLP'],
              ['Storage', 'localStorage (private)'],
            ].map(([k, v]) => (
              <div key={k} className="flex-between" style={{fontSize:'.875rem'}}>
                <span style={{color:'var(--text-muted)'}}>{k}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
