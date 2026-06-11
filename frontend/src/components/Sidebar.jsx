import { Zap, LayoutDashboard, PenLine, Wallet, Target, BarChart3, FileText, Bell, User, Settings, Heart, MessageSquare, LogOut, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',     icon: <LayoutDashboard size={18}/>, section: 'main' },
  { id: 'entries',      label: 'Smart Entries',  icon: <PenLine size={18}/>,        section: 'main' },
  { id: 'chatbot',      label: 'AI Advisor',     icon: <MessageSquare size={18}/>,  section: 'main' },
  { id: 'budgets',      label: 'Budgets',        icon: <Wallet size={18}/>,         section: 'finance' },
  { id: 'goals',        label: 'Goals',          icon: <Target size={18}/>,         section: 'finance' },
  { id: 'analytics',   label: 'Analytics',      icon: <BarChart3 size={18}/>,      section: 'finance' },
  { id: 'health',       label: 'Health Score',   icon: <Heart size={18}/>,          section: 'finance' },
  { id: 'reports',      label: 'Reports',        icon: <FileText size={18}/>,       section: 'insights' },
  { id: 'notifications',label: 'Notifications',  icon: <Bell size={18}/>,           section: 'insights' },
  { id: 'profile',      label: 'Profile',        icon: <User size={18}/>,           section: 'account' },
  { id: 'settings',     label: 'Settings',       icon: <Settings size={18}/>,       section: 'account' },
];

const sectionLabels = { main: 'Main', finance: 'Finance', insights: 'Insights', account: 'Account' };

export default function Sidebar({ mobileOpen, onClose }) {
  const { page, setPage, user, logout, notifications } = useApp();

  const sections = ['main', 'finance', 'insights', 'account'];

  function navigate(id) {
    setPage(id);
    onClose?.();
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{position:'fixed', inset:0, background:'var(--overlay)', zIndex:99}} onClick={onClose}/>
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Zap size={15}/></div>
          <span className="sidebar-logo-text">Smart<span>Budget</span></span>
          <button className="btn-icon" style={{marginLeft:'auto', display:'none'}} onClick={onClose} id="sidebar-close">
            <X size={16}/>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {sections.map(sec => {
            const items = navItems.filter(n => n.section === sec);
            return (
              <div key={sec}>
                <div className="nav-section-label">{sectionLabels[sec]}</div>
                {items.map(item => (
                  <button
                    key={item.id}
                    className={`nav-item ${page === item.id ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                  >
                    {item.icon}
                    {item.label}
                    {item.id === 'notifications' && notifications.length > 0 && (
                      <span style={{marginLeft:'auto', background:'var(--danger)', color:'#fff', borderRadius:'99px', fontSize:'.7rem', fontWeight:700, padding:'.1rem .45rem', minWidth:18, textAlign:'center'}}>
                        {notifications.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {user && (
            <div style={{display:'flex', alignItems:'center', gap:'.75rem', padding:'.5rem 0'}}>
              <div className="avatar" style={{width:'2rem', height:'2rem', fontSize:'.75rem', flexShrink:0}}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:'.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user.name}</div>
                <div style={{fontSize:'.75rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user.email}</div>
              </div>
              <button className="btn-icon" onClick={logout} title="Logout" style={{flexShrink:0}}>
                <LogOut size={15}/>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
