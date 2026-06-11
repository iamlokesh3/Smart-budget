import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';

import Landing      from './components/Landing';
import Auth         from './components/Auth';
import Sidebar      from './components/Sidebar';
import Topbar       from './components/Topbar';
import Dashboard    from './components/Dashboard';
import SmartEntry   from './components/SmartEntry';
import BudgetPlanner from './components/BudgetPlanner';
import Goals        from './components/Goals';
import Analytics    from './components/Analytics';
import Chatbot, { ChatFAB } from './components/Chatbot';
import Notifications from './components/Notifications';
import Reports      from './components/Reports';
import HealthScore  from './components/HealthScore';
import Profile      from './components/Profile';
import Settings     from './components/Settings';

import './index.css';

function AppShell() {
  const { user, page } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Public pages (no auth required)
  if (!user) {
    if (page === 'auth') return <Auth/>;
    return <Landing/>;
  }

  // Authenticated app shell
  const pageMap = {
    dashboard:     <Dashboard/>,
    entries:       <SmartEntry/>,
    chatbot:       <Chatbot/>,
    budgets:       <BudgetPlanner/>,
    goals:         <Goals/>,
    analytics:     <Analytics/>,
    health:        <HealthScore/>,
    reports:       <Reports/>,
    notifications: <Notifications/>,
    profile:       <Profile/>,
    settings:      <Settings/>,
  };

  const currentPage = pageMap[page] || <Dashboard/>;

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/>

      <div className="main-content">
        <Topbar onMenuClick={() => setMobileOpen(o => !o)}/>
        {/* Full page chat has its own layout */}
        {page === 'chatbot'
          ? currentPage
          : <div style={{flex:1, overflowY:'auto'}}>{currentPage}</div>
        }
      </div>

      {/* Floating chatbot (not on the chatbot page itself) */}
      {page !== 'chatbot' && <ChatFAB/>}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell/>
    </AppProvider>
  );
}
