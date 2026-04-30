import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Plus, Trash2, Bot, User, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '@/hooks/useChat';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { timeAgo } from '@/utils/formatters';

const SUGGESTIONS = [
  'I have a headache and fever for 2 days',
  'What are the side effects of ibuprofen?',
  'I feel chest pain when breathing',
  'How to manage high blood pressure?',
];

export default function Chat() {
  const {
    formattedMessages, sessions, sessionId,
    isTyping, sendMessage, loadSession, deleteSession, newSession,
  } = useChat();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [formattedMessages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    await sendMessage(text);
  }, [input, isTyping, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const toggleVoice = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      setInput((prev) => prev + e.results[0][0].transcript + ' ');
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  // Memoized history sidebar
  const historySidebar = useMemo(() => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 shrink-0">
        <h2 className="text-sm font-semibold text-slate-200">History</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={newSession}
            className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-all"
            title="New session"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={() => setShowHistory(false)}
            className="w-7 h-7 md:hidden rounded-lg bg-slate-700 flex items-center justify-center text-slate-400"
          >
            <X size={13} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
        {sessions.length === 0 ? (
          <p className="text-xs text-slate-600 text-center pt-8 px-4">Start a conversation to see history</p>
        ) : (
          sessions.map((s) => (
            <div
              key={s._id}
              onClick={() => { loadSession(s._id); setShowHistory(false); }}
              className={`w-full text-left p-3 rounded-xl cursor-pointer group flex items-center justify-between gap-2 transition-all border ${
                sessionId === s._id
                  ? 'bg-blue-500/12 border-blue-500/25 text-blue-300'
                  : 'border-transparent hover:bg-slate-700/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate leading-snug">{s.sessionTitle}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{timeAgo(s.updatedAt)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s._id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  ), [sessions, sessionId, newSession, loadSession, deleteSession]);

  return (
    <div className="flex gap-4 h-[calc(100dvh-8rem)] max-w-6xl mx-auto">
      {/* ── Desktop History Sidebar ───────────────── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 glass rounded-2xl overflow-hidden">
        {historySidebar}
      </aside>

      {/* ── Mobile History Drawer ─────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="md:hidden fixed inset-y-16 left-0 w-72 z-40 bg-slate-900 border-r border-slate-700 shadow-2xl overflow-hidden"
          >
            {historySidebar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat ─────────────────────────────── */}
      <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden min-w-0">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowHistory((p) => !p)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/60 text-slate-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-blue shrink-0">
            <Bot size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none">MediAI Care</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-[11px] text-slate-500">Gemini 1.5 Flash</p>
            </div>
          </div>
          <span className="hidden sm:block text-[10px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2.5 py-1 rounded-full shrink-0">
            ⚠ Not medical advice
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {formattedMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary glow-blue flex items-center justify-center mb-4 animate-float">
                <Bot size={26} className="text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">How can I help you?</h2>
              <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                Describe symptoms, ask about medications, upload a medical document.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-left text-xs p-3 rounded-xl border border-slate-700/60 text-slate-400 hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-slate-300 transition-all leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {formattedMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.isUser ? 'bg-blue-600' : 'gradient-primary'
                  }`}
                >
                  {msg.isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                </div>
                <div className={`max-w-[80%] sm:max-w-[72%] flex flex-col gap-0.5 ${msg.isUser ? 'items-end' : 'items-start'}`}>
                  <div className={msg.isUser ? 'chat-bubble-user px-4 py-2.5' : 'chat-bubble-ai px-4 py-3'}>
                    {msg.isUser ? (
                      <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="prose-medical">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 px-1">{msg.timeStr}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-700/50 shrink-0">
          <div className="flex items-end gap-2.5">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe symptoms or ask a question… (⏎ to send)"
                rows={1}
                className="input-base resize-none pr-3 text-sm leading-relaxed w-full"
                style={{ minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleVoice}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  isRecording
                    ? 'bg-red-500 text-white animate-ring'
                    : 'bg-slate-700/60 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0 shadow-lg shadow-blue-500/20"
                title="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-700 mt-2">
            AI responses are informational only. Always consult a qualified doctor for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
