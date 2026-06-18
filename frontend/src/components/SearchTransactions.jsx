import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Calendar, Tag, SlidersHorizontal } from 'lucide-react';

export default function SearchTransactions() {
  const { transactions, currency } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const categories = ['All', ...new Set(transactions.map(t => t.category))];

  const results = transactions.filter(t => {
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) || 
                         t.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    const matchesType = type === 'All' || t.type === type;
    const matchesMin = minAmount === '' || Number(t.amount) >= Number(minAmount);
    const matchesMax = maxAmount === '' || Number(t.amount) <= Number(maxAmount);

    return matchesQuery && matchesCategory && matchesType && matchesMin && matchesMax;
  });

  const fmt = (n) => `${currency}${n.toLocaleString('en-IN')}`;

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Advanced Search</h2>
        <p>Find specific transactions using advanced filters, keyword search, and values.</p>
      </div>

      <div className="card anim-up" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div className="input-group" style={{ flex: 2, minWidth: '240px' }}>
            <label className="label">Search Query</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search description, tag or category..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="label">Category</label>
            <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
            <label className="label">Type</label>
            <select className="select" value={type} onChange={e => setType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="income">Incomes</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '140px' }}>
            <label className="label">Min Amount</label>
            <input className="input" type="number" placeholder="Min" value={minAmount} onChange={e => setMinAmount(e.target.value)} />
          </div>
          <div className="input-group" style={{ flex: 1, minWidth: '140px' }}>
            <label className="label">Max Amount</label>
            <input className="input" type="number" placeholder="Max" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card anim-up" style={{ animationDelay: '.05s' }}>
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <h4>Search Results ({results.length})</h4>
          <span style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>Found in ledger</span>
        </div>

        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No records matched your specific filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {results.map(t => (
              <div key={t.id} className="flex-between" style={{ padding: '.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
                    <span className="badge badge-muted">{t.category}</span>
                    <span>{t.date}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--emerald-dark)' : 'var(--text-primary)' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
