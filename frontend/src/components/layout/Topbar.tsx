import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';
import { timeAgo } from '@/utils/formatters';

export default function Topbar() {
  const { user } = useAuth();
  const { mobileSidebarOpen, toggleMobileSidebar, notifications, clearNotification, clearAll, markAllRead } = useUIStore();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read).length;

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Good morning';
    if (h < 17) return '🌤️ Good afternoon';
    return '🌙 Good evening';
  };

  const notifColors = {
    info: 'bg-blue-500/15 text-blue-400',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    error: 'bg-red-500/15 text-red-400',
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30 shrink-0 gap-4">
      {/* Left: hamburger (mobile) + greeting */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <Heart size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">Medi<span className="text-blue-400">Vision</span></span>
        </div>

        {/* Desktop greeting */}
        <div className="hidden md:block min-w-0">
          <p className="text-xs text-slate-500">{greet()},</p>
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {user?.name?.split(' ')[0]} 👋
          </p>
        </div>
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search (hidden on mobile, compact on sm) */}
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300 transition-all text-sm">
          <Search size={14} />
          <span className="hidden lg:block text-sm">Search...</span>
          <kbd className="hidden lg:block text-[10px] bg-slate-700/80 px-1.5 py-0.5 rounded-md text-slate-400 font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotif((p) => !p);
              if (!showNotif && unread > 0) markAllRead();
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold px-0.5 border-2 border-slate-900">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 sm:w-96 glass-dark rounded-2xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                  <div>
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    {unread > 0 && <p className="text-xs text-blue-400">{unread} unread</p>}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell size={24} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-sm text-slate-500">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`relative px-4 py-3.5 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors group ${!n.read ? 'bg-slate-800/20' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-400' : n.type === 'warning' ? 'bg-amber-400' : n.type === 'error' ? 'bg-red-400' : 'bg-blue-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white leading-tight">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                            <p className="text-[11px] text-slate-600 mt-1">{timeAgo(n.time)}</p>
                          </div>
                          <button
                            onClick={() => clearNotification(n.id)}
                            className="shrink-0 text-slate-700 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="ring-2 ring-transparent hover:ring-blue-500/40 rounded-full transition-all"
        >
          <Avatar name={user?.name || 'U'} size="sm" online />
        </button>
      </div>
    </header>
  );
}
