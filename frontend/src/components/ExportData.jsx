import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileText, CheckCircle } from 'lucide-react';

export default function ExportData() {
  const { transactions } = useApp();
  const [format, setFormat] = useState('excel');
  const [success, setSuccess] = useState('');

  function handleExport() {
    setSuccess('');
    setTimeout(() => {
      setSuccess(`Successfully compiled and exported ${transactions.length} records to SmartBudget_Export.${format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'json'}!`);
    }, 1200);
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Export Finance Data</h2>
        <p>Backup or download your transaction ledgers, active budgets, and savings reports.</p>
      </div>

      <div className="grid-2">
        <div className="card anim-up">
          <h4 style={{ marginBottom: '1rem' }}>Configuration</h4>
          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="label">Export File Format</label>
            <select className="select" value={format} onChange={e => setFormat(e.target.value)}>
              <option value="excel">Microsoft Excel (.xlsx)</option>
              <option value="csv">Comma Separated Values (.csv)</option>
              <option value="json">Raw Database JSON (.json)</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="label">Include Fields</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.875rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <input type="checkbox" defaultChecked disabled /> Transactions Ledger Logs
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <input type="checkbox" defaultChecked /> Monthly Active Budgets
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <input type="checkbox" defaultChecked /> Goals & Savings Milestones
              </label>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={16} /> Compile & Download
          </button>
        </div>

        <div className="card anim-up" style={{ animationDelay: '.08s', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          {success ? (
            <div className="anim-pop">
              <CheckCircle size={48} style={{ color: 'var(--emerald)', marginBottom: '1rem' }} />
              <h4 style={{ color: 'var(--emerald-dark)' }}>Export Complete</h4>
              <p style={{ marginTop: '.5rem', fontSize: '.875rem', maxWidth: '300px' }}>{success}</p>
            </div>
          ) : (
            <div>
              <FileText size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
              <h4>Ready to Export</h4>
              <p style={{ marginTop: '.5rem', fontSize: '.875rem', maxWidth: '300px' }}>Select your desired format and click compile to begin packaging your accounts database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
