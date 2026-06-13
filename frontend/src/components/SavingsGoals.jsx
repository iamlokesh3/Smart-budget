import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Plus, 
  PiggyBank, 
  Trash2, 
  Edit3, 
  CheckCircle,
  X,
  Target
} from 'lucide-react';

const SavingsGoals = () => {
  const { 
    savingsGoals, 
    addSavingsGoal, 
    editSavingsGoal, 
    deleteSavingsGoal, 
    addSavingsToGoal, 
    formatCurrencyVal 
  } = useContext(AppContext);

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [fundingGoal, setFundingGoal] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('0');

  const [fundAmount, setFundAmount] = useState('');

  // Submit Add
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title || !target) return;
    addSavingsGoal({ title, target, saved });
    setTitle('');
    setTarget('');
    setSaved('0');
    setShowAddModal(false);
  };

  // Submit Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingGoal.title || !editingGoal.target) return;
    editSavingsGoal(editingGoal.id, editingGoal);
    setEditingGoal(null);
  };

  // Submit Fund
  const handleFundSubmit = (e) => {
    e.preventDefault();
    if (!fundAmount || Number(fundAmount) <= 0) return;
    addSavingsToGoal(fundingGoal.id, Number(fundAmount));
    setFundAmount('');
    setFundingGoal(null);
  };

  return (
    <div className="page-wrapper">
      {/* Header and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem' }}>Personal Savings Goals</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Create unlimited targets for tech, travel, education, or emergencies.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Create Goal
        </button>
      </div>

      {/* Grid List */}
      {savingsGoals.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PiggyBank size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
          <h3>No goals created yet</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Set up targets to start directing your cash flow into savings.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {savingsGoals.map((g) => {
            const percentage = Math.min(100, Math.round((g.saved / g.target) * 100));
            const completed = g.saved >= g.target;
            return (
              <div 
                key={g.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: completed ? '4px solid var(--success)' : '4px solid var(--primary)',
                  position: 'relative'
                }}
              >
                {/* Ribbon for achieved goals */}
                {completed && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'var(--success-glow)',
                    color: 'var(--success)',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={10} /> Achieved
                  </div>
                )}

                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '8px', paddingRight: completed ? '70px' : '0' }}>{g.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    <span>Target: {formatCurrencyVal(g.target)}</span>
                    <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="progress-bar-container" style={{ height: '8px', marginBottom: '12px' }}>
                    <div 
                      className={`progress-bar-fill ${completed ? 'bg-success' : 'bg-primary'}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Saved: <span style={{ fontWeight: 'bold', color: completed ? 'var(--success)' : 'var(--text-primary)' }}>{formatCurrencyVal(g.saved)}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '20px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <button 
                    disabled={completed}
                    onClick={() => setFundingGoal(g)}
                    className={`btn ${completed ? 'btn-secondary' : 'btn-success'}`}
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Add Money
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setEditingGoal(g)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                      title="Edit Goal"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      onClick={() => deleteSavingsGoal(g.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                      title="Delete Goal"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="card" style={{ width: '400px', padding: '24px', animation: 'slideUp 0.3s forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Create Savings Target</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Target Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Higher Studies or Buy Laptop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Funding Amount</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 80000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Initial Seed Funding Amount (Optional)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 5000"
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGoal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="card" style={{ width: '400px', padding: '24px', animation: 'slideUp 0.3s forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Edit Savings Goal</h3>
              <button onClick={() => setEditingGoal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Goal Target Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Funding Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingGoal.target}
                  onChange={(e) => setEditingGoal({ ...editingGoal, target: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Current Saved Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingGoal.saved}
                  onChange={(e) => setEditingGoal({ ...editingGoal, saved: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingGoal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Fund Modal */}
      {fundingGoal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="card" style={{ width: '360px', padding: '24px', animation: 'slideUp 0.3s forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={18} style={{ color: 'var(--success)' }} />
                Fund "{fundingGoal.title}"
              </h3>
              <button onClick={() => setFundingGoal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFundSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Amount to save towards goal</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1000"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  autoFocus
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  Remaining: {formatCurrencyVal(fundingGoal.target - fundingGoal.saved)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setFundingGoal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Fund Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
