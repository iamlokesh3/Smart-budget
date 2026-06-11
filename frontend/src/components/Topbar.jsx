import { Bell, Moon, Sun, Menu, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const pageTitles = {
  dashboard: 'Dashboard', entries: 'Smart Entries', chatbot: 'AI Advisor',
  budgets: 'Budget Planner', goals: 'Savings Goals', analytics: 'Analytics',
  health: 'Financial Health', reports: 'Reports', notifications: 'Notifications',
  profile: 'Profile', settings: 'Settings',
};

export default function Topbar({ onMenuClick }) {
  const { user, page, darkMode, setDarkMode, notifications, setPage } = useApp();

  return (
    <header className="topbar">
      <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
        <button className="btn-icon" onClick={onMenuClick} style={{display:'none'}} id="topbar-menu-btn">
          <Menu size={18}/>
        </button>
        <span className="topbar-title">{pageTitles[page] || 'Dashboard'}</span>
      </div>

      <div className="topbar-actions">
        <button
          className="btn-icon"
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={17}/> : <Moon size={17}/>}
        </button>

        <button
          className="btn-icon"
          style={{position:'relative'}}
          onClick={() => setPage('notifications')}
          title="Notifications"
        >
          <Bell size={17}/>
          {notifications.length > 0 && (
            <span style={{
              position:'absolute', top:1, right:1,
              width:8, height:8, borderRadius:'50%',
              background:'var(--danger)',
              border:'1.5px solid var(--bg-card)',
            }}/>
          )}
        </button>

        {user && (
          <div
            className="avatar"
            onClick={() => setPage('profile')}
            title={user.name}
            style={{cursor:'pointer'}}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #topbar-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
