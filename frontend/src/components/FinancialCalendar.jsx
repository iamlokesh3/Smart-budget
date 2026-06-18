import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';

export default function FinancialCalendar() {
  const { transactions, currency } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Map transactions to dates
  const dailyTotals = {};
  transactions.forEach(t => {
    if (t.date) {
      const day = new Date(t.date).getDate();
      const txMonth = new Date(t.date).getMonth();
      const txYear = new Date(t.date).getFullYear();

      if (txMonth === month && txYear === year) {
        if (!dailyTotals[day]) dailyTotals[day] = { income: 0, expense: 0 };
        if (t.type === 'income') dailyTotals[day].income += Number(t.amount);
        else dailyTotals[day].expense += Number(t.amount);
      }
    }
  });

  const cells = [];
  // Empty space for offset
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} style={{ minHeight: '80px', border: '1px solid var(--border)' }} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const total = dailyTotals[d] || { income: 0, expense: 0 };
    cells.push(
      <div key={`day-${d}`} style={{ minHeight: '80px', border: '1px solid var(--border)', padding: '.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{d}</div>
        <div style={{ fontSize: '.7rem', display: 'flex', flexDirection: 'column', gap: '.1rem' }}>
          {total.income > 0 && <span style={{ color: 'var(--emerald-dark)', fontWeight: 700 }}>+{currency}{total.income}</span>}
          {total.expense > 0 && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>-{currency}{total.expense}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Financial Calendar</h2>
          <p>Track your past cash flows and scheduled payments on a calendar layout.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={prevMonth}><ArrowLeft size={16} /></button>
          <h4 style={{ minWidth: '120px', textAlign: 'center' }}>{monthNames[month]} {year}</h4>
          <button className="btn-icon" onClick={nextMonth}><ArrowRight size={16} /></button>
        </div>
      </div>

      <div className="card anim-up">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 700, borderBottom: '2px solid var(--border)', paddingBottom: '.5rem', marginBottom: '.5rem', fontSize: '.875rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => <div key={w}>{w}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells}
        </div>
      </div>
    </div>
  );
}
