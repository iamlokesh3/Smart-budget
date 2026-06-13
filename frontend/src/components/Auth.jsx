import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const { login, loginExisting, setPage } = useApp();
  const [tab, setTab] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (!form.name.trim()) return setError('Please enter your name.');
      if (!form.email.includes('@')) return setError('Please enter a valid email.');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
    } else {
      if (!form.email.includes('@')) return setError('Please enter a valid email.');
      if (!form.password) return setError('Please enter your password.');
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        if (tab === 'register') {
          const name = form.name;
          await login({
            id: Date.now().toString(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: form.email,
            joinedAt: new Date().toISOString(),
          }, true);
        } else {
          await loginExisting(form.email);
        }
      } catch (err) {
        setError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    }, 900);
  }

  return (
    <div className="auth-page">
      {/* Centered panel */}
      <div className="auth-right">
        <div className="auth-card anim-pop">
          <button className="btn btn-ghost btn-sm" style={{marginBottom:'1.5rem'}} onClick={() => setPage('landing')}>
            <ArrowLeft size={15}/> Back
          </button>

          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <div style={{width:48, height:48, borderRadius:'var(--radius-lg)', background:'linear-gradient(135deg, var(--blue), var(--emerald))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto .875rem'}}>
              <Sparkles size={22} color="#fff"/>
            </div>
            <h3>{tab === 'login' ? 'Welcome back' : 'Create account'}</h3>
            <p style={{fontSize:'.875rem', marginTop:'.25rem'}}>{tab === 'login' ? 'Sign in to your workspace' : 'Start your financial journey'}</p>
          </div>

          <div className="auth-tabs">
            {['login','register'].map(t => (
              <button key={t} className={`auth-tab ${tab===t?'active':''}`} onClick={() => { setTab(t); setError(''); }}>
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            {tab === 'register' && (
              <div className="input-group">
                <label className="label">Full Name</label>
                <div style={{position:'relative'}}>
                  <User size={16} style={{position:'absolute', left:'.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none'}}/>
                  <input className="input" style={{paddingLeft:'2.5rem'}} placeholder="Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)}/>
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="label">Email</label>
              <div style={{position:'relative'}}>
                <Mail size={16} style={{position:'absolute', left:'.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none'}}/>
                <input className="input" style={{paddingLeft:'2.5rem'}} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)}/>
              </div>
            </div>

            <div className="input-group">
              <label className="label">Password</label>
              <div style={{position:'relative'}}>
                <Lock size={16} style={{position:'absolute', left:'.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none'}}/>
                <input className="input" style={{paddingLeft:'2.5rem', paddingRight:'3rem'}} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)}/>
                <button type="button" style={{position:'absolute', right:'.875rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex'}} onClick={() => setShowPw(p=>!p)}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <div className="input-group">
                <label className="label">Confirm Password</label>
                <div style={{position:'relative'}}>
                  <Lock size={16} style={{position:'absolute', left:'.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none'}}/>
                  <input className="input" style={{paddingLeft:'2.5rem'}} type="password" placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)}/>
                </div>
              </div>
            )}

            {error && (
              <div style={{padding:'.75rem 1rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', color:'#b91c1c', fontSize:'.875rem'}}>
                {error}
              </div>
            )}

            <button className="btn btn-primary w-full" style={{marginTop:'.5rem', padding:'.875rem'}} disabled={loading}>
              {loading ? (
                <span style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                  <span style={{width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block'}}/>
                  {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (tab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{textAlign:'center', fontSize:'.8125rem', color:'var(--text-muted)', marginTop:'1.25rem'}}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button style={{background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontWeight:600, fontSize:'.8125rem'}} onClick={() => setTab(tab==='login'?'register':'login')}>
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
