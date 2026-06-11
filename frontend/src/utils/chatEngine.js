// Client-side AI chat response engine
// Generates personalized, data-driven responses based on user's financial data

function fmt(amount, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function getCurrentMonthTotal(transactions) {
  const now = new Date();
  return transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

function getLastMonthTotal(transactions) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

function getCategoryBreakdown(transactions) {
  const map = {};
  transactions.forEach(t => {
    if (!map[t.category]) map[t.category] = { total: 0, icon: t.categoryIcon, count: 0 };
    map[t.category].total += t.amount;
    map[t.category].count += 1;
  });
  return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
}

function getTopCategory(transactions) {
  const breakdown = getCategoryBreakdown(transactions);
  return breakdown[0] || null;
}

export function generateResponse(userMessage, { transactions, budgets, goals, user }) {
  const msg = userMessage.toLowerCase().trim();
  const currency = '₹';
  const name = user?.name?.split(' ')[0] || 'there';
  const monthTotal = getCurrentMonthTotal(transactions);
  const lastMonthTotal = getLastMonthTotal(transactions);
  const hasData = transactions.length > 0;

  // Greetings
  if (/^(hi|hello|hey|good\s*(morning|evening|afternoon)|howdy)/i.test(msg)) {
    return `Hello ${name}! 👋 I'm your Smart Budget AI advisor. ${hasData ? `You've spent **${fmt(monthTotal, currency)}** this month so far.` : `You haven't added any transactions yet. Start by typing a natural entry like *"Spent ₹300 on pizza"*.`} How can I help you today?`;
  }

  // Current month spending
  if (/(how much|total|spent|spend).*(this month|month|monthly)/i.test(msg)) {
    if (!hasData) return `You haven't recorded any transactions yet, ${name}. Add your first entry using the Smart Entry feature, and I'll give you detailed insights!`;
    const change = lastMonthTotal > 0 ? ((monthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : null;
    const changeText = change ? (parseFloat(change) > 0 ? ` That's **${change}% more** than last month.` : ` That's **${Math.abs(parseFloat(change))}% less** than last month — great job!`) : '';
    const top = getTopCategory(transactions);
    return `This month you've spent **${fmt(monthTotal, currency)}**.${changeText}${top ? `\n\nYour biggest spending category is **${top[0]}** (${top[1].icon}) at **${fmt(top[1].total, currency)}**.` : ''}\n\nWould you like a detailed category breakdown?`;
  }

  // Overspending check
  if (/(overspend|over budget|budget exceeded|too much|spending too)/i.test(msg)) {
    if (!hasData) return `I don't have any spending data yet to analyze. Add some transactions first!`;
    const activeBudgets = budgets.filter(b => b.amount > 0);
    if (activeBudgets.length === 0) return `You haven't set any budgets yet, ${name}. Create a budget in the Budget section and I'll monitor your spending against it!`;
    const exceeded = activeBudgets.filter(b => monthTotal > b.amount);
    if (exceeded.length > 0) {
      return `⚠️ Yes, it looks like you've exceeded your budget. You've spent **${fmt(monthTotal, currency)}** this month. I'd recommend reviewing your spending in the Analytics section.`;
    }
    return `✅ You're within budget! You've spent **${fmt(monthTotal, currency)}** this month. Keep up the great work, ${name}!`;
  }

  // Financial summary
  if (/(summary|overview|report|financial|status|how.*doing)/i.test(msg)) {
    if (!hasData) return `No financial data yet, ${name}. Start adding transactions and I'll build you a complete financial picture!`;
    const breakdown = getCategoryBreakdown(transactions);
    const top3 = breakdown.slice(0, 3);
    const goalCount = goals.length;
    let resp = `📊 **Your Financial Summary**\n\n**This Month:** ${fmt(monthTotal, currency)}\n**Last Month:** ${lastMonthTotal > 0 ? fmt(lastMonthTotal, currency) : 'No data'}\n\n**Top Categories:**\n`;
    top3.forEach(([cat, data]) => { resp += `• ${data.icon} ${cat}: ${fmt(data.total, currency)}\n`; });
    if (goalCount > 0) resp += `\n**Active Goals:** ${goalCount} goal${goalCount > 1 ? 's' : ''} in progress.`;
    return resp;
  }

  // Can I afford
  if (/(afford|can i buy|should i buy|worth it)/i.test(msg)) {
    if (!hasData) return `I need some financial data before I can advise on purchases. Add your transactions first!`;
    const numberMatch = msg.match(/\d+(?:,\d{3})*(?:\.\d+)?/);
    const price = numberMatch ? parseFloat(numberMatch[0].replace(/,/g, '')) : null;
    if (price) {
      const canAfford = monthTotal < price * 3;
      return canAfford
        ? `Based on your spending of **${fmt(monthTotal, currency)}** this month, **${fmt(price, currency)}** seems manageable if it fits within your monthly budget. I recommend setting a savings goal for it first! 💡`
        : `You've already spent **${fmt(monthTotal, currency)}** this month. A purchase of **${fmt(price, currency)}** might stretch your budget. Consider saving for it over a few months — I can help you create a goal!`;
    }
    return `Could you tell me the price? I'll check against your spending patterns and give you a personalized recommendation.`;
  }

  // Saving tips
  if (/(save|saving|cut|reduce|tips|advice|how can i)/i.test(msg)) {
    if (!hasData) return `Here are some universal tips:\n\n💡 **50/30/20 Rule** — 50% needs, 30% wants, 20% savings\n💡 **Track daily** — even small expenses add up\n💡 **Set goals** — having a target makes saving easier\n\nOnce you add transactions, I'll give you personalized advice!`;
    const top = getTopCategory(transactions);
    return `Here are personalized tips based on your data, ${name}:\n\n${top ? `• Your biggest expense is **${top[0]}** at ${fmt(top[1].total, currency)}. Try reducing it by 10-15%.\n` : ''}• Set a monthly budget to track limits\n• Create savings goals for big purchases\n• Review your spending weekly in Analytics\n\nWould you like me to suggest a specific budget amount?`;
  }

  // Spending prediction
  if (/(predict|next month|forecast|future|estimate)/i.test(msg)) {
    if (!hasData) return `I need at least a few transactions to predict future spending. Start adding entries!`;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const dailyAvg = monthTotal / dayOfMonth;
    const projected = dailyAvg * daysInMonth;
    return `📈 **Spending Forecast**\n\nBased on your current rate of **${fmt(dailyAvg, currency)}/day**, you're projected to spend approximately **${fmt(projected, currency)}** this month.\n\nFor next month, I predict a similar pattern unless you adjust your habits. Would you like tips on reducing spending?`;
  }

  // Category breakdown
  if (/(category|categories|breakdown|where.*spending|what.*spending)/i.test(msg)) {
    if (!hasData) return `No transactions yet! Add some entries and I'll show you a full category breakdown.`;
    const breakdown = getCategoryBreakdown(transactions);
    let resp = `📂 **Category Breakdown (This Month)**\n\n`;
    breakdown.slice(0, 6).forEach(([cat, data]) => {
      const pct = ((data.total / monthTotal) * 100).toFixed(1);
      resp += `${data.icon} **${cat}**: ${fmt(data.total, currency)} (${pct}%)\n`;
    });
    return resp;
  }

  // Goals
  if (/(goal|goals|target|saving for|saving up)/i.test(msg)) {
    if (goals.length === 0) return `You haven't created any savings goals yet! Head to the Goals section and add your first goal — whether it's a laptop, vacation, or emergency fund. 🎯`;
    let resp = `🎯 **Your Savings Goals**\n\n`;
    goals.forEach(g => {
      const pct = Math.min(100, ((g.current / g.target) * 100)).toFixed(1);
      resp += `• **${g.name}**: ${fmt(g.current, currency)} / ${fmt(g.target, currency)} (${pct}%)\n`;
    });
    return resp;
  }

  // Budget info
  if (/(budget|limit|allowance)/i.test(msg)) {
    if (budgets.length === 0) return `You haven't set any budgets yet. Head to the Budget section to create daily, weekly, or monthly spending limits — I'll help you stay on track! 📋`;
    let resp = `📋 **Your Budgets**\n\n`;
    budgets.forEach(b => {
      resp += `• **${b.type} budget**: ${fmt(b.amount, currency)}\n`;
    });
    resp += `\nThis month's spending: **${fmt(monthTotal, currency)}**`;
    return resp;
  }

  // Help / default
  return `I'm your AI financial advisor, ${name}! Here's what I can help with:\n\n💬 **Try asking:**\n• "How much did I spend this month?"\n• "Am I overspending?"\n• "Show my financial summary"\n• "Can I afford a ₹50,000 laptop?"\n• "How can I save money?"\n• "Predict next month's spending"\n\nWhat would you like to know?`;
}

export const SUGGESTED_PROMPTS = [
  'How much did I spend this month?',
  'Am I overspending?',
  'Show my financial summary',
  'Can I afford a laptop?',
  'How can I save money?',
  'Predict next month\'s spending',
];
