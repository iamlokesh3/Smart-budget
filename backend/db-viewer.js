import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function viewDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('--- USERS ---');
  const users = await db.all('SELECT * FROM users');
  console.log(users.length > 0 ? users : 'No users found.');

  console.log('\n--- TRANSACTIONS ---');
  const transactions = await db.all('SELECT * FROM transactions');
  console.log(transactions.length > 0 ? transactions : 'No transactions found.');

  console.log('\n--- BUDGETS ---');
  const budgets = await db.all('SELECT * FROM budgets');
  console.log(budgets.length > 0 ? budgets : 'No budgets found.');

  console.log('\n--- GOALS ---');
  const goals = await db.all('SELECT * FROM goals');
  console.log(goals.length > 0 ? goals : 'No goals found.');

  await db.close();
}

viewDatabase().catch(console.error);
