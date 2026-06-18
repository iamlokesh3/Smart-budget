import { 
  Zap, LayoutDashboard, PenLine, Wallet, Target, BarChart3, FileText, Bell, User, Settings, Heart, MessageSquare, LogOut, X,
  Calculator, ArrowRightLeft, Percent, Landmark, RefreshCw, FolderOpen, ShieldAlert, DollarSign, TrendingUp, TrendingDown,
  Calendar, Compass, Search, Download, Award, Sparkles, CreditCard, HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  // Main Section
  { id: 'dashboard',    label: 'Dashboard',     icon: <LayoutDashboard size={18}/>, section: 'main' },
  { id: 'entries',      label: 'Smart Entries',  icon: <PenLine size={18}/>,        section: 'main' },
  { id: 'chatbot',      label: 'AI Advisor',     icon: <MessageSquare size={18}/>,  section: 'main' },

  // Finance Section
  { id: 'budgets',      label: 'Budgets',        icon: <Wallet size={18}/>,         section: 'finance' },
  { id: 'goals',        label: 'Goals',          icon: <Target size={18}/>,         section: 'finance' },
  { id: 'savingsgoals',  label: 'Savings Goals', icon: <Target size={18}/>,         section: 'finance' },
  { id: 'analytics',     label: 'Analytics',     icon: <BarChart3 size={18}/>,      section: 'finance' },
  { id: 'health',       label: 'Health Score',   icon: <Heart size={18}/>,          section: 'finance' },

  // Trackers Section
  { id: 'income',       label: 'Income Tracker', icon: <DollarSign size={18}/>,     section: 'trackers' },
  { id: 'debt',         label: 'Debt Tracker',   icon: <TrendingDown size={18}/>,   section: 'trackers' },
  { id: 'investments',  label: 'Investments',    icon: <TrendingUp size={18}/>,     section: 'trackers' },
  { id: 'networth',     label: 'Net Worth',      icon: <Landmark size={18}/>,       section: 'trackers' },
  { id: 'cashflow',     label: 'Cash Flow',      icon: <RefreshCw size={18}/>,      section: 'trackers' },

  // Tools Section
  { id: 'emicalculator', label: 'EMI Calculator',icon: <Calculator size={18}/>,     section: 'tools' },
  { id: 'currencyconverter', label: 'Currency',  icon: <ArrowRightLeft size={18}/>, section: 'tools' },
  { id: 'taxestimator', label: 'Tax Estimator',  icon: <Percent size={18}/>,        section: 'tools' },
  { id: 'budgetvsactual', label: 'Budget vs Actual', icon: <BarChart3 size={18}/>,  section: 'tools' },

  // Management Section
  { id: 'billreminders', label: 'Bill Reminders',icon: <Bell size={18}/>,           section: 'management' },
  { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={18}/>,     section: 'management' },
  { id: 'recurring',     label: 'Recurring Tx',  icon: <RefreshCw size={18}/>,      section: 'management' },
  { id: 'categories',    label: 'Categories',    icon: <FolderOpen size={18}/>,     section: 'management' },
  { id: 'limits',        label: 'Limits & Alerts', icon: <ShieldAlert size={18}/>,  section: 'management' },

  // Planning Section
  { id: 'calendar',      label: 'Calendar',      icon: <Calendar size={18}/>,       section: 'planning' },
  { id: 'travel',        label: 'Travel Budget', icon: <Compass size={18}/>,        section: 'planning' },
  { id: 'wishlist',      label: 'Wishlist',      icon: <Heart size={18}/>,          section: 'planning' },
  { id: 'family',        label: 'Family Budget', icon: <User size={18}/>,           section: 'planning' },

  // Insights Section
  { id: 'transactions',  label: 'Transactions',  icon: <FileText size={18}/>,       section: 'insights' },
  { id: 'search',        label: 'Search Ledger', icon: <Search size={18}/>,         section: 'insights' },
  { id: 'reports',      label: 'Reports',        icon: <FileText size={18}/>,       section: 'insights' },
  { id: 'export',        label: 'Export Data',   icon: <Download size={18}/>,       section: 'insights' },
  { id: 'rewards',       label: 'Rewards & Pts', icon: <Award size={18}/>,          section: 'insights' },
  { id: 'achievements',  label: 'Achievements',  icon: <Sparkles size={18}/>,       section: 'insights' },

  // Account Section
  { id: 'bankaccounts',  label: 'Bank Accounts', icon: <Landmark size={18}/>,       section: 'account' },
  { id: 'cards',         label: 'Card Manager',  icon: <CreditCard size={18}/>,     section: 'account' },
  { id: 'profile',      label: 'Profile',        icon: <User size={18}/>,           section: 'account' },
  { id: 'settings',     label: 'Settings',       icon: <Settings size={18}/>,       section: 'account' },

  // Support Section
  { id: 'notifications',label: 'Notifications',  icon: <Bell size={18}/>,           section: 'support' },
  { id: 'helpsupport',  label: 'Help & Support', icon: <HelpCircle size={18}/>,     section: 'support' },
];

const sectionLabels = { 
  main: 'Main', 
  finance: 'Finance', 
  trackers: 'Trackers', 
  tools: 'Tools', 
  management: 'Management', 
  planning: 'Planning', 
  insights: 'Insights', 
  account: 'Account', 
  support: 'Support' 
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { page, setPage, user, logout, notifications } = useApp();

  const sections = ['main', 'finance', 'trackers', 'tools', 'management', 'planning', 'insights', 'account', 'support'];

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
