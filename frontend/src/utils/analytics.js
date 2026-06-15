// Analytics helpers — compute chart-ready data from raw transactions

export function groupByCategory(transactions) {
  const map = {};
  transactions.forEach(t => {
    if (!map[t.category]) {
      map[t.category] = { name: t.category, value: 0, icon: t.categoryIcon, color: t.categoryColor, count: 0 };
    }
    map[t.category].value += t.amount;
    map[t.category].count += 1;
  });
  return Object.values(map).sort((a, b) => b.value - a.value);
}

export function groupByDay(transactions, days = 30) {
  const map = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    map[key] = { date: key, amount: 0 };
  }
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    if (map[key]) map[key].amount += t.amount;
  });
  return Object.values(map);
}

export function groupByMonth(transactions) {
  const map = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    if (!map[key]) map[key] = { month: key, amount: 0 };
    map[key].amount += t.amount;
  });
  return Object.values(map);
}

export function computeHealthScore(transactions, budgets, goals) {
  if (transactions.length < 3) return null;

  let score = 50; // baseline

  // Has budgets (+10)
  if (budgets.length > 0) score += 10;

  // Has goals (+10)
  if (goals.length > 0) score += 10;

  // Transaction frequency (more tracking = better awareness) up to +15
  const freqBonus = Math.min(15, Math.floor(transactions.length / 2));
  score += freqBonus;

  // Budget adherence
  const now = new Date();
  const monthTotal = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);

  const monthlyBudget = budgets.find(b => b.type === 'Monthly');
  if (monthlyBudget) {
    const ratio = monthTotal / monthlyBudget.amount;
    if (ratio < 0.7) score += 15;
    else if (ratio < 0.9) score += 5;
    else if (ratio > 1) score -= 15;
  }

  // Goal progress bonus
  goals.forEach(g => {
    const pct = g.current / g.target;
    if (pct > 0.5) score += 5;
  });

  score = Math.max(0, Math.min(100, score));

  let level, levelClass;
  if (score < 40) { level = 'Poor'; levelClass = 'poor'; }
  else if (score < 60) { level = 'Average'; levelClass = 'average'; }
  else if (score < 80) { level = 'Good'; levelClass = 'good'; }
  else { level = 'Excellent'; levelClass = 'excellent'; }

  return { score, level, levelClass };
}

export function generateNotifications(transactions, budgets, goals) {
  const notifications = [];
  const now = new Date();

  const monthTotal = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);

  // Budget alerts
  budgets.forEach(b => {
    if (!b || !b.amount) return;
    const ratio = monthTotal / b.amount;
    const budgetType = b.type?.toLowerCase() || 'budget';
    if (ratio > 1) {
      notifications.push({
        id: `budget-exceeded-${b.id}`,
        type: 'danger',
        icon: '⚠️',
        title: `Budget Exceeded`,
        message: `You've exceeded your ${budgetType} budget of ₹${b.amount.toLocaleString()}.`,
        time: now.toISOString(),
      });
    } else if (ratio > 0.8) {
      notifications.push({
        id: `budget-warning-${b.id}`,
        type: 'warning',
        icon: '🔔',
        title: `Budget Alert`,
        message: `You've used ${(ratio * 100).toFixed(0)}% of your ${budgetType} budget.`,
        time: now.toISOString(),
      });
    }
  });

  // Goal completions
  goals.forEach(g => {
    if (!g || g.target == null || g.current == null) return;
    if (g.current >= g.target) {
      notifications.push({
        id: `goal-complete-${g.id}`,
        type: 'success',
        icon: '🎉',
        title: `Goal Achieved!`,
        message: `Congratulations! You've reached your "${g.name || 'Savings'}" goal of ₹${g.target.toLocaleString()}.`,
        time: now.toISOString(),
      });
    }
  });

  // Spending increased checker
  const lastMonthTotal = transactions
    .filter(t => {
      const d = new Date(t.date);
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);

  if (lastMonthTotal > 0 && monthTotal > lastMonthTotal) {
    const diff = monthTotal - lastMonthTotal;
    const pct = ((diff / lastMonthTotal) * 100).toFixed(0);
    notifications.push({
      id: `spending-increased-${now.getMonth()}`,
      type: 'warning',
      icon: '📈',
      title: 'Spending Increased',
      message: `Your spending this month is higher than last month by ${pct}% (+₹${diff.toLocaleString()}).`,
      time: now.toISOString(),
    });
  }

  return notifications;
}
