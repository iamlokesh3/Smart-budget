import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      joinedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      raw TEXT,
      title TEXT,
      amount REAL,
      category TEXT,
      categoryIcon TEXT,
      categoryColor TEXT,
      date TEXT,
      dateLabel TEXT,
      type TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      amount REAL,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      target REAL,
      current REAL,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
  console.log('Database initialized');

  // Seed test user if empty to support existing login flows
  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', ['lokeshmk436@gmail.com']);
  if (!existingUser) {
    await db.run(
      "INSERT INTO users (id, name, email, joinedAt) VALUES ('1781096350731', 'Lokesh', 'lokeshmk436@gmail.com', '2026-06-10T12:59:10.731Z')"
    );
    console.log('Seeded test user Lokesh');
  }
}

// Middleware to check auth
const auth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { id, name, email, joinedAt } = req.body;
  console.log(`Register request: ${email} (${name})`);
  try {
    await db.run('INSERT INTO users (id, name, email, joinedAt) VALUES (?, ?, ?, ?)', [id, name, email, joinedAt]);
    console.log(`User registered: ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error(`Register error: ${err.message}`);
    if (err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  console.log(`Login request for email: ${email}`);
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    console.log(`User not found: ${email}`);
    return res.status(404).json({ error: 'User not found' });
  }
  console.log(`User logged in: ${email} (${user.name})`);
  res.json(user);
});

// --- TRANSACTIONS ---
app.get('/api/transactions', auth, async (req, res) => {
  const txs = await db.all('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [req.userId]);
  res.json(txs);
});

app.post('/api/transactions', auth, async (req, res) => {
  const { id, raw, title, amount, category, categoryIcon, categoryColor, date, dateLabel, type } = req.body;
  await db.run(
    'INSERT INTO transactions (id, userId, raw, title, amount, category, categoryIcon, categoryColor, date, dateLabel, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.userId, raw, title, amount, category, categoryIcon, categoryColor, date, dateLabel, type]
  );
  res.json({ success: true });
});

app.put('/api/transactions/:id', auth, async (req, res) => {
  const { title } = req.body;
  await db.run('UPDATE transactions SET title = ? WHERE id = ? AND userId = ?', [title, req.params.id, req.userId]);
  res.json({ success: true });
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  await db.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

// --- RENAME CATEGORY ---
app.put('/api/transactions/rename-category', auth, async (req, res) => {
  const { oldCategory, newCategory, categoryIcon, categoryColor } = req.body;
  if (!oldCategory || !newCategory) {
    return res.status(400).json({ error: 'Missing oldCategory or newCategory' });
  }
  try {
    if (categoryIcon && categoryColor) {
      await db.run(
        'UPDATE transactions SET category = ?, categoryIcon = ?, categoryColor = ? WHERE category = ? AND userId = ?',
        [newCategory, categoryIcon, categoryColor, oldCategory, req.userId]
      );
    } else {
      await db.run(
        'UPDATE transactions SET category = ? WHERE category = ? AND userId = ?',
        [newCategory, oldCategory, req.userId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BUDGETS ---
app.get('/api/budgets', auth, async (req, res) => {
  const budgets = await db.all('SELECT * FROM budgets WHERE userId = ?', [req.userId]);
  res.json(budgets);
});

app.post('/api/budgets', auth, async (req, res) => {
  const { id, type, amount, createdAt } = req.body;
  // Upsert pattern for SQLite (delete then insert if type exists)
  await db.run('DELETE FROM budgets WHERE userId = ? AND type = ?', [req.userId, type]);
  await db.run(
    'INSERT INTO budgets (id, userId, type, amount, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, req.userId, type, amount, createdAt]
  );
  res.json({ success: true });
});

app.delete('/api/budgets/:id', auth, async (req, res) => {
  await db.run('DELETE FROM budgets WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

// --- GOALS ---
app.get('/api/goals', auth, async (req, res) => {
  const goals = await db.all('SELECT * FROM goals WHERE userId = ?', [req.userId]);
  res.json(goals);
});

app.post('/api/goals', auth, async (req, res) => {
  const { id, name, target, current, createdAt } = req.body;
  await db.run(
    'INSERT INTO goals (id, userId, name, target, current, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.userId, name, target, current, createdAt]
  );
  res.json({ success: true });
});

app.put('/api/goals/:id', auth, async (req, res) => {
  const { current } = req.body;
  await db.run('UPDATE goals SET current = ? WHERE id = ? AND userId = ?', [current, req.params.id, req.userId]);
  res.json({ success: true });
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  await db.run('DELETE FROM goals WHERE id = ? AND userId = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

// --- AI ADVISOR ---
// Lightweight rule-based financial advisor endpoint.
// Processes financial keyword queries and returns contextual advice.
app.post('/api/ai/chat', auth, async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message field is required' });
  }

  const lower = message.toLowerCase();

  // Basic keyword-driven responses (no external AI dependency)
  let reply = 'I can help with budgeting, expenses, savings goals, and financial planning. What would you like to know?';

  if (lower.includes('spend') || lower.includes('expense')) {
    reply = 'To reduce spending: track every expense, categorise them, and identify areas where you can cut back by 10-20%.';
  } else if (lower.includes('save') || lower.includes('saving')) {
    reply = 'A good rule of thumb: save at least 20% of your income. Start with an emergency fund covering 3-6 months of expenses.';
  } else if (lower.includes('budget')) {
    reply = 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Review your budget monthly and adjust as needed.';
  } else if (lower.includes('goal')) {
    reply = 'For savings goals: define a target amount, set a deadline, and automate monthly contributions to reach it on time.';
  } else if (lower.includes('invest')) {
    reply = 'Before investing, build an emergency fund. Then consider index funds for long-term wealth creation.';
  } else if (lower.includes('debt') || lower.includes('loan')) {
    reply = 'Prioritise high-interest debt first (avalanche method). Pay minimums on all debts, then throw extra at the highest rate.';
  } else if (lower.includes('trend') || lower.includes('analysis') || lower.includes('analyse')) {
    reply = 'Check your dashboard for spending trends. Compare this month to last month across categories to spot patterns.';
  }

  res.json({
    reply,
    timestamp: new Date().toISOString(),
    model: 'smart-budget-advisor-v1',
  });
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
});
