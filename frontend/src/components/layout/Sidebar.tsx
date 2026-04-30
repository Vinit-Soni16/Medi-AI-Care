import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, FileText, Calendar,
  BarChart3, User, Shield, LogOut, Heart,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, color: 'text-blue-400' },
  { to: '/chat',         label: 'AI Chatbot',   icon: MessageSquare,   color: 'text-teal-400' },
  { to: '/digitizer',   label: 'Digitizer',    icon: FileText,        color: 'text-violet-400' },
  { to: '/appointments', label: 'Appointments', icon: Calendar,        color: 'text-amber-400' },
  { to: '/analytics',   label: 'Analytics',    icon: BarChart3,       color: 'text-emerald-400' },
  { to: '/profile',     label: 'Profile',      icon: User,            color: 'text-pink-400' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { sidebarExpanded, toggleSidebar, mobileSidebarOpen, setMobileSidebar } = useUIStore();
  const navigate = useNavigate();

  const links = isAdmin
    ? [...NAV_ITEMS, { to: '/admin', label: 'Admin Panel', icon: Shield, color: 'text-red-400' }]
    : NAV_ITEMS;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl gradient-primary glow-blue flex items-center justify-center shrink-0">
            <Heart size={17} className="text-white" />
          </div>
          <AnimatePresence initial={false}>
            {(sidebarExpanded) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold text-white leading-none whitespace-nowrap">
                  Medi<span className="text-blue-400">Vision</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">AI Health Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebar(false)}
          className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex w-6 h-6 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-blue-500 hover:border-blue-500 transition-all"
        >
          {sidebarExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={!sidebarExpanded ? label : undefined}
          >
            <Icon size={18} className={`shrink-0 ${color}`} />
            <AnimatePresence initial={false}>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm truncate"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 px-2 pb-4 pt-3 space-y-1 shrink-0">
        <button
          onClick={() => navigate('/profile')}
          className="sidebar-link w-full"
          title={!sidebarExpanded ? user?.name : undefined}
        >
          <Avatar name={user?.name || 'U'} size="sm" online />
          <AnimatePresence initial={false}>
            {sidebarExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-left min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={logout}
          className="sidebar-link w-full hover:bg-red-500/8 hover:text-red-400 hover:border-red-500/20 group"
          title={!sidebarExpanded ? 'Logout' : undefined}
        >
          <LogOut size={16} className="shrink-0 group-hover:text-red-400" />
          <AnimatePresence initial={false}>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (fixed overlay) */}
      <motion.aside
        className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl"
        initial={{ x: -288 }}
        animate={{ x: mobileSidebarOpen ? 0 : -288 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        aria-hidden={!mobileSidebarOpen}
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop Sidebar (inline) */}
      <motion.aside
        className="hidden md:flex flex-col bg-slate-900 border-r border-slate-800 h-screen shrink-0"
        animate={{ width: sidebarExpanded ? 232 : 68 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
