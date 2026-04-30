import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar, MessageSquare, FileText, BarChart3,
  TrendingUp, Clock, AlertCircle, CheckCircle, Activity,
  Users2, Stethoscope,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/appointmentService';
import { vitalService, userService } from '@/services/vitalService';
import { chatService } from '@/services/chatService';
import Card, { CardHeader, CardTitle, CardEmpty } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import Avatar from '@/components/ui/Avatar';
import { formatDate } from '@/utils/formatters';
import { VITAL_TYPES } from '@/utils/constants';

// ── Types ─────────────────────────────────────────────────────────────────
interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  status: string;
  type?: string;
  symptoms?: string;
  doctorId?: { _id: string; name: string; specialization: string; consultationFee: number };
  patientId?: { _id: string; name: string; email: string };
}

interface VitalTrend {
  _id: string;
  avg: number;
  min: number;
  max: number;
  latest: number;
  count: number;
  unit: string;
  isAbnormal: boolean;
}

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  recentUsers: { _id: string; name: string; email: string; role: string; createdAt: string }[];
}

// ── Quick action card ──────────────────────────────────────────────────────
interface QuickAction { label: string; icon: React.ElementType; color: string; bg: string; border: string; to: string; desc: string }
const QUICK_ACTIONS: QuickAction[] = [
  { label: 'AI Chatbot',   icon: MessageSquare, color: 'text-blue-400',   bg: 'bg-blue-500/8',   border: 'border-blue-500/20',   to: '/chat',         desc: 'Analyze symptoms with Gemini AI' },
  { label: 'Digitizer',   icon: FileText,      color: 'text-teal-400',   bg: 'bg-teal-500/8',   border: 'border-teal-500/20',   to: '/digitizer',    desc: 'Upload prescription / lab report' },
  { label: 'Appointments', icon: Calendar,     color: 'text-violet-400', bg: 'bg-violet-500/8', border: 'border-violet-500/20', to: '/appointments', desc: 'Book or view your consultations' },
  { label: 'Analytics',   icon: BarChart3,     color: 'text-amber-400',  bg: 'bg-amber-500/8',  border: 'border-amber-500/20',  to: '/analytics',    desc: 'Track your health trends' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: appointments = [], isLoading: loadingAppts } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAll(),
    staleTime: 60_000,
  });

  const { data: trends = [] } = useQuery<VitalTrend[]>({
    queryKey: ['vital-trends'],
    queryFn: () => vitalService.getTrends(30),
    enabled: !isDoctor && !isAdmin,
    staleTime: 120_000,
  });

  const { data: chatSessions = [] } = useQuery<{ _id: string }[]>({
    queryKey: ['chat-history'],
    queryFn: () => chatService.getHistory(),
    enabled: !isDoctor && !isAdmin,
    staleTime: 120_000,
  });

  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => userService.getStats(),
    enabled: isAdmin,
    staleTime: 120_000,
  });

  // Derived data
  const upcomingAppts = useMemo(
    () => appointments.filter((a) => ['pending', 'confirmed'].includes(a.status)).slice(0, 5),
    [appointments]
  );

  const statCards = useMemo(() => {
    if (isAdmin && adminStats) {
      return [
        { label: 'Total Users',  value: adminStats.totalUsers,        icon: Users2,      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Doctors',      value: adminStats.totalDoctors,      icon: Stethoscope, color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
        { label: 'Patients',     value: adminStats.totalPatients,     icon: Activity,    color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
        { label: 'Appointments', value: adminStats.totalAppointments, icon: Calendar,    color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
      ];
    }
    if (isDoctor) {
      return [
        { label: 'Total',     value: appointments.length,                                              icon: Calendar,     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Pending',   value: appointments.filter((a) => a.status === 'pending').length,         icon: Clock,        color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
        { label: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length,       icon: CheckCircle,  color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
        { label: 'Completed', value: appointments.filter((a) => a.status === 'completed').length,       icon: TrendingUp,   color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
      ];
    }
    return [
      { label: 'Appointments', value: appointments.length,  icon: Calendar,      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
      { label: 'AI Sessions',  value: chatSessions.length,  icon: MessageSquare, color: 'text-teal-400',   bg: 'bg-teal-500/10 border-teal-500/20' },
      { label: 'Vitals',       value: trends.length,         icon: Activity,      color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
      { label: 'Alerts',       value: trends.filter((t) => t.isAbnormal).length, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    ];
  }, [isAdmin, isDoctor, adminStats, appointments, chatSessions, trends]);

  if (loadingAppts) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          {greeting()},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className={`border ${s.bg}`} padding="sm">
              <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center mb-3`}>
                <s.icon size={17} className={s.color} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions (patient only) */}
      {!isDoctor && !isAdmin && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 + 0.2 }}
                onClick={() => navigate(a.to)}
                className={`rounded-2xl border ${a.bg} ${a.border} p-4 sm:p-5 text-left hover:-translate-y-1 transition-all duration-200 hover:shadow-lg group`}
              >
                <div className={`w-10 h-10 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center mb-3`}>
                  <a.icon size={19} className={a.color} />
                </div>
                <p className="text-sm font-semibold text-white">{a.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug hidden sm:block">{a.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom two-column grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Calendar size={15} className="text-blue-400" />
                Upcoming Appointments
              </span>
            </CardTitle>
            <Button variant="ghost" size="xs" onClick={() => navigate('/appointments')}>View all</Button>
          </CardHeader>

          {upcomingAppts.length === 0 ? (
            <CardEmpty
              icon={Calendar}
              title="No upcoming appointments"
              description={isDoctor ? 'Waiting for patients to book' : 'Book your first consultation'}
              action={!isDoctor && <Button size="sm" onClick={() => navigate('/appointments')}>Book Now</Button>}
            />
          ) : (
            <div className="space-y-2.5">
              {upcomingAppts.map((appt) => (
                <div
                  key={appt._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/25 hover:bg-slate-700/40 transition-colors"
                >
                  <Avatar name={isDoctor ? (appt.patientId?.name ?? 'P') : (appt.doctorId?.name ?? 'D')} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {isDoctor ? appt.patientId?.name : `Dr. ${appt.doctorId?.name}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(appt.date)} · {appt.timeSlot}
                    </p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Vitals / Admin recent users */}
        {!isDoctor && !isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Activity size={15} className="text-teal-400" />
                  Health Overview
                </span>
              </CardTitle>
              <Button variant="ghost" size="xs" onClick={() => navigate('/analytics')}>Details</Button>
            </CardHeader>

            {trends.length === 0 ? (
              <CardEmpty
                icon={Activity}
                title="No vitals recorded"
                description="Start tracking your health today"
                action={<Button size="sm" onClick={() => navigate('/analytics')}>Add Vitals</Button>}
              />
            ) : (
              <div className="space-y-2.5">
                {trends.slice(0, 5).map((t) => {
                  const vt = VITAL_TYPES.find((v) => v.value === t._id);
                  return (
                    <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/25">
                      <span className="text-xl shrink-0">{vt?.icon ?? '📊'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200">{vt?.label ?? t._id}</p>
                        <p className="text-xs text-slate-500">Avg: {t.avg.toFixed(1)} {t.unit}</p>
                      </div>
                      {t.isAbnormal && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400 shrink-0">
                          <AlertCircle size={11} /> Alert
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {isAdmin && adminStats && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
              <Button variant="ghost" size="xs" onClick={() => navigate('/admin')}>View all</Button>
            </CardHeader>
            <div className="space-y-2.5">
              {adminStats.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/25">
                  <Avatar name={u.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <StatusBadge status={u.role} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
