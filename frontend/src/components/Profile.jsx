import { useState } from 'react';
import { Camera, Check, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, logout, login } = useApp();
  const [form, setForm]   = useState({ name: user?.name || '', email: user?.email || '' });
  const [pw, setPw]       = useState({ current: '', newPw: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  function handleSave(e) {
    e.preventDefault();
    login({ ...user, name: form.name, email: form.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePw(e) {
    e.preventDefault();
    if (pw.newPw.length < 6) return setPwMsg('Password must be at least 6 characters.');
    if (pw.newPw !== pw.confirm) return setPwMsg('Passwords do not match.');
    setPwMsg('✅ Password changed successfully!');
    setPw({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwMsg(''), 3000);
  }

  const initial = user?.name?.charAt(0).toUpperCase() || '?';
  const joined  = user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) : '—';

  return (
    <div className="page-content anim-fade">
      <div className="page-header">
        <h2>Profile</h2>
        <p>Manage your account information and password.</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'1.5rem'}}>
        {/* Profile info */}
        <div className="card anim-up">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-big">{initial}</div>
            <div className="profile-avatar-edit" title="Change photo"><Camera size={14}/></div>
          </div>
          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <h3>{user?.name}</h3>
            <p style={{fontSize:'.875rem'}}>{user?.email}</p>
            <span className="badge badge-emerald" style={{marginTop:'.5rem'}}>Member since {joined}</span>
          </div>

          <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div className="input-group">
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}/>
            </div>
            <div className="input-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}/>
            </div>
            <button className="btn btn-primary" type="submit">
              {saved ? <><Check size={15}/> Saved!</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
          <div className="card anim-up" style={{animationDelay:'.1s'}}>
            <h4 style={{marginBottom:'1.25rem'}}>Change Password</h4>
            <form onSubmit={handlePw} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              {['current', 'newPw', 'confirm'].map((field, i) => (
                <div className="input-group" key={field}>
                  <label className="label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
                  <input className="input" type="password" placeholder="••••••••" value={pw[field]} onChange={e => setPw(p => ({...p, [field]: e.target.value}))}/>
                </div>
              ))}
              {pwMsg && (
                <div style={{padding:'.75rem', borderRadius:'var(--radius-md)', background: pwMsg.startsWith('✅') ? 'var(--emerald-light)' : '#fef2f2', color: pwMsg.startsWith('✅') ? 'var(--emerald-dark)' : 'var(--danger)', fontSize:'.875rem'}}>
                  {pwMsg}
                </div>
              )}
              <button className="btn btn-ghost" type="submit">Update Password</button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="card anim-up" style={{animationDelay:'.15s', border:'1px solid #fecaca'}}>
            <h4 style={{color:'var(--danger)', marginBottom:'.75rem'}}>Account</h4>
            <p style={{fontSize:'.875rem', marginBottom:'1rem'}}>Sign out of your Smart Budget account.</p>
            <button className="btn" style={{background:'#fef2f2', color:'var(--danger)', border:'1px solid #fecaca', width:'100%'}} onClick={logout}>
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
