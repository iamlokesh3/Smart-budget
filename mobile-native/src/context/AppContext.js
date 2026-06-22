import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { generateNotifications } from '../utils/analytics';

const AppContext = createContext(null);

// Dynamic API Endpoint setup
// LOCAL_API_URL: Use the host PC's current Wi-Fi IP so physical devices on the same network can reach the backend.
// REMOTE_API_URL: Deployed backend on Render (always reachable).
const LOCAL_API_URL = 'http://10.229.86.229:5000/api';
const REMOTE_API_URL = 'https://smart-budget-2-brfw.onrender.com/api';

// Use Remote API as primary (always reachable); failover to local for dev/testing.
const API_URL = REMOTE_API_URL;
const FALLBACK_API_URL = LOCAL_API_URL;

// Fetch with a timeout to prevent indefinite hangs on unreachable hosts
function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('₹');
  const [notifSettings, setNotifSettings] = useState({ budget: true, goals: true, weekly: true });
  const [page, setPage] = useState('landing');
  const [chatOpen, setChatOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Derived: notifications from spending data
  const notifications = generateNotifications(transactions, budgets, goals);

  const fetchWithAuth = async (url, options = {}) => {
    if (!user) return null;
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': user.id,
      ...options.headers,
    };
    try {
      const res = await fetchWithTimeout(`${API_URL}${url}`, { ...options, headers });
      return res.json();
    } catch (err) {
      console.warn(`Primary API failed for ${url}: ${err.message}. Trying fallback...`);
      try {
        const res = await fetchWithTimeout(`${FALLBACK_API_URL}${url}`, { ...options, headers });
        return res.json();
      } catch (fallbackErr) {
        console.error(`Fallback API also failed for ${url}: ${fallbackErr.message}`);
        return null;
      }
    }
  };

  const loadUserData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [txs, bdgts, gls] = await Promise.all([
        fetchWithAuth('/transactions'),
        fetchWithAuth('/budgets'),
        fetchWithAuth('/goals')
      ]);
      setTransactions(txs || []);
      setBudgets(bdgts || []);
      setGoals(gls || []);
    } catch (err) {
      console.error('Failed to load user data', err);
    }
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (user) loadUserData();
  }, [user, loadUserData]);

  // Auth Functions
  const login = useCallback(async (userData, isRegister = false) => {
    try {
      const targetUrl = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? userData : { email: userData.email };
      
      let res;
      const fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      };
      try {
        res = await fetchWithTimeout(`${API_URL}${targetUrl}`, fetchOpts);
      } catch (e) {
        console.warn('Primary auth failed, trying fallback...', e.message);
        res = await fetchWithTimeout(`${FALLBACK_API_URL}${targetUrl}`, fetchOpts);
      }

      if (!res.ok) throw new Error('Authentication failed');
      const data = await res.json();
      
      setUser(isRegister ? userData : data);
      setPage('dashboard');
    } catch (err) {
      console.error('Login error', err);
      throw err;
    }
  }, []);

  const loginExisting = useCallback(async (email) => {
    try {
      let res;
      const fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      };
      try {
        res = await fetchWithTimeout(`${API_URL}/auth/login`, fetchOpts);
      } catch (e) {
        console.warn('Primary login failed, trying fallback...', e.message);
        res = await fetchWithTimeout(`${FALLBACK_API_URL}/auth/login`, fetchOpts);
      }

      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      setUser(data);
      setPage('dashboard');
    } catch (err) {
      console.error('Existing login error', err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setChatHistory([]);
    setPage('landing');
  }, []);

  // Transactions Functions
  const addTransaction = useCallback(async (tx) => {
    setTransactions(prev => [tx, ...prev]);
    await fetchWithAuth('/transactions', { method: 'POST', body: JSON.stringify(tx) });
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await fetchWithAuth(`/transactions/${id}`, { method: 'DELETE' });
  }, [user]);

  const updateTransaction = useCallback(async (id, updates) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await fetchWithAuth(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  }, [user]);

  const renameCategory = useCallback(async (oldCategory, newCategory, categoryIcon, categoryColor) => {
    setTransactions(prev => prev.map(t => {
      if (t.category === oldCategory) {
        return {
          ...t,
          category: newCategory,
          categoryIcon: categoryIcon || t.categoryIcon,
          categoryColor: categoryColor || t.categoryColor
        };
      }
      return t;
    }));
    await fetchWithAuth('/transactions/rename-category', {
      method: 'PUT',
      body: JSON.stringify({ oldCategory, newCategory, categoryIcon, categoryColor })
    });
  }, [user]);

  // Budgets Functions
  const addBudget = useCallback(async (budget) => {
    setBudgets(prev => {
      const existing = prev.findIndex(b => b.type === budget.type);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = budget;
        return updated;
      }
      return [...prev, budget];
    });
    await fetchWithAuth('/budgets', { method: 'POST', body: JSON.stringify(budget) });
  }, [user]);

  const deleteBudget = useCallback(async (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    await fetchWithAuth(`/budgets/${id}`, { method: 'DELETE' });
  }, [user]);

  // Goals Functions
  const addGoal = useCallback(async (goal) => {
    setGoals(prev => [...prev, goal]);
    await fetchWithAuth('/goals', { method: 'POST', body: JSON.stringify(goal) });
  }, [user]);

  const updateGoal = useCallback(async (id, updates) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    await fetchWithAuth(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
  }, [user]);

  const deleteGoal = useCallback(async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await fetchWithAuth(`/goals/${id}`, { method: 'DELETE' });
  }, [user]);

  // Chat Functions
  const addChatMessage = useCallback((msg) => {
    setChatHistory(prev => [...prev, msg]);
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, loginExisting, logout,
      transactions, addTransaction, deleteTransaction, updateTransaction, renameCategory,
      budgets, addBudget, deleteBudget,
      goals, addGoal, updateGoal, deleteGoal,
      chatHistory, addChatMessage, clearChat,
      notifications,
      darkMode, setDarkMode,
      currency, setCurrency,
      notifSettings, setNotifSettings,
      page, setPage,
      chatOpen, setChatOpen,
      loadingData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
