import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { parseNaturalLanguageTransaction, scanReceiptMock } from '../utils/aiAdvisor';
import { 
  Plus, 
  Search, 
  Mic, 
  MicOff, 
  Camera, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const Transactions = () => {
  const { 
    transactions, 
    addTransaction, 
    editTransaction, 
    deleteTransaction, 
    formatCurrencyVal,
    triggerToast
  } = useContext(AppContext);

  // Input states
  const [nlInput, setNlInput] = useState('');
  
  // OCR & Voice states
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

  // Table filtering/sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [selectedType, setSelectedType] = useState('All'); // 'All' | 'income' | 'expense'

  // Edit Modal states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editDate, setEditDate] = useState('');

  // Pre-defined categories list computed from transactions
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const cats = ['All', ...new Set(transactions.map(t => t.category))];
    setCategories(cats);
  }, [transactions]);

  // Submit NLP
  const handleNlSubmit = (e) => {
    e.preventDefault();
    if (!nlInput.trim()) return;
    
    const parsed = parseNaturalLanguageTransaction(nlInput);
    if (parsed) {
      addTransaction(parsed);
      setNlInput('');
    } else {
      triggerToast('AI could not parse that sentence. Try: "Spent ₹300 on pizza"', 'danger');
    }
  };

  // Simulated Voice Entry: Fallback and Web Speech API
  const handleVoiceEntry = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: Simulation dialog
      const simulatedSpeeches = [
        "Spent ₹450 on swiggy burgers",
        "Paid ₹1200 for internet wifi recharge",
        "Earned ₹15000 from college internship stipend",
        "Spent ₹3000 on flight travel tickets"
      ];
      const randomPrompt = simulatedSpeeches[Math.floor(Math.random() * simulatedSpeeches.length)];
      setNlInput(randomPrompt);
      triggerToast(`Voice Simulation: "${randomPrompt}" typed!`, 'info');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onerror = (event) => {
      console.error(event);
      setSpeechError('Could not access microphone or permission blocked. Typing a template...');
      setIsListening(false);
      
      // Fallback on error
      setTimeout(() => {
        const simulatedSpeeches = [
          "Spent ₹450 on swiggy burgers",
          "Paid ₹1200 for internet wifi recharge",
          "Earned ₹15000 from college internship stipend",
          "Spent 3000 on travel flight ticket"
        ];
        const randomPrompt = simulatedSpeeches[Math.floor(Math.random() * simulatedSpeeches.length)];
        setNlInput(randomPrompt);
        setSpeechError('');
      }, 1500);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setNlInput(speechToText);
      triggerToast(`Voice Recognized: "${speechToText}"`, 'success');
    };

    recognition.start();
  };

  // Simulated Receipt Scan OCR
  const handleReceiptScan = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    triggerToast('Receipt scanning initialized. Extracting line items via AI...', 'info');

    scanReceiptMock(file.name).then((parsed) => {
      addTransaction(parsed);
      setIsScanning(false);
      triggerToast(`Successfully scanned receipt: ${parsed.title} (${formatCurrencyVal(parsed.amount)}) added!`, 'success');
    });
  };

  // Edit Handlers
  const openEditModal = (t) => {
    setEditingTransaction(t);
    setEditTitle(t.title);
    setEditAmount(t.amount);
    setEditCategory(t.category);
    setEditType(t.type);
    setEditDate(t.date);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editTitle || !editAmount || !editCategory) return;
    
    editTransaction(editingTransaction.id, {
      title: editTitle,
      amount: Number(editAmount),
      category: editCategory,
      type: editType,
      date: editDate
    });
    setEditingTransaction(null);
  };

  // Sorting & Filtering Logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      const matchesType = selectedType === 'All' || t.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let valA = sortField === 'amount' ? a.amount : new Date(a.date).getTime();
      let valB = sortField === 'amount' ? b.amount : new Date(b.date).getTime();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="page-wrapper">
      {/* Smart Natural Language Box */}
      <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Smart Expense Natural Input
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Describe your transactions naturally. Our AI automatically extracts the title, price, and category.
        </p>
        
        <form onSubmit={handleNlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <textarea
              className="form-input"
              style={{
                width: '100%',
                paddingRight: '120px',
                height: '70px',
                fontSize: '1rem',
                lineHeight: '1.4',
                resize: 'none',
                borderRadius: 'var(--border-radius-md)'
              }}
              placeholder='e.g., "Spent ₹350 on starbucks coffee today" or "Earned 8500 from freelance coding"'
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleNlSubmit(e);
                }
              }}
            />
            
            {/* Quick Actions (Mic & Upload) aligned right inside textbox */}
            <div style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              {/* Mic Icon */}
              <button
                type="button"
                onClick={handleVoiceEntry}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isListening ? 'var(--danger)' : 'var(--bg-tertiary)',
                  color: isListening ? 'white' : 'var(--text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                title="Speak expense (Voice entry)"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {/* Bill OCR upload button */}
              <label style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isScanning ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: isScanning ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background 0.2s'
              }} title="Scan receipt (Simulate OCR)">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptScan}
                  style={{ display: 'none' }}
                  disabled={isScanning}
                />
              </label>
            </div>
          </div>

          {speechError && (
            <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: '600' }}>
              ⚠️ {speechError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>💡 Try: "Paid 1500 for college books"</span>
              <span>•</span>
              <span>"Earned 50000 salary"</span>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
              <Plus size={16} /> Record Transaction
            </button>
          </div>
        </form>

        {/* Scanner Loader overlay */}
        {isScanning && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px dashed var(--primary)',
            backgroundColor: 'var(--primary-glow)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              backgroundColor: 'var(--primary)',
              animation: 'ocrLaser 1.5s infinite linear'
            }} />
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--primary)' }}>
              🤖 OCR Neural Engine extracting invoice details...
            </span>
          </div>
        )}
      </div>

      {/* Ledger Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
        {/* Table Filters & Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '1.05rem' }}>Transaction Ledger</h3>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: '600px', justifyContent: 'flex-end' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px', width: '100%', paddingTop: '8px', paddingBottom: '8px' }}
                placeholder="Search description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input"
              style={{ paddingTop: '8px', paddingBottom: '8px' }}
            >
              <option value="All">All Types</option>
              <option value="income">Incomes</option>
              <option value="expense">Expenses</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
              style={{ paddingTop: '8px', paddingBottom: '8px' }}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-wrapper" style={{ flex: 1 }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '48px', textCenter: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
              No transactions match your search filters.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Date <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Expense Name</th>
                  <th>Category</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Amount <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} /> {t.date}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: t.type === 'income' ? 'var(--success)' : 'var(--danger)'
                        }} />
                        <span style={{ fontWeight: '600' }}>{t.title}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)'
                      }}>
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 'bold',
                        color: t.type === 'income' ? 'var(--success)' : 'var(--text-primary)'
                      }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrencyVal(t.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => openEditModal(t)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Edit transaction"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal Dialog */}
      {editingTransaction && (
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
          zIndex: 9999
        }}>
          <div className="card" style={{ width: '400px', padding: '24px', animation: 'slideUp 0.3s forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.05rem' }}>Edit Transaction</h3>
              <button 
                onClick={() => setEditingTransaction(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Transaction Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="form-input"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditingTransaction(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ocrLaser {
          0% { transform: translateY(0); }
          50% { transform: translateY(52px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Transactions;
