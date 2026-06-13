import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Shield, Zap, MessageSquare, Target, BarChart3, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  { icon: <Sparkles size={22}/>, label: 'blue', title: 'AI-Powered Insights', desc: 'Get personalized financial advice powered by intelligent algorithms that learn from your spending patterns.' },
  { icon: <MessageSquare size={22}/>, label: 'emerald', title: 'Natural Language Entry', desc: 'Just type "Spent ₹300 on pizza" — AI automatically extracts and categorizes your expenses.' },
  { icon: <Target size={22}/>, label: 'purple', title: 'Smart Goal Tracking', desc: 'Set savings goals and watch AI calculate your estimated completion date based on spending trends.' },
  { icon: <BarChart3 size={22}/>, label: 'orange', title: 'Dynamic Analytics', desc: 'Charts and reports that grow with your data — completely empty until you have something meaningful to show.' },
  { icon: <TrendingUp size={22}/>, label: 'teal', title: 'Spending Prediction', desc: 'AI forecasts your next month\'s spending based on your patterns, helping you plan ahead.' },
  { icon: <Shield size={22}/>, label: 'pink', title: 'Financial Health Score', desc: 'A dynamically computed score that reflects your real financial health — no fake numbers, ever.' },
];

const steps = [
  { title: 'Create Your Account', desc: 'Sign up in seconds. No credit card, no setup fees. Your financial workspace starts completely empty.' },
  { title: 'Add Your First Entry', desc: 'Type naturally: "Spent ₹500 on groceries". AI extracts the amount and creates categories automatically.' },
  { title: 'Set Budgets & Goals', desc: 'Create custom budgets and savings goals. Progress bars appear only when you have real data.' },
  { title: 'Get AI Guidance', desc: 'Chat with your AI advisor anytime. Ask about spending, affordability, or get personalized saving tips.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer', avatar: 'PS', color: '#3b82f6', stars: 5, text: 'Finally an expense tracker that doesn\'t show fake demo data. Smart Budget\'s AI advisor helped me save ₹8,000 in my first month.' },
  { name: 'Rahul Gupta', role: 'Freelance Designer', avatar: 'RG', color: '#10b981', stars: 5, text: 'The natural language input is a game-changer. I just type what I spent and it handles everything. No more boring category dropdowns!' },
  { name: 'Ananya Patel', role: 'MBA Student', avatar: 'AP', color: '#8b5cf6', stars: 5, text: 'The AI chatbot actually understands my financial situation and gives relevant advice. It\'s like having a personal CFO in my pocket.' },
];

const demoMessages = [
  { role: 'user', text: 'How much did I spend this month?' },
  { role: 'bot', text: 'You\'ve spent ₹12,450 this month — your biggest category is Food at ₹4,200. You\'re on track with your budget! 🎉' },
  { role: 'user', text: 'Can I afford a ₹45,000 laptop?' },
  { role: 'bot', text: 'Based on your savings rate of ₹3,200/month, you could afford it in about 14 months. Want me to create a savings goal for it?' },
];

