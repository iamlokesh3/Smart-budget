import { useState, useEffect } from 'react';
import { Send, Sparkles, Trash2, Edit2, Check, X, Edit3 } from 'lucide-react';
import { parseEntry, getCategoryMeta } from '../utils/aiParser';
import { useApp } from '../context/AppContext';

export default function SmartEntry() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, renameCategory, currency } = useApp();
  const [input, setInput]       = useState('');
  const [parsed, setParsed]     = useState(null);
  const [error, setError]       = useState('');
  const [editId, setEditId]     = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [filter, setFilter]     = useState('all');
  const [renameInput, setRenameInput] = useState('');

  const cur = currency || '₹';

  useEffect(() => {
    setRenameInput(filter !== 'all' ? filter : '');
  }, [filter]);

  function handleInput(e) {
    const val = e.target.value;
    setInput(val);
    setError('');
    if (val.trim().length > 5) {
      const result = parseEntry(val);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!parsed) {
      setError('Could not extract a valid amount. Try: "Spent ₹300 on pizza"');
      return;
    }
    addTransaction(parsed);
    setInput('');
    setParsed(null);
    setError('');
  }

  function startEdit(tx) {
    setEditId(tx.id);
    setEditTitle(tx.title);
  }

  function saveEdit(id) {
    updateTransaction(id, { title: editTitle });
    setEditId(null);
  }

  function handleRenameCategory() {
    if (!renameInput.trim() || filter === 'all') return;
    const newName = renameInput.trim();
    const meta = getCategoryMeta(newName);
    renameCategory(filter, newName, meta.icon, meta.color);
    setFilter(newName);
    setRenameInput('');
  }

  // Filtered transactions
  const categories = [...new Set(transactions.map(t => t.category))];
  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.category === filter);

  const totalFiltered = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Smart Entries</h2>
        <p>Type naturally — AI extracts amount, title, and category automatically.</p>
      </div>

      {/* Natural language input */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div style={{display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1rem'}}>
          <Sparkles size={16} color="var(--blue)"/>
          <span style={{fontWeight:600, fontSize:'.9375rem'}}>Add Entry</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="entry-input-wrapper">
            <input
              className="entry-input"
              value={input}
              onChange={handleInput}
              placeholder='Try: "Spent ₹300 on pizza" or "Paid ₹1500 for books"'
              autoFocus
            />
            <button type="submit" className="entry-submit-btn">
              <Send size={16}/>
            </button>
          </div>

          {parsed && (
            <div className="parsed-preview anim-up">
              <span style={{fontSize:'1.25rem'}}>{parsed.categoryIcon}</span>
              <span style={{fontWeight:600, color:'var(--emerald-dark)', fontSize:'.875rem'}}>AI extracted:</span>
              <span className="parsed-chip">💰 {cur}{parsed.amount.toLocaleString('en-IN')}</span>
              <span className="parsed-chip">📝 {parsed.title}</span>
              <span className="parsed-chip">🏷️ {parsed.category}</span>
              <span className="parsed-chip">📅 {parsed.dateLabel}</span>
            </div>
          )}

          {error && (
            <div style={{padding:'.75rem 1rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', color:'#b91c1c', fontSize:'.875rem', marginTop:'.75rem'}}>
              {error}
            </div>
          )}
        </form>

        {/* Tips */}
        <div style={{marginTop:'1rem', display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
          {['"Spent ₹300 on pizza"', '"Paid ₹1500 for books"', '"Bought shoes for ₹2500"', '"₹200 for tea"'].map(tip => (
            <button
              key={tip}
              onClick={() => { setInput(tip.replace(/"/g,'')); handleInput({ target: { value: tip.replace(/"/g,'') }}); }}
              style={{padding:'.3rem .7rem', borderRadius:'var(--radius-full)', background:'var(--bg-subtle)', border:'1px solid var(--border)', fontSize:'.78rem', color:'var(--text-secondary)', cursor:'pointer', fontFamily:'var(--font)'}}
            >
              {tip}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions list */}
      {transactions.length === 0 ? (
        <div className="empty-state card">
          <div style={{fontSize:'3rem'}}>📝</div>
          <h3>No entries yet</h3>
          <p>Start by typing a transaction above. Your spending history will appear here.</p>
        </div>
      ) : (
        <>
          {/* Category filter section */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="flex-between" style={{flexWrap:'wrap', gap:'.75rem'}}>
              <div>
                <h4 style={{ fontWeight: 600 }}>Filter by Category</h4>
              </div>
              <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap'}}>
                <button
                  onClick={() => setFilter('all')}
                  className={`badge ${filter==='all'?'badge-blue':'badge-muted'}`}
                  style={{cursor:'pointer', border:'none', fontFamily:'var(--font)', padding:'.35rem .875rem'}}
                >All</button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`badge ${filter===cat?'badge-blue':'badge-muted'}`}
                    style={{cursor:'pointer', border:'none', fontFamily:'var(--font)', padding:'.35rem .875rem', textTransform:'capitalize'}}
                  >{cat}</button>
                ))}
              </div>
            </div>

            {/* Rename category block */}
            {filter !== 'all' && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Rename Category "{filter}":
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    className="input"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: '160px', height: 'auto' }}
                    placeholder="New category name..."
                    value={renameInput}
                    onChange={e => setRenameInput(e.target.value)}
                  />
                  <button
                    className="btn btn-emerald btn-sm"
                    onClick={handleRenameCategory}
                    disabled={!renameInput.trim() || renameInput.trim().toLowerCase() === filter.toLowerCase()}
                    style={{ height: '30px', padding: '0 0.75rem' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transactions list */}
          <div className="card">
            <div className="flex-between" style={{marginBottom:'1.25rem', flexWrap:'wrap', gap:'.75rem'}}>
              <div>
                <h3>All Entries</h3>
                <p style={{fontSize:'.875rem', marginTop:'.2rem'}}>
                  {filtered.length} entries · Total: <strong style={{color:'var(--danger)'}}>-{cur}{totalFiltered.toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>

            <div style={{overflowX:'auto'}}>
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Entry</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{textAlign:'right'}}>Amount</th>
                    <th style={{textAlign:'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:'.625rem'}}>
                          <span style={{fontSize:'1.25rem', flexShrink:0}}>{tx.categoryIcon}</span>
                          <div style={{minWidth:0}}>
                            {editId === tx.id ? (
                              <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
                                <input
                                  className="input"
                                  style={{padding:'.3rem .6rem', fontSize:'.875rem', height:'auto'}}
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  autoFocus
                                />
                                <button onClick={() => saveEdit(tx.id)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--emerald)'}}><Check size={16}/></button>
                                <button onClick={() => setEditId(null)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--danger)'}}><X size={16}/></button>
                              </div>
                            ) : (
                              <>
                                <div style={{fontWeight:600, fontSize:'.9rem'}}>{tx.title}</div>
                                <div style={{fontSize:'.75rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200}}>{tx.raw}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-blue" style={{textTransform:'capitalize'}}>{tx.category}</span>
                      </td>
                      <td style={{color:'var(--text-muted)', fontSize:'.875rem', whiteSpace:'nowrap'}}>{tx.dateLabel}</td>
                      <td style={{textAlign:'right', fontWeight:700, color:'var(--danger)', whiteSpace:'nowrap'}}>
                        -{cur}{(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{textAlign:'center'}}>
                        <div style={{display:'flex', gap:'.25rem', justifyContent:'center'}}>
                          <button className="btn-icon" style={{width:'1.875rem', height:'1.875rem'}} onClick={() => startEdit(tx)} title="Edit Title">
                            <Edit2 size={13}/>
                          </button>
                          <button className="btn-icon" style={{width:'1.875rem', height:'1.875rem', color:'var(--danger)'}} onClick={() => deleteTransaction(tx.id)} title="Delete">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
