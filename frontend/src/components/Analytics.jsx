import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { groupByCategory, groupByDay, groupByMonth } from '../utils/analytics';
import { getCategoryMeta } from '../utils/aiParser';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f97316','#ec4899','#06b6d4','#84cc16','#f59e0b','#14b8a6','#64748b'];

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'.75rem 1rem', boxShadow:'var(--shadow-md)', fontSize:'.875rem'}}>
      <p style={{fontWeight:600, marginBottom:'.25rem'}}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{color: p.color || 'var(--blue)'}}>
          {currency}{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { transactions, currency, renameCategory } = useApp();
  const [editCategoryName, setEditCategoryName] = useState(null);
  const [renameInputValue, setRenameInputValue] = useState('');
  const cur = currency || '₹';

  if (transactions.length < 3) {
    return (
      <div className="page-content anim-fade">
        <div className="page-header">
          <h2>Analytics</h2>
          <p>Charts and insights generated from your actual spending data.</p>
        </div>
        <div className="empty-state card">
          <div style={{fontSize:'3.5rem'}}>📊</div>
          <h3>No analytics available yet</h3>
          <p>Add at least 3 transactions to unlock charts and insights. All charts are generated dynamically from your own categories.</p>
        </div>
      </div>
    );
  }

  const categoryData = groupByCategory(transactions);
  const dailyData    = groupByDay(transactions, 14);
  const monthlyData  = groupByMonth(transactions);
  const totalSpent   = transactions.reduce((s, t) => s + t.amount, 0);

  function startRename(catName) {
    setEditCategoryName(catName);
    setRenameInputValue(catName);
  }

  function handleSaveRename(oldName) {
    if (!renameInputValue.trim()) return;
    const newName = renameInputValue.trim();
    const meta = getCategoryMeta(newName);
    renameCategory(oldName, newName, meta.icon, meta.color);
    setEditCategoryName(null);
    setRenameInputValue('');
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Dynamic charts generated from your {transactions.length} entries across {categoryData.length} categories.</p>
      </div>

      {/* Summary strip */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'1rem', marginBottom:'1.5rem'}}>
        {[
          { label: 'Total Spent', value: `${cur}${totalSpent.toLocaleString('en-IN')}`, color: 'var(--blue)' },
          { label: 'Avg / Entry', value: `${cur}${(totalSpent / transactions.length).toLocaleString('en-IN', {maximumFractionDigits:0})}`, color: 'var(--emerald)' },
          { label: 'Top Category', value: categoryData[0]?.name || '—', color: '#8b5cf6' },
          { label: 'Categories', value: categoryData.length, color: '#f97316' },
        ].map((s, i) => (
          <div key={i} className="card anim-up" style={{textAlign:'center', animationDelay:`${i*.07}s`}}>
            <div style={{fontSize:'1.25rem', fontWeight:800, color: s.color}}>{s.value}</div>
            <div style={{fontSize:'.8rem', color:'var(--text-muted)', marginTop:'.2rem'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Daily spending line chart */}
      <div className="chart-wrapper anim-up" style={{marginBottom:'1.5rem'}}>
        <h4 style={{marginBottom:'1rem'}}>Daily Spending (Last 14 Days)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="date" tick={{fontSize:11, fill:'var(--text-muted)'}} tickLine={false}/>
            <YAxis tick={{fontSize:11, fill:'var(--text-muted)'}} tickLine={false} axisLine={false} tickFormatter={v => `${cur}${v}`}/>
            <Tooltip content={<CustomTooltip currency={cur}/>}/>
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} dot={{fill:'#3b82f6', r:3}} activeDot={{r:5}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category pie + bar */}
      <div className="grid-2" style={{marginBottom:'1.5rem'}}>
        <div className="chart-wrapper anim-up" style={{animationDelay:'.1s'}}>
          <h4 style={{marginBottom:'1rem'}}>Spending by Category</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip currency={cur}/>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper anim-up" style={{animationDelay:'.15s'}}>
          <h4 style={{marginBottom:'1rem'}}>Category Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:11, fill:'var(--text-muted)'}} tickLine={false} tickFormatter={v => `${cur}${v}`}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:11, fill:'var(--text-muted)'}} tickLine={false} axisLine={false} width={80}/>
              <Tooltip content={<CustomTooltip currency={cur}/>}/>
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly trend */}
      {monthlyData.length > 1 && (
        <div className="chart-wrapper anim-up" style={{animationDelay:'.2s'}}>
          <h4 style={{marginBottom:'1rem'}}>Monthly Spending Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{fontSize:11, fill:'var(--text-muted)'}} tickLine={false}/>
              <YAxis tick={{fontSize:11, fill:'var(--text-muted)'}} tickLine={false} axisLine={false} tickFormatter={v => `${cur}${v}`}/>
              <Tooltip content={<CustomTooltip currency={cur}/>}/>
              <Bar dataKey="amount" fill="#10b981" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category detail table */}
      <div className="card anim-up" style={{marginTop:'1.5rem', animationDelay:'.25s'}}>
        <h4 style={{marginBottom:'1rem'}}>Category Details</h4>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Entries</th>
              <th style={{textAlign:'right'}}>Total</th>
              <th style={{textAlign:'right'}}>% of spend</th>
              <th style={{textAlign:'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((cat, i) => (
              <tr key={cat.name}>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                    <span style={{width:10, height:10, borderRadius:'50%', background: COLORS[i % COLORS.length], flexShrink:0, display:'inline-block'}}/>
                    <span style={{fontSize:'1.1rem'}}>{cat.icon}</span>
                    {editCategoryName === cat.name ? (
                      <div style={{display:'flex', gap:'.5rem', alignItems:'center'}}>
                        <input
                          className="input"
                          style={{padding:'.2rem .5rem', fontSize:'.875rem', height:'auto', width:'130px'}}
                          value={renameInputValue}
                          onChange={e => setRenameInputValue(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => handleSaveRename(cat.name)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--emerald)'}}><Check size={15}/></button>
                        <button onClick={() => setEditCategoryName(null)} style={{border:'none', background:'none', cursor:'pointer', color:'var(--danger)'}}><X size={15}/></button>
                      </div>
                    ) : (
                      <span style={{textTransform:'capitalize', fontWeight:500}}>{cat.name}</span>
                    )}
                  </div>
                </td>
                <td style={{color:'var(--text-muted)'}}>{cat.count}</td>
                <td style={{textAlign:'right', fontWeight:700}}>{cur}{cat.value.toLocaleString('en-IN')}</td>
                <td style={{textAlign:'right', color:'var(--text-muted)'}}>
                  {((cat.value / totalSpent) * 100).toFixed(1)}%
                </td>
                <td style={{textAlign:'center'}}>
                  {editCategoryName !== cat.name && (
                    <button className="btn-icon" style={{width:'1.75rem', height:'1.75rem'}} onClick={() => startRename(cat.name)} title="Rename Category">
                      <Edit2 size={12}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