export default function Landing() {
  const { setPage } = useApp();
  const [activeDemo, setActiveDemo] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveDemo(p => (p + 1) % demoMessages.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-nav-logo-icon"><Zap size={14}/></div>
          Smart<span>Budget</span>
        </div>
        <div className="landing-nav-links">
          {['Features', 'How It Works', 'AI Demo', 'Testimonials'].map(l => (
            <a key={l} className="landing-nav-link" href={`#${l.toLowerCase().replace(/ /g,'-')}`}>{l}</a>
          ))}
        </div>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setPage('auth')}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage('auth')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"/>
        <h1 className="anim-up">Your Personal AI<br/>Financial Advisor</h1>
        <p className="anim-up delay-1">Track expenses naturally, receive intelligent financial guidance, and achieve your goals with AI.</p>
        <div className="hero-buttons anim-up delay-2">
          <button className="btn btn-primary btn-xl" onClick={() => setPage('auth')}>
            Get Started <ChevronRight size={18}/>
          </button>
          <button className="btn btn-ghost btn-xl" onClick={() => setPage('auth')}>Login</button>
        </div>

        {/* Browser mockup */}
        <div className="hero-preview anim-up delay-3">
          <div className="hero-preview-bar">
            <div className="hero-dot" style={{background:'#ef4444'}}/>
            <div className="hero-dot" style={{background:'#f59e0b'}}/>
            <div className="hero-dot" style={{background:'#10b981'}}/>
            <div style={{flex:1, height:20, background:'var(--border)', borderRadius:4, marginLeft:8, maxWidth:200}}/>
          </div>
          <div style={{padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', minHeight:200}}>
            <div style={{display:'flex', gap:'1rem'}}>
              {['₹12,450', '₹8,200', '92%'].map((v, i) => (
                <div key={i} style={{flex:1, padding:'1rem', background:'var(--bg-subtle)', borderRadius:'var(--radius-md)', textAlign:'center'}}>
                  <div style={{fontSize:'1.25rem', fontWeight:800, color: i===0?'var(--blue)':i===1?'var(--emerald)':'var(--text-primary)'}}>{v}</div>
                  <div style={{fontSize:'.75rem', color:'var(--text-muted)', marginTop:4}}>{['This Month','Saved','Health Score'][i]}</div>
                </div>
              ))}
            </div>
            <div style={{height:80, background:'var(--bg-subtle)', borderRadius:'var(--radius-md)', position:'relative', overflow:'hidden'}}>
              <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity=".3"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,60 C40,50 80,30 120,35 S200,55 240,40 S320,20 360,25 L400,20 L400,80 L0,80Z" fill="url(#lg)"/>
                <path d="M0,60 C40,50 80,30 120,35 S200,55 240,40 S320,20 360,25 L400,20" fill="none" stroke="#3b82f6" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features" style={{background:'var(--bg-subtle)'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div className="section-center">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything you need, nothing you don't</h2>
            <p className="section-sub">Built for people who want real insights, not demo data.</p>
          </div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="feature-card anim-up" style={{animationDelay: `${i*.08}s`}}>
                <div className={`feature-icon ${f.label}`}>{f.icon}</div>
                <h3 style={{marginBottom:'.5rem'}}>{f.title}</h3>
                <p style={{fontSize:'.9375rem'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div style={{maxWidth:800, margin:'0 auto'}}>
          <div className="section-center">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Start in 4 simple steps</h2>
            <p className="section-sub" style={{marginBottom:'3rem'}}>Zero friction. No setup wizard. Just start.</p>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'1.75rem'}}>
            {steps.map((s, i) => (
              <div key={i} className="step-card card anim-up" style={{animationDelay:`${i*.1}s`}}>
                <div className="step-num">{i+1}</div>
                <div>
                  <h3 style={{marginBottom:'.375rem'}}>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo */}
      <section className="section" id="ai-demo" style={{background:'var(--bg-subtle)'}}>
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div className="section-center">
            <div className="section-label">AI Demo</div>
            <h2 className="section-title">See the AI advisor in action</h2>
            <p className="section-sub">Ask anything. Get personalized, data-driven answers.</p>
          </div>
          <div className="ai-demo-container">
            <div className="ai-demo-header">
              <div style={{width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem'}}>🤖</div>
              <div>
                <div style={{fontWeight:700}}>Smart Budget AI</div>
                <div style={{fontSize:'.75rem', opacity:.85}}>● Online • Personalized advice</div>
              </div>
            </div>
            <div className="ai-demo-messages">
              {demoMessages.slice(0, activeDemo + 1).map((m, i) => (
                <div key={i} className={`ai-msg ${m.role} anim-up`}>
                  {m.role === 'bot' && <div style={{width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue),var(--emerald))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', flexShrink:0}}>🤖</div>}
                  <div className="ai-msg-bubble">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="testimonials">
        <div style={{maxWidth:1100, margin:'0 auto'}}>
          <div className="section-center">
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">Loved by thousands</h2>
            <p className="section-sub">Real users, real results — no fake reviews.</p>
          </div>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card anim-up" style={{animationDelay:`${i*.1}s`}}>
                <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
                <p style={{color:'var(--text-primary)', fontSize:'.9375rem', lineHeight:1.7}}>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{background:t.color}}>{t.avatar}</div>
                  <div>
                    <div style={{fontWeight:600, fontSize:'.9rem'}}>{t.name}</div>
                    <div style={{fontSize:'.8rem', color:'var(--text-muted)'}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'5rem 2rem', background:'linear-gradient(135deg, var(--blue-dark), #1e3a8a)', textAlign:'center'}}>
        <h2 style={{color:'#fff', marginBottom:'1rem'}}>Ready to take control of your finances?</h2>
        <p style={{color:'rgba(255,255,255,.75)', marginBottom:'2rem', fontSize:'1.0625rem'}}>Join thousands who've transformed their financial habits with AI.</p>
        <button className="btn btn-xl" style={{background:'#fff', color:'var(--blue-dark)', fontWeight:700}} onClick={() => setPage('auth')}>
          Start for Free <ChevronRight size={18}/>
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem', marginBottom:'.75rem'}}>
          <div className="landing-nav-logo-icon"><Zap size={13}/></div>
          <span style={{fontWeight:700, color:'var(--text-primary)'}}>Smart<span style={{color:'var(--blue)'}}>Budget</span></span>
        </div>
        <p style={{fontSize:'.875rem', color:'var(--text-muted)'}}>© 2025 SmartBudget. Built with ❤️ for smarter finances.</p>
      </footer>
    </div>
  );
}
