import React, { useState, useEffect } from 'react';
import { RefreshCw, MessageSquare, Settings, Save, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS } from '../constants';

interface ChatMessage {
  role: string;
  text: string;
  timestamp: number;
}

interface AppSettings {
  chatBotEnabled: boolean;
  performanceModeDefault: boolean;
  maintenanceMode: boolean;
  liveStatus: string;
  accentColor: string;
  avatarUrl?: string;
  hiddenProjects: string[]; // For later use
  systemPrompt: string;
}

export default function Admin() {
  const [sessions, setSessions] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<string, boolean>>({});

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{type: 'idle'|'loading'|'success'|'error', msg: string}>({type: 'idle', msg: ''});
  
  // Settings state
  const [activeTab, setActiveTab] = useState<'chats' | 'settings'>('chats');
  const [settings, setSettings] = useState<AppSettings>({
    chatBotEnabled: true,
    performanceModeDefault: false,
    maintenanceMode: false,
    liveStatus: '',
    accentColor: '#FFB59D',
    hiddenProjects: [],
    systemPrompt: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/chats');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok) {
          setSessions(data.sessions || {});
        } else {
          console.error("API error:", data);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON, received:", text.substring(0, 100));
      }
    } catch (e) {
      console.error("Network error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok && data) {
          setSettings(data);
        }
      } catch (e) {
        console.error("Failed to fetch settings");
      }
    } catch (e) {
      console.error("Network error:", e);
    }
  };

  const handleSendReply = async (sessionId: string) => {
    const text = replyText[sessionId];
    if (!text?.trim()) return;

    setSendingReply(prev => ({ ...prev, [sessionId]: true }));
    try {
      const res = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text.trim() })
      });
      
      if (res.ok) {
        setReplyText(prev => ({ ...prev, [sessionId]: '' }));
        fetchChats();
      }
    } catch (e) {
      console.error("Failed to send reply", e);
    } finally {
      setSendingReply(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/admin/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(s => ({ ...s, avatarUrl: data.avatarUrl }));
        } else {
          alert('Failed to upload image.');
        }
      } catch (err) {
        alert('Network error during upload.');
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
      fetchSettings();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchChats, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const text = await res.text();
        let data = { error: 'Incorrect password' };
        try {
          data = JSON.parse(text);
        } catch (e) {}
        setLoginError(data.error || 'Incorrect password');
      }
    } catch (e) {
      setLoginError('Failed to authenticate');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return;
    setPasswordChangeStatus({ type: 'loading', msg: '' });
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) {
        setPasswordChangeStatus({ type: 'success', msg: 'Password updated successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordChangeStatus({ type: 'idle', msg: '' }), 3000);
      } else {
        const text = await res.text();
        let data = { error: 'Failed to update password' };
        try {
          data = JSON.parse(text);
        } catch(e){}
        setPasswordChangeStatus({ type: 'error', msg: data.error || 'Failed to update password' });
      }
    } catch (e) {
      setPasswordChangeStatus({ type: 'error', msg: 'Network error occurred' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal text-ink flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-charcoal-warm/80 backdrop-blur-md border border-pencil-light/20 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 text-accent">
            <Settings size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2 font-hand text-ink">Admin Portal</h2>
          <p className="text-ink-dim text-sm mb-8">Enter your credentials to access the portfolio dashboard.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal border border-pencil-light/20 rounded-xl px-4 py-3 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-ink-dim/50"
              />
              {loginError && <div className="text-red-400 text-xs px-2 mt-1">{loginError}</div>}
            </div>
            <button type="submit" disabled={!password} className="bg-accent text-charcoal font-bold rounded-xl px-4 py-3.5 hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-ink p-4 md:p-8 overflow-y-auto relative">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto space-y-10 pb-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-pencil-light/10 pb-8">
          <div>
            <h1 className="text-4xl font-hand font-bold text-ink flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Settings size={20} />
              </span>
              Dashboard
            </h1>
            <p className="text-ink-dim mt-2 max-w-xl text-sm">Manage incoming conversations and tune your portfolio's settings, AI persona, and visibility rules.</p>
          </div>
          
          <div className="flex items-center w-full md:w-auto p-1.5 bg-charcoal-warm/50 border border-pencil-light/10 rounded-2xl shadow-inner relative">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap z-10 ${activeTab === 'chats' ? 'text-charcoal font-bold' : 'text-ink-dim hover:text-ink'}`}
            >
              {activeTab === 'chats' && (
                <motion.div layoutId="admin-tab-bg" className="absolute inset-0 bg-accent rounded-xl -z-10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <MessageSquare size={16} />
              Conversations
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap z-10 ${activeTab === 'settings' ? 'text-charcoal font-bold' : 'text-ink-dim hover:text-ink'}`}
            >
              {activeTab === 'settings' && (
                <motion.div layoutId="admin-tab-bg" className="absolute inset-0 bg-accent rounded-xl -z-10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <Settings size={16} />
              Configuration
            </button>
          </div>
        </div>

        {activeTab === 'chats' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ink">Recent Sessions</h2>
              <button 
                onClick={fetchChats}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal-warm rounded-full border border-pencil-light/20 hover:bg-charcoal hover:text-accent transition-all text-sm font-medium shadow-sm"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Sync Logs
              </button>
            </div>
            {Object.keys(sessions).length === 0 ? (
              <div className="text-center py-32 bg-charcoal-warm/50 border border-pencil-light/10 rounded-3xl">
                <MessageSquare size={48} className="mx-auto mb-4 text-pencil-light/30" />
                <p className="text-ink-dim">No conversations recorded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(sessions).map(([sessionId, messages]) => (
                  <div key={sessionId} className="bg-charcoal-warm/50 border border-pencil-light/10 rounded-3xl p-6 flex flex-col h-[550px] shadow-sm transform transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-pencil-light/10">
                      <div>
                        <h3 className="font-mono text-sm text-ink-dim">SESSION ID</h3>
                        <div className="font-mono text-sm text-accent font-bold mt-1">{sessionId.substring(0, 12)}...</div>
                      </div>
                      <div className="px-3 py-1 bg-pencil-light/10 rounded-full text-xs font-bold text-ink-dim">
                        {messages.length} msgs
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 space-y-5 no-scrollbar bg-charcoal/50 rounded-t-2xl p-4 border border-pencil-light/5 border-b-0">
                      {messages.map((msg, i) => (
                        <div 
                          key={i} 
                          className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-start items-start' : 'self-end items-end'}`}
                        >
                          <span className={`text-[0.65rem] mb-1.5 px-1 font-bold tracking-wider ${msg.role === 'user' ? 'text-ink-dim' : 'text-accent'}`}>
                            {msg.role === 'user' ? 'VISITOR' : msg.role === 'admin' ? 'REAL AAYU' : 'AAYU AI'}
                          </span>
                          <div className={`px-5 py-3.5 text-[0.95rem] leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-paper text-charcoal rounded-3xl rounded-tl-sm'
                              : msg.role === 'admin'
                                ? 'bg-accent/20 border border-accent/40 text-ink rounded-3xl rounded-tr-sm ring-1 ring-accent/30'
                                : 'bg-accent/15 border border-accent/20 text-ink rounded-3xl rounded-tr-sm' 
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[0.6rem] text-ink-dim/50 mt-1.5 px-1 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-3 bg-charcoal/30 border border-pencil-light/10 rounded-b-2xl border-t shadow-inner flex gap-2">
                      <input 
                        type="text" 
                        value={replyText[sessionId] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [sessionId]: e.target.value }))}
                        placeholder="Interject as Real Aayu..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendReply(sessionId);
                        }}
                        className="flex-1 bg-charcoal border border-pencil-light/20 rounded-xl px-4 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-ink-dim/50"
                      />
                      <button 
                        onClick={() => handleSendReply(sessionId)}
                        disabled={!replyText[sessionId]?.trim() || sendingReply[sessionId]}
                        className="w-10 h-10 shrink-0 bg-accent text-charcoal rounded-xl flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 disabled:bg-charcoal disabled:text-ink-dim border border-transparent disabled:border-pencil-light/20 transition-all"
                      >
                        {sendingReply[sessionId] ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-3xl pb-20">
            
            <div className="space-y-8 bg-charcoal-warm/50 border border-pencil-light/10 rounded-3xl p-8 lg:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-ink border-b border-pencil-light/10 pb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Settings size={16} />
                </span>
                Site Controls
              </h2>
              
              <div className="space-y-6">
                <div 
                  className="flex items-center justify-between p-5 bg-charcoal/40 rounded-2xl border border-pencil-light/5 cursor-pointer hover:border-pencil-light/20 transition-all select-none group"
                  onClick={() => setSettings(s => ({ ...s, chatBotEnabled: !s.chatBotEnabled }))}
                >
                  <div className="pr-8">
                    <div className="font-bold text-ink group-hover:text-accent transition-colors">Enable Chat Bot</div>
                    <div className="text-sm text-ink-dim mt-1">When turned off, the website will not show the chat widget and API calls will be rejected.</div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${settings.chatBotEnabled ? 'bg-accent' : 'bg-charcoal border border-pencil-light/20'}`}>
                    <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 40 }} className={`w-6 h-6 rounded-full bg-white absolute shadow-md ${settings.chatBotEnabled ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-5 bg-charcoal/40 rounded-2xl border border-pencil-light/5 cursor-pointer hover:border-pencil-light/20 transition-all select-none group"
                  onClick={() => setSettings(s => ({ ...s, performanceModeDefault: !s.performanceModeDefault }))}
                >
                  <div className="pr-8">
                    <div className="font-bold text-ink group-hover:text-accent transition-colors">Default to Performance Mode</div>
                    <div className="text-sm text-ink-dim mt-1">Disable animations/particles on initial load by default to save battery on low-end devices.</div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${settings.performanceModeDefault ? 'bg-accent' : 'bg-charcoal border border-pencil-light/20'}`}>
                    <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 40 }} className={`w-6 h-6 rounded-full bg-white absolute shadow-md ${settings.performanceModeDefault ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between p-5 bg-charcoal/40 rounded-2xl border border-pencil-light/5 border-l-4 border-l-red-500/50 cursor-pointer hover:border-red-500/50 transition-all select-none group"
                  onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                >
                  <div className="pr-8">
                    <div className="font-bold text-ink group-hover:text-red-400 transition-colors">Maintenance Mode Override</div>
                    <div className="text-sm text-ink-dim mt-1">Put the entire site into "Under Construction" mode. Only you can access the admin dashboard.</div>
                  </div>
                  <div className={`w-14 h-8 rounded-full transition-colors relative flex items-center shrink-0 shadow-inner ${settings.maintenanceMode ? 'bg-red-500' : 'bg-charcoal border border-pencil-light/20'}`}>
                    <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 40 }} className={`w-6 h-6 rounded-full bg-white absolute shadow-md ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-pencil-light/10">
                <div>
                  <div className="font-bold text-ink mb-1">Live Status Badge</div>
                  <div className="text-sm text-ink-dim mb-3">Update your current activity instantly. It displays on the Hero section next to Kathmandu time. If empty, the badge hides.</div>
                  <input
                    type="text"
                    placeholder="e.g., 🟢 Open to work, ☕ Drinking coffee"
                    value={settings.liveStatus}
                    onChange={(e) => setSettings(s => ({ ...s, liveStatus: e.target.value }))}
                    className="w-full bg-charcoal/50 border border-pencil-light/20 rounded-xl p-4 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-ink-dim/50"
                  />
                </div>

                <div className="flex items-center justify-between bg-charcoal/50 border border-pencil-light/20 rounded-xl p-4 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all">
                  <div className="pr-8">
                    <div className="font-bold text-ink">Accent Color</div>
                    <div className="text-sm text-ink-dim mt-1">Instantly change the primary accent color of your portfolio.</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full shadow-md border-2 border-charcoal overflow-hidden relative cursor-pointer ring-2 ring-pencil-light/20"
                      style={{ backgroundColor: settings.accentColor }}
                    >
                      <input 
                        type="color" 
                        value={settings.accentColor} 
                        onChange={(e) => setSettings(s => ({ ...s, accentColor: e.target.value }))}
                        className="absolute inset-[-10px] w-20 h-20 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-mono text-sm text-ink font-bold uppercase">{settings.accentColor}</span>
                      <button 
                        onClick={() => setSettings(s => ({ ...s, accentColor: '#FFB59D' }))}
                        className="text-[0.65rem] text-ink-dim hover:text-accent transition-colors underline font-medium"
                      >
                        Reset to default
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-pencil-light/10">
                <div>
                  <div className="font-bold text-ink mb-1">Avatar Image</div>
                  <div className="text-sm text-ink-dim mb-3">Update your portfolio avatar. Enter a URL or upload a local file.</div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="url"
                      placeholder="e.g., https://example.com/my-avatar.png"
                      value={settings.avatarUrl || ''}
                      onChange={(e) => setSettings(s => ({ ...s, avatarUrl: e.target.value }))}
                      className="flex-1 bg-charcoal/50 border border-pencil-light/20 rounded-xl p-4 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-ink-dim/50"
                    />
                    <label className="cursor-pointer shrink-0 bg-paper/5 hover:bg-paper/10 border border-pencil-light/20 text-ink px-4 py-4 rounded-xl transition-colors font-medium">
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-pencil-light/10">
                <div className="font-bold text-ink mb-1 text-lg">Featured Projects</div>
                <div className="text-sm text-ink-dim mb-6">Toggle visibility of projects on the main portfolio page. Useful for temporarily hiding projects.</div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-2">
                  {PROJECTS.map(project => {
                    const isHidden = settings.hiddenProjects.includes(project.id);
                    return (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-charcoal/50 rounded-xl border border-pencil-light/10 transition-colors hover:border-pencil-light/30">
                        <div>
                          <div className="font-bold text-ink flex items-center gap-2">
                            {project.title} 
                            <span className="font-mono text-[10px] text-accent px-2 py-0.5 bg-accent/10 rounded-full">{project.category}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSettings(s => ({
                              ...s,
                              hiddenProjects: isHidden 
                                ? s.hiddenProjects.filter(id => id !== project.id)
                                : [...s.hiddenProjects, project.id]
                            }))
                          }}
                          className={`px-4 py-1.5 text-xs rounded-full font-bold transition-all ${!isHidden ? 'bg-accent text-charcoal shadow-sm' : 'bg-pencil-light/10 text-ink-dim hover:bg-pencil-light/20'}`}
                        >
                          {!isHidden ? 'Visible' : 'Hidden'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-charcoal-warm/50 border border-pencil-light/10 rounded-3xl p-8 lg:p-10 shadow-sm">
              <div className="border-b border-pencil-light/10 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <MessageSquare size={16} />
                  </span>
                  AI Persona Controller
                </h2>
                <p className="text-sm text-ink-dim mt-2">Edit the AI's internal instruction system prompt dynamically. Tell it who it is, how to respond, and providing it real-time data to answer with.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-ink uppercase tracking-wider text-xs">System Prompt Engine</label>
                <div className="relative">
                  <textarea 
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings(s => ({ ...s, systemPrompt: e.target.value }))}
                    className="w-full bg-charcoal/80 border border-pencil-light/20 rounded-2xl p-5 text-sm text-ink font-mono h-96 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-y leading-relaxed shadow-inner"
                    placeholder="You are Aayu..."
                  />
                  <div className="absolute top-4 right-4 pointer-events-none opacity-20">
                    <Settings size={64} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-charcoal-warm/50 border border-pencil-light/10 rounded-3xl p-8 lg:p-10 shadow-sm">
              <div className="border-b border-pencil-light/10 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Settings size={16} />
                  </span>
                  Security Settings
                </h2>
                <p className="text-sm text-ink-dim mt-2">Update your administrator password.</p>
              </div>

              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider mb-2 block">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-charcoal/50 border border-pencil-light/20 rounded-xl px-4 py-3 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink uppercase tracking-wider mb-2 block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-charcoal/50 border border-pencil-light/20 rounded-xl px-4 py-3 text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={handlePasswordChange}
                    disabled={!currentPassword || !newPassword || passwordChangeStatus.type === 'loading'}
                    className="w-full px-6 py-3.5 bg-pencil-light/10 text-ink border border-pencil-light/20 rounded-xl font-bold hover:bg-accent hover:border-accent hover:text-charcoal transition-all disabled:opacity-50 disabled:hover:bg-pencil-light/10 disabled:hover:text-ink disabled:hover:border-pencil-light/20 text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    {passwordChangeStatus.type === 'loading' ? (
                      <><RefreshCw size={16} className="animate-spin" /> Updating...</>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                  {passwordChangeStatus.msg && (
                    <div className={`mt-3 text-xs text-center font-bold ${passwordChangeStatus.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                      {passwordChangeStatus.msg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end sticky bottom-8 pt-4 pb-12 z-50 pointer-events-none">
              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className={`pointer-events-auto flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-xl transition-all hover:-translate-y-1 ${saveSuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-accent text-charcoal hover:bg-accent/90 shadow-accent/20'} ${savingSettings ? 'opacity-70 scale-95' : ''}`}
              >
                {saveSuccess ? (
                  <><Check size={20} /> Configuration Saved</>
                ) : savingSettings ? (
                  <><RefreshCw size={20} className="animate-spin" /> Committing Changes...</>
                ) : (
                  <><Save size={20} /> Save Configuration</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
