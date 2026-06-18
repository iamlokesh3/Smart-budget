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

// New Screens (27)
import Transactions         from './components/Transactions';
import SavingsGoals         from './components/SavingsGoals';
import EmiCalculator        from './components/EmiCalculator';
import CurrencyConverter    from './components/CurrencyConverter';
import TaxEstimator         from './components/TaxEstimator';
import BudgetVsActual       from './components/BudgetVsActual';
import BillReminders        from './components/BillReminders';
import SubscriptionManager  from './components/SubscriptionManager';
import RecurringTransactions from './components/RecurringTransactions';
import CategoryManager      from './components/CategoryManager';
import SpendingLimits       from './components/SpendingLimits';
import IncomeTracker        from './components/IncomeTracker';
import DebtTracker          from './components/DebtTracker';
import InvestmentTracker    from './components/InvestmentTracker';
import NetWorth             from './components/NetWorth';
import CashFlow             from './components/CashFlow';
import FinancialCalendar    from './components/FinancialCalendar';
import TravelBudget         from './components/TravelBudget';
import WishlistTracker      from './components/WishlistTracker';
import FamilyBudget         from './components/FamilyBudget';
import SearchTransactions   from './components/SearchTransactions';
import ExportData           from './components/ExportData';
import Rewards              from './components/Rewards';
import Achievements         from './components/Achievements';
import BankAccounts         from './components/BankAccounts';
import CardManager          from './components/CardManager';
import HelpSupport          from './components/HelpSupport';

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

    // 27 new page routes
    transactions:   <Transactions/>,
    savingsgoals:   <SavingsGoals/>,
    emicalculator:  <EmiCalculator/>,
    currencyconverter: <CurrencyConverter/>,
    taxestimator:   <TaxEstimator/>,
    budgetvsactual: <BudgetVsActual/>,
    billreminders:  <BillReminders/>,
    subscriptions:  <SubscriptionManager/>,
    recurring:      <RecurringTransactions/>,
    categories:     <CategoryManager/>,
    limits:         <SpendingLimits/>,
    income:         <IncomeTracker/>,
    debt:           <DebtTracker/>,
    investments:    <InvestmentTracker/>,
    networth:       <NetWorth/>,
    cashflow:       <CashFlow/>,
    calendar:       <FinancialCalendar/>,
    travel:         <TravelBudget/>,
    wishlist:       <WishlistTracker/>,
    family:         <FamilyBudget/>,
    search:         <SearchTransactions/>,
    export:         <ExportData/>,
    rewards:        <Rewards/>,
    achievements:   <Achievements/>,
    bankaccounts:   <BankAccounts/>,
    cards:          <CardManager/>,
    helpsupport:    <HelpSupport/>,
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
