/**
 * Smart Budget AI Advisor & Natural Language Engine
 */

// Helper to format currency
export const formatCurrency = (amount, currency = 'INR') => {
  const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const symbol = symbols[currency] || '₹';
  return `${symbol}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Map keywords to standard categories
const KEYWORD_CATEGORY_MAP = {
  // Food & Dining
  pizza: 'Food & Dining', burger: 'Food & Dining', food: 'Food & Dining', restaurant: 'Food & Dining',
  eat: 'Food & Dining', coffee: 'Food & Dining', cafe: 'Food & Dining', dinner: 'Food & Dining',
  lunch: 'Food & Dining', starbucks: 'Food & Dining', swiggy: 'Food & Dining', zomato: 'Food & Dining',
  
  // Education
  college: 'Education', book: 'Education', course: 'Education', school: 'Education',
  tuition: 'Education', fees: 'Education', study: 'Education', exam: 'Education',
  
  // Bills & Utilities
  recharge: 'Bills & Utilities', internet: 'Bills & Utilities', wifi: 'Bills & Utilities',
  electricity: 'Bills & Utilities', power: 'Bills & Utilities', gas: 'Bills & Utilities',
  water: 'Bills & Utilities', rent: 'Bills & Utilities', mobile: 'Bills & Utilities',
  phone: 'Bills & Utilities', subscription: 'Bills & Utilities', netflix: 'Bills & Utilities',
  spotify: 'Bills & Utilities',
  
  // Gadgets & Tech
  laptop: 'Gadgets & Tech', phone: 'Gadgets & Tech', computer: 'Gadgets & Tech',
  iphone: 'Gadgets & Tech', ipad: 'Gadgets & Tech', charger: 'Gadgets & Tech',
  headphone: 'Gadgets & Tech', camera: 'Gadgets & Tech',
  
  // Travel & Transport
  cab: 'Travel & Transport', uber: 'Travel & Transport', ola: 'Travel & Transport',
  flight: 'Travel & Transport', hotel: 'Travel & Transport', vacation: 'Travel & Transport',
  bus: 'Travel & Transport', train: 'Travel & Transport', petrol: 'Travel & Transport',
  fuel: 'Travel & Transport', auto: 'Travel & Transport', ticket: 'Travel & Transport',
  
  // Entertainment & Shopping
  movie: 'Entertainment & Shopping', game: 'Entertainment & Shopping', playstation: 'Entertainment & Shopping',
  clothes: 'Entertainment & Shopping', mall: 'Entertainment & Shopping', amazon: 'Entertainment & Shopping',
  myntra: 'Entertainment & Shopping', shoes: 'Entertainment & Shopping', watch: 'Entertainment & Shopping',
  concert: 'Entertainment & Shopping',
  
  // Health & Fitness
  gym: 'Health & Fitness', medicine: 'Health & Fitness', doctor: 'Health & Fitness',
  hospital: 'Health & Fitness', yoga: 'Health & Fitness', protein: 'Health & Fitness',
  clinic: 'Health & Fitness',
  
  // Income Sources
  salary: 'Income', freelance: 'Income', dividend: 'Income', refund: 'Income',
  gift: 'Income', bonus: 'Income', cashback: 'Income', stipend: 'Income'
};

/**
 * Parsers a natural language sentence into expense/income details
 * @param {string} text - Input sentence (e.g. "Spent ₹300 on pizza")
 * @returns {object} { title, amount, category, type }
 */
export const parseNaturalLanguageTransaction = (text) => {
  if (!text) return null;
  
  const cleanText = text.toLowerCase().trim();
  
  // 1. Extract Amount
  // Matches raw numbers, numbers with commas, optionally preceded by currency symbols (₹, $, €, £)
  const amountRegex = /(?:[₹$€£\s]|^)([0-9,]+(?:\.[0-9]+)?)(?:\s|$)/;
  const match = cleanText.match(amountRegex);
  
  let amount = 0;
  if (match && match[1]) {
    amount = parseFloat(match[1].replace(/,/g, ''));
  }
  
  // 2. Detect Transaction Type (Income vs Expense)
  let type = 'expense';
  const incomeKeywords = ['earned', 'received', 'salary', 'income', 'stipend', 'bonus', 'refund', 'freelance', 'credit', 'got'];
  const hasIncomeKeyword = incomeKeywords.some(kw => cleanText.includes(kw));
  if (hasIncomeKeyword) {
    type = 'income';
  }
  
  // 3. Extract Title & Category
  let category = type === 'income' ? 'Income' : 'Others';
  let title = '';
  
  // Remove amount and common prepositions to find the title
  let titleText = cleanText
    .replace(/(?:[₹$€£\s]|^)[0-9,]+(?:\.[0-9]+)?(?:\s|$)/g, ' ') // remove number
    .replace(/\b(spent|paid|for|on|earned|received|from|to|bought|purchased|recharge|in|at)\b/g, ' ') // remove connectors
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize title words
  title = titleText.replace(/\b\w/g, char => char.toUpperCase());
  if (!title) {
    title = type === 'income' ? 'Miscellaneous Income' : 'Uncategorized Expense';
  }
  
  // Find category based on keywords in original text
  for (const [kw, cat] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (cleanText.includes(kw)) {
      category = cat;
      break;
    }
  }
  
  // Special overrides
  if (type === 'income') {
    category = 'Income';
  }
  
  return {
    title,
    amount,
    category,
    type,
    date: new Date().toISOString().split('T')[0]
  };
};

/**
 * Simulates Receipt Scanning OCR
 * @param {string} fileName - Name of uploaded file
 * @returns {Promise<object>} Parsed receipt data
 */
export const scanReceiptMock = (fileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const name = fileName.toLowerCase();
      let title = 'Walmart Supercenter';
      let amount = 1450;
      let category = 'Groceries';
      
      if (name.includes('starbucks') || name.includes('coffee') || name.includes('cafe')) {
        title = 'Starbucks Coffee';
        amount = 320;
        category = 'Food & Dining';
      } else if (name.includes('amazon') || name.includes('bill') || name.includes('delivery')) {
        title = 'Amazon Purchase';
        amount = 2890;
        category = 'Entertainment & Shopping';
      } else if (name.includes('uber') || name.includes('cab') || name.includes('ride')) {
        title = 'Uber Ride';
        amount = 450;
        category = 'Travel & Transport';
      } else if (name.includes('netflix') || name.includes('spotify')) {
        title = 'Netflix Subscription';
        amount = 649;
        category = 'Bills & Utilities';
      } else if (name.includes('college') || name.includes('book')) {
        title = 'College Book Store';
        amount = 1800;
        category = 'Education';
      }
      
      resolve({
        title,
        amount,
        category,
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    }, 1500); // 1.5 seconds simulated delay
  });
};

/**
 * Calculate Financial Health Score (0 to 100)
 * Excellent (85-100), Good (70-84), Average (50-69), Poor (0-49)
 */
export const calculateFinancialHealthScore = (income, expenses, budget, goals) => {
  if (income === 0) return { score: 50, label: 'Average', color: 'var(--warning)' };
  
  let score = 75; // Baseline
  
  // 1. Savings Rate factor (up to 25 points)
  const savingsRate = (income - expenses) / income;
  if (savingsRate >= 0.40) score += 25;
  else if (savingsRate >= 0.20) score += 15;
  else if (savingsRate >= 0.05) score += 5;
  else if (savingsRate < 0) score -= 20; // Overspending penalty
  
  // 2. Budget adherence factor (up to 20 points)
  if (budget > 0) {
    const budgetUsage = expenses / budget;
    if (budgetUsage <= 0.8) score += 20;
    else if (budgetUsage <= 1.0) score += 10;
    else if (budgetUsage > 1.2) score -= 15;
    else score -= 5;
  } else {
    score += 5; // Default minor reward for having no budget pressure, but encourages setting one
  }
  
  // 3. Goal progression factor (up to 15 points)
  if (goals && goals.length > 0) {
    const totalGoalPercent = goals.reduce((acc, g) => acc + (g.saved / g.target), 0) / goals.length;
    score += Math.min(15, Math.floor(totalGoalPercent * 15));
  }
  
  // Bounds
  score = Math.max(0, Math.min(100, score));
  
  let label = 'Average';
  let color = 'var(--warning)';
  if (score >= 85) {
    label = 'Excellent';
    color = 'var(--success)';
  } else if (score >= 70) {
    label = 'Good';
    color = 'var(--success)';
  } else if (score >= 50) {
    label = 'Average';
    color = 'var(--warning)';
  } else {
    label = 'Poor';
    color = 'var(--danger)';
  }
  
  return { score, label, color };
};

/**
 * AI Future Expense Prediction based on historical transactions
 */
export const predictNextMonthSpending = (transactions, monthlyBudget = 0) => {
  if (!transactions || transactions.length === 0) {
    return monthlyBudget > 0 ? monthlyBudget * 0.95 : 12000;
  }
  
  const expensesOnly = transactions.filter(t => t.type === 'expense');
  if (expensesOnly.length === 0) return 0;
  
  // Group by month
  const monthlySums = {};
  expensesOnly.forEach(t => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    monthlySums[monthKey] = (monthlySums[monthKey] || 0) + t.amount;
  });
  
  const sums = Object.values(monthlySums);
  const averageSpend = sums.reduce((a, b) => a + b, 0) / sums.length;
  
  // Apply a micro-multiplier based on standard deviation or general trend
  // If there's multiple months, see if spending is rising
  let trendMultiplier = 1.0;
  if (sums.length >= 2) {
    const lastMonth = sums[sums.length - 1];
    const prevMonth = sums[sums.length - 2];
    if (lastMonth > prevMonth) {
      trendMultiplier = 1.05; // spending is increasing
    } else {
      trendMultiplier = 0.95; // spending is decreasing
    }
  }
  
  return Math.round(averageSpend * trendMultiplier);
};

/**
 * Custom AI Bot response logic based on user database
 */
export const getChatbotResponse = (query, dbData, currencySymbol = '₹') => {
  const cleanQuery = query.toLowerCase().trim();
  
  const { transactions, budgetSettings, savingsGoals, income, expenses } = dbData;
  const balance = income - expenses;
  const monthlyBudget = budgetSettings?.monthlyBudget || 0;
  
  // 1. Expense summary queries
  if (cleanQuery.includes('spend') || cleanQuery.includes('expense') || cleanQuery.includes('summary') || cleanQuery.includes('how much')) {
    if (cleanQuery.includes('summary') || cleanQuery.includes('financial summary')) {
      return `Here is your current financial summary:
- **Total Income**: ${currencySymbol}${income.toLocaleString()}
- **Total Expenses**: ${currencySymbol}${expenses.toLocaleString()}
- **Remaining Balance**: ${currencySymbol}${balance.toLocaleString()}
- **Monthly Budget**: ${currencySymbol}${monthlyBudget.toLocaleString()}
- **Active Savings Goals**: ${savingsGoals.length} goals
- **Financial Health Score**: ${calculateFinancialHealthScore(income, expenses, monthlyBudget, savingsGoals).score}/100

What would you like me to analyze in detail?`;
    }
    
    return `You have spent a total of **${currencySymbol}${expenses.toLocaleString()}** out of **${currencySymbol}${income.toLocaleString()}** income. Your remaining balance is **${currencySymbol}${balance.toLocaleString()}**. 

This represents **${income > 0 ? Math.round((expenses / income) * 100) : 0}%** of your total earnings spent.`;
  }
  
  // 2. Highest category expense
  if (cleanQuery.includes('highest') || cleanQuery.includes('category') || cleanQuery.includes('most spent')) {
    const categorySums = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
    });
    
    const sortedCategories = Object.entries(categorySums).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length === 0) {
      return "You haven't recorded any expenses yet! Once you log some transactions, I'll tell you your highest spending category.";
    }
    
    const [topCat, topAmt] = sortedCategories[0];
    return `Your highest spending category is **${topCat}** with a total of **${currencySymbol}${topAmt.toLocaleString()}**. 
This accounts for **${expenses > 0 ? Math.round((topAmt / expenses) * 100) : 0}%** of your total expenses. Consider scaling back on ${topCat} to boost your savings rate!`;
  }
  
  // 3. Overspending checking
  if (cleanQuery.includes('overspend') || cleanQuery.includes('limit') || cleanQuery.includes('budget status')) {
    if (monthlyBudget === 0) {
      return "You haven't set a monthly budget yet! Please set one in the **Budget Planner** page so I can track your overspending.";
    }
    
    const ratio = expenses / monthlyBudget;
    if (ratio > 1.0) {
      return `⚠️ **Alert**: You have exceeded your monthly budget of **${currencySymbol}${monthlyBudget.toLocaleString()}** by **${currencySymbol}${Math.round(expenses - monthlyBudget).toLocaleString()}** (${Math.round((ratio - 1) * 100)}% over budget). I highly recommend freezing non-essential spending immediately.`;
    } else if (ratio >= 0.8) {
      return `⚠️ **Warning**: You have used **${Math.round(ratio * 100)}%** of your monthly budget. You have **${currencySymbol}${Math.round(monthlyBudget - expenses).toLocaleString()}** remaining for the rest of the month. Use caution!`;
    } else {
      return `✅ **On Track**: Your budget is under control! You have used **${Math.round(ratio * 100)}%** of your monthly budget. Keep up the disciplined spending!`;
    }
  }
  
  // 4. Laptop or specific purchase feasibility
  if (cleanQuery.includes('can i buy') || cleanQuery.includes('worth') || cleanQuery.includes('buy a')) {
    // Extract numbers to see purchase price
    const priceRegex = /([0-9,]+)/;
    const priceMatch = cleanQuery.match(priceRegex);
    let purchaseName = 'laptop';
    if (cleanQuery.includes('laptop')) purchaseName = 'laptop';
    else if (cleanQuery.includes('car')) purchaseName = 'car';
    else if (cleanQuery.includes('phone') || cleanQuery.includes('iphone')) purchaseName = 'smartphone';
    else purchaseName = 'this item';
    
    if (priceMatch && priceMatch[1]) {
      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (price <= balance) {
        return `Yes! You have a remaining balance of **${currencySymbol}${balance.toLocaleString()}**, which easily covers the **${currencySymbol}${price.toLocaleString()}** cost of the ${purchaseName}. 

However, buying it outright will reduce your liquidity to **${currencySymbol}${Math.round(balance - price).toLocaleString()}**. I recommend creating a Savings Goal for this rather than dipping directly into your emergency funds!`;
      } else {
        const gap = price - balance;
        const avgSavings = income - expenses; // monthly savings speed
        const monthsNeeded = avgSavings > 0 ? Math.ceil(gap / avgSavings) : 'infinite';
        
        return `Currently, you cannot comfortably buy this ${purchaseName} worth **${currencySymbol}${price.toLocaleString()}** because your net balance is **${currencySymbol}${balance.toLocaleString()}** (short by **${currencySymbol}${gap.toLocaleString()}**). 

${avgSavings > 0 
  ? `Based on your average monthly savings rate of **${currencySymbol}${avgSavings.toLocaleString()}**, it will take you about **${monthsNeeded} months** of disciplined saving to buy it without incurring debt.` 
  : "Currently, your monthly expenses exceed your income, meaning you are not generating new savings. Consider trimming expenses first before planning big purchases!"}`;
      }
    }
    return "Please specify the price of the item you want to buy (e.g. 'Can I buy a laptop worth 80000?').";
  }
  
  // 5. Savings tips
  if (cleanQuery.includes('tip') || cleanQuery.includes('saving') || cleanQuery.includes('advice')) {
    const tips = [
      "💡 **Rule 50/30/20**: Allocate 50% of income to Needs (rent, bills), 30% to Wants (dining, hobbies), and 20% directly to Savings & Goals.",
      "💡 **Subscrption Check**: Review automated subscriptions (Netflix, Spotify, App Store). If you haven't used them in the last 30 days, cancel them!",
      "💡 **The 24-Hour Rule**: For any non-essential purchase over ₹2,000, wait 24 hours. You'll find that 60% of the time, the urge to buy passes.",
      "💡 **Smart Food Swap**: Swapping just 2 restaurant or Swiggy meals per week with home-cooked meals can save you upwards of ₹2,500 every single month."
    ];
    return `Here are some custom saving tips for you:\n\n${tips.join('\n\n')}`;
  }
  
  // 6. Predict next month's spending
  if (cleanQuery.includes('predict') || cleanQuery.includes('next month') || cleanQuery.includes('prediction')) {
    const prediction = predictNextMonthSpending(transactions, monthlyBudget);
    const avgIncome = income > 0 ? income : 50000;
    const margin = avgIncome - prediction;
    return `🔮 **AI Spending Prediction**:
Based on your historical spending habits, I predict your expenses next month will be approximately **${currencySymbol}${prediction.toLocaleString()}**.

- Expected Remaining Margin: **${currencySymbol}${margin.toLocaleString()}**
- Budget Recommendations: Keep monthly expenditures under **${currencySymbol}${monthlyBudget > 0 ? monthlyBudget.toLocaleString() : (prediction * 1.05).toLocaleString()}** to ensure you stay in the green.`;
  }
  
  // 7. General greeting
  return `Hello! I am your AI Financial Advisor. I have access to your live transaction ledger, budgets, and savings goals. 

Here are some things you can ask me:
- "How much did I spend this month?"
- "Which category has the highest expense?"
- "Am I overspending my budget?"
- "Give me saving tips"
- "Can I buy a laptop worth 80000?"
- "Predict next month's expenses"`;
};
