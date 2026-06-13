import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, X, MessageSquare, Trash2, Plus, Bot } from 'lucide-react';
import { generateResponse, SUGGESTED_PROMPTS } from '../utils/chatEngine';
import { useApp } from '../context/AppContext';

function TypingIndicator() {
  return (
    <div className="chat-msg bot">
      <div className="chat-msg-avatar"><Bot size={14}/></div>
      <div className="chat-msg-bubble">
        <div className="typing-indicator">
          <div className="typing-dot"/>
          <div className="typing-dot"/>
          <div className="typing-dot"/>
        </div>
      </div>
    </div>
  );
}

function ChatInterface({ onClose, isFullPage, promptTrigger, onPromptTriggered }) {
  const { chatHistory, addChatMessage, clearChat, transactions, budgets, goals, user } = useApp();
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const context = useMemo(() => ({ transactions, budgets, goals, user }), [transactions, budgets, goals, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, typing]);

  const send = useCallback((text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', text: text.trim(), time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) };
    addChatMessage(userMsg);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const botText = generateResponse(text, context);
      addChatMessage({ id: (Date.now()+1).toString(), role: 'bot', text: botText, time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) });
    }, 600 + Math.random() * 400);
  }, [addChatMessage, context]);

  useEffect(() => {
    if (promptTrigger) {
      Promise.resolve().then(() => {
        send(promptTrigger);
      });
      onPromptTriggered?.();
    }
  }, [promptTrigger, send, onPromptTriggered]);

  // Welcome message
  const messages = chatHistory.length === 0
    ? [{ id: 'welcome', role: 'bot', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your Smart Budget AI advisor. How can I help you today?`, time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) }]
    : chatHistory;

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  function renderText(text) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((p, j) => p.startsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p)}
          {i < text.split('\n').length - 1 && <br/>}
        </span>
      );
    });
  }

  const showSuggestions = chatHistory.length === 0;

  return (
    <div className={isFullPage ? 'chat-main-panel' : 'chat-window'}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-bot-avatar">🤖</div>
          <div>
            <div style={{fontWeight:700, fontSize:'.9375rem'}}>Smart Budget AI</div>
            <div className="chat-status">
              <div className="chat-status-dot"/>
              Always available
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap:'.5rem'}}>
          {chatHistory.length > 0 && (
            <button onClick={clearChat} title="Clear chat" style={{background:'rgba(255,255,255,.15)', border:'none', borderRadius:'var(--radius-full)', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff'}}>
              <Trash2 size={14}/>
            </button>
          )}
          {onClose && (
            <button onClick={onClose} style={{background:'rgba(255,255,255,.15)', border:'none', borderRadius:'var(--radius-full)', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff'}}>
              <X size={16}/>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            {msg.role === 'bot' && <div className="chat-msg-avatar" style={{background:'linear-gradient(135deg,var(--blue),var(--emerald))', color:'#fff'}}><Bot size={12}/></div>}
            <div>
              <div className={`chat-msg-bubble`}>{renderText(msg.text)}</div>
              <div className={`chat-msg-time`} style={{textAlign: msg.role === 'user' ? 'right' : 'left'}}>{msg.time}</div>
            </div>
            {msg.role === 'user' && (
              <div className="chat-msg-avatar" style={{background:'linear-gradient(135deg,#64748b,#475569)', color:'#fff', fontSize:'.75rem'}}>
                You
              </div>
            )}
          </div>
        ))}
        {typing && <TypingIndicator/>}
        <div ref={bottomRef}/>
      </div>

      {/* Suggested prompts */}
      {showSuggestions && (
        <div className="chat-suggestions">
          {SUGGESTED_PROMPTS.slice(0, 4).map(p => (
            <button key={p} className="chat-suggest-btn" onClick={() => send(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          rows={1}
          placeholder="Ask me about your finances…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-btn" onClick={() => send(input)} disabled={!input.trim()}>
          <Send size={15}/>
        </button>
      </div>
    </div>
  );
}

// Floating chat widget
export function ChatFAB() {
  const { chatOpen, setChatOpen, chatHistory } = useApp();
  const unread = chatHistory.length === 0 ? 1 : 0;

  return (
    <>
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} title="AI Advisor">
        {chatOpen ? <X size={22}/> : <MessageSquare size={22}/>}
        {!chatOpen && unread > 0 && <span className="chat-fab-badge">{unread}</span>}
      </button>
      {chatOpen && <ChatInterface onClose={() => setChatOpen(false)}/>}
    </>
  );
}

// Full page chat
export default function Chatbot() {
  const { clearChat, chatHistory } = useApp();
  const [promptTrigger, setPromptTrigger] = useState(null);

  return (
    <div className="page-content anim-fade" style={{padding:0, maxWidth:'none'}}>
      <div style={{display:'grid', gridTemplateColumns:'280px 1fr', height:'calc(100vh - 64px)'}}>
        {/* History sidebar */}
        <div className="chat-history-panel">
          <div style={{padding:'1.25rem', borderBottom:'1px solid var(--border)'}}>
            <h4 style={{marginBottom:'.25rem'}}>AI Advisor</h4>
            <p style={{fontSize:'.8125rem'}}>Chat with your financial AI</p>
          </div>
          <div style={{padding:'1rem'}}>
            <button className="btn btn-primary w-full btn-sm" style={{marginBottom:'1rem'}} onClick={clearChat}>
              <Plus size={14}/> New Chat
            </button>
            <div style={{padding:'.75rem', background:'var(--bg-subtle)', borderRadius:'var(--radius-md)', fontSize:'.875rem', color:'var(--text-muted)', textAlign:'center'}}>
              {chatHistory.length > 0 ? 'Active conversation in progress' : 'Chat history is empty'}
            </div>
          </div>

          {/* Suggested prompts */}
          <div style={{padding:'0 1rem'}}>
            <div style={{fontSize:'.75rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'.75rem'}}>Suggested Prompts</div>
            {SUGGESTED_PROMPTS.map(p => (
              <div key={p} style={{padding:'.6rem .75rem', borderRadius:'var(--radius-md)', fontSize:'.8125rem', color:'var(--text-secondary)', cursor:'pointer', transition:'background .15s', marginBottom:'.25rem'}}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setPromptTrigger(p)}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <ChatInterface isFullPage promptTrigger={promptTrigger} onPromptTriggered={() => setPromptTrigger(null)}/>
      </div>
    </div>
  );
}
