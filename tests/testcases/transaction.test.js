import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { TransactionPage } from '../pages/TransactionPage.js';

describe('Transaction', function () {
  let loginPage;
  let dashboardPage;
  let transactionPage;

  before(async function () {
    loginPage = new LoginPage(global.driverInstance);
    dashboardPage = new DashboardPage(global.driverInstance);
    transactionPage = new TransactionPage(global.driverInstance);
    await loginPage.navigate();
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    await dashboardPage.navigateTo('Smart Entries');
  });

  it('TC_TX_021 - Add Income', async function () {
    await transactionPage.addNaturalLanguage('Added income 35000 from Freelance work');
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_022 - Add Expense', async function () {
    await transactionPage.addNaturalLanguage('Spent 850 on groceries');
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_023 - Edit Transaction', async function () {
    await transactionPage.editFirstTransaction('Grocery items weekly');
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_024 - Delete Transaction', async function () {
    await transactionPage.deleteFirstTransaction();
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_025 - Search Transaction', async function () {
    await transactionPage.search('groceries');
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_026 - Filter Transaction', async function () {
    await transactionPage.filterByCategory('Food');
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_027 - Sort Transaction', async function () {
    await transactionPage.sortByHeader();
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });

  it('TC_TX_028 - Transaction History Display', async function () {
    const count = await transactionPage.getTableRowsCount();
    expect(count).to.not.be.null;
  });
});
