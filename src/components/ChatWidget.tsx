import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

type Role = 'user' | 'model' | 'admin';

interface ChatMessage {
  id?: string;
  role: Role;
  text: string;
  timestamp?: number;
}

export default function ChatWidget() {
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('chat_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chat_session_id', sid);
    }
    return sid;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Hey, I'm Aayu (well, my digital AI clone). Feel free to ask me anything about my tech stack, projects, art, or if I'm available for work!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Polling for new messages
  useEffect(() => {
    if (!isOpen) return;
    
    let isSubscribed = true;
    const fetchHistory = async () => {
      if (!sessionId) return;
      try {
        const res = await fetch(`/api/chat/${sessionId}`);
        if (!res.ok) return;
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("Chat API returned non-JSON:", text.substring(0, 100));
          return;
        }
        if (isSubscribed && data.history && data.history.length > 0) {
          // Map server history to local format, keeping the init message
          const historyWithIds = data.history.map((msg: any, i: number) => ({
            id: msg.timestamp?.toString() || i.toString(),
            role: msg.role === 'bot' ? 'model' : msg.role,
            text: msg.text,
            timestamp: msg.timestamp
          }));
          
          setChatHistory(prev => {
            // Keep init message
            const newHistory = [prev[0], ...historyWithIds];
            // Only update if length changed or last message text changed (streaming could be happening but usually polling shouldn't interrupt streaming)
            // It's safer to only add messages that don't exist yet by matching ID, or just overriding if not typing
            return newHistory;
          });
        }
      } catch (err) {
        // ignore
      }
    };
    
    // Initial fetch when opened
    fetchHistory();
    
    const interval = setInterval(() => {
      if (!isTyping) {
        fetchHistory();
      }
    }, 3000); // Check every 3 seconds
    
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOpen, sessionId, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || isTyping) return;

    const userText = message.trim();
    setMessage('');
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();
    setChatHistory((prev) => [...prev, { id: botMsgId, role: 'model', text: '' }]);

    try {
      const historyForApi = chatHistory.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, chatHistory: historyForApi, sessionId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMsg = 'Failed to fetch response';
        try { errorMsg = JSON.parse(errorText).error || errorMsg; } catch (e) {}
        throw new Error(errorMsg);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let currentText = '';
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          let eolIndex;
          while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
            const chunk = buffer.slice(0, eolIndex);
            buffer = buffer.slice(eolIndex + 2);
            
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') continue;
                
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                    currentText += data.text;
                    setChatHistory((prev) => 
                      prev.map((msg) => msg.id === botMsgId ? { ...msg, text: currentText } : msg)
                    );
                  } else if (data.error) {
                    console.error('API Error:', data.error);
                  }
                } catch (e) {
                  console.error('Error parsing JSON stream:', e);
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.message === 'HUMAN_TAKEOVER') {
        setChatHistory((prev) => prev.filter(msg => msg.id !== botMsgId));
      } else {
        const errorContent = '*[System Note: AI core offline. Please email Aayu directly!]*';
        setChatHistory((prev) => 
          prev.map((msg) => msg.id === botMsgId ? { ...msg, text: errorContent } : msg)
        );
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:right-8 md:bottom-8 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, rotate: 2 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[340px] md:w-[380px] h-[500px] max-h-[80vh] flex flex-col bg-charcoal border-2 border-pencil-light/40 shadow-[8px_8px_0_0_var(--color-pencil-light)] rounded-2xl overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-pencil-light/20 bg-charcoal-warm shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-charcoal border border-pencil-light/30 overflow-hidden relative shadow-lg flex items-center justify-center">
                   <Sparkles className="text-accent w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-hand font-bold text-ink text-lg leading-tight">Aayu (AI Clone)</h3>
                    <p className="text-ink-dim text-[0.7rem] font-sans">Always online</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-dim hover:text-accent hover:bg-charcoal transition-all active:scale-95 z-10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 bg-charcoal relative no-scrollbar">
              {chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-charcoal-warm border border-accent/20 text-accent flex items-center justify-center shrink-0 shadow-sm mt-1">
                    {msg.role === 'user' ? <MessageSquare size={14} /> : msg.role === 'admin' ? <Sparkles size={14} /> : <Sparkles size={14} />}
                  </div>
                  <div 
                    className={`px-4 py-3 text-[0.88rem] font-sans leading-relaxed shadow-sm ${
                      msg.role === 'user'
                      ? 'bg-accent/10 border border-accent/20 text-ink rounded-2xl rounded-tr-sm'
                      : msg.role === 'admin' 
                        ? 'bg-accent/20 border border-accent/40 text-ink rounded-2xl rounded-tl-sm ring-1 ring-accent/30'
                        : 'bg-paper/5 border border-pencil-light/20 text-ink rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'admin' && <div className="text-[0.6rem] font-bold text-accent uppercase tracking-widest mb-1">Real Aayu</div>}
                    {msg.role === 'user' ? (
                      <p>{msg.text}</p>
                    ) : (
                      <div className="markdown-body prose prose-invert prose-p:leading-relaxed prose-sm max-w-none text-ink">
                        {msg.text ? <Markdown>{msg.text}</Markdown> : <Loader2 size={16} className="animate-spin text-ink-dim opacity-70" />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-pencil-light/20 bg-paper/5 flex gap-2.5 relative shrink-0">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isTyping ? "AI is processing..." : "Message AI Clone..."}
                disabled={isTyping}
                className="w-full bg-charcoal border border-pencil-light/40 rounded-full px-5 py-3 text-[0.9rem] outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 transition-all disabled:opacity-50 text-ink placeholder:text-ink-dim/50 font-sans shadow-inner"
              />
              <button
                type="submit"
                disabled={!message.trim() || isTyping}
                className="w-12 h-12 shrink-0 bg-accent text-charcoal rounded-full flex items-center justify-center transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-30 disabled:bg-charcoal disabled:text-ink-dim shadow-sm mt-[0.5px]"
              >
                <Send size={18} className="translate-x-[1px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ 
          scale: isOpen ? 0.9 : 1,
          opacity: isOpen ? 0 : 1
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`relative flex items-center justify-center w-14 h-14 bg-charcoal border-2 border-accent text-accent rounded-2xl shadow-[4px_4px_0_0_var(--color-accent)] cursor-pointer z-50 overflow-visible group ${isOpen ? 'pointer-events-none' : ''}`}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
}
