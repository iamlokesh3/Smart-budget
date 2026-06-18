import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Check, RefreshCw } from 'lucide-react';

export default function CategoryManager() {
  const { transactions, renameCategory } = useApp();

  // Dynamically build category list from current transactions
  const uniqueCats = Array.from(new Set(transactions.map(t => t.category))).filter(Boolean);
  
  const [editingCat, setEditingCat] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  function handleRename(oldCat) {
    if (!newName.trim() || newName === oldCat) {
      setEditingCat(null);
      return;
    }
    renameCategory(oldCat, newName.trim(), '📁', selectedColor);
    setEditingCat(null);
    setNewName('');
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Category Manager</h2>
        <p>Customize and manage your transaction categories, icons, and colors.</p>
      </div>

      <div className="card anim-up">
        <h4 style={{ marginBottom: '1rem' }}>Active Expense & Income Categories</h4>
        {uniqueCats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No categories detected yet. Create some transactions to generate categories.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {uniqueCats.map(cat => {
              const txCount = transactions.filter(t => t.category === cat).length;
              const isEditing = editingCat === cat;

              return (
                <div key={cat} className="card" style={{ padding: '1rem', borderLeft: `4px solid ${isEditing ? selectedColor : 'var(--blue)'}` }}>
                  {isEditing ? (
                    <div>
                      <input className="input" style={{ marginBottom: '.5rem' }} value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                      <div style={{ display: 'flex', gap: '.25rem', marginBottom: '.75rem' }}>
                        {colors.map(col => (
                          <button key={col} onClick={() => setSelectedColor(col)}
                            style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: col, border: selectedColor === col ? '2px solid var(--text-primary)' : 'none', cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleRename(cat)}><Check size={14} /> Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingCat(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-between">
                      <div>
                        <div style={{ fontWeight: 600 }}>{cat}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{txCount} transactions mapped</div>
                      </div>
                      <button className="btn-icon" onClick={() => { setEditingCat(cat); setNewName(cat); }} style={{ color: 'var(--blue)' }}>
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
