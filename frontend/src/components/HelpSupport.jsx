import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Send, Check } from 'lucide-react';

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [msgSent, setMsgSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const faqs = [
    {
      q: 'How does the AI Financial Advisor parse entries?',
      a: 'The Smart Entries page uses natural language processing. For example, typing "Spent ₹400 on lunch yesterday" will automatically extract an expense of ₹400 under category "Food" on yesterday\'s date.',
    },
    {
      q: 'What is the Financial Health Score?',
      a: 'It is a proprietary metric calculated based on your budget compliance rate, saving-to-income ratio, and transaction consistency. A score above 80 indicates excellent financial habits.',
    },
    {
      q: 'Can I export my transaction data?',
      a: 'Yes, go to the Export Data screen to download all your records in Excel (.xlsx), CSV, or JSON format.',
    },
  ];

  function handleSend(e) {
    e.preventDefault();
    if (!form.message) return;
    setMsgSent(true);
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Help & Support Hub</h2>
        <p>Get answers to common questions or reach out to our team for assistance.</p>
      </div>

      <div className="grid-2">
        {/* FAQs */}
        <div className="card anim-up">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <HelpCircle size={20} style={{ color: 'var(--blue)' }} /> Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '.5rem 0',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', padding: '.25rem 0 .5rem', lineHeight: 1.5 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div className="card anim-up" style={{ animationDelay: '.08s' }}>
          {msgSent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }} className="anim-pop">
              <Check size={48} style={{ color: 'var(--emerald)', marginBottom: '1rem' }} />
              <h4>Message Sent!</h4>
              <p style={{ fontSize: '.875rem', marginTop: '.5rem' }}>Our team will review your message and reply via email within 24 hours.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem' }} onClick={() => setMsgSent(false)}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>Contact Us</h3>
              <div className="input-group">
                <label className="label">Name</label>
                <input className="input" placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="label">Message</label>
                <textarea className="input" rows="4" placeholder="How can we help you?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
              </div>
              <div>
                <button className="btn btn-primary" type="submit">
                  <Send size={15} /> Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
