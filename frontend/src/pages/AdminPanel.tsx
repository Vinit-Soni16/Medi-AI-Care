import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Shield, UserX, UserCheck, Users, Stethoscope, User as UserIcon } from 'lucide-react';
import { userService } from '@/services/vitalService';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch, roleFilter],
    queryFn: () => userService.getAllUsers({ search: debouncedSearch, role: roleFilter }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => userService.getStats(),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userService.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated.'); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userService.updateStatus(id, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Status updated.'); },
  });

  if (isLoading) return <PageSpinner />;

  const users: { _id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; specialization?: string }[] = data?.users || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🛡️ Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-1">Manage users, roles, and system health</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',  value: stats.totalUsers,       icon: Users,       color: 'text-blue-400' },
            { label: 'Doctors',      value: stats.totalDoctors,     icon: Stethoscope, color: 'text-teal-400' },
            { label: 'Patients',     value: stats.totalPatients,    icon: UserIcon,    color: 'text-violet-400' },
            { label: 'Appointments', value: stats.totalAppointments, icon: Shield,     color: 'text-amber-400' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                <s.icon size={20} className={`${s.color} mb-2`} />
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* User table */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-700/50 flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search users..."
            icon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            {['', 'patient', 'doctor', 'admin'].map((r) => (
              <button
                key={r || 'all'}
                onClick={() => setRoleFilter(r)}
                className={`text-xs px-3 py-2 rounded-lg border transition-all capitalize ${
                  roleFilter === r
                    ? 'border-blue-500/50 bg-blue-500/15 text-blue-400'
                    : 'border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-700/30">
          {users.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            users.map((u) => (
              <div key={u._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-700/20 transition-all flex-wrap">
                <Avatar name={u.name} online={u.isActive} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                  {u.specialization && <p className="text-xs text-teal-400">{u.specialization}</p>}
                </div>
                <p className="text-xs text-slate-500 hidden md:block">{formatDate(u.createdAt)}</p>
                <StatusBadge status={u.role} />
                <StatusBadge status={u.isActive ? 'confirmed' : 'cancelled'} />

                {/* Role change */}
                <select
                  value={u.role}
                  onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                  className="text-xs bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-300 cursor-pointer"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Toggle status */}
                <button
                  onClick={() => statusMutation.mutate({ id: u._id, isActive: !u.isActive })}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    u.isActive
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {u.isActive ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                </button>
              </div>
            ))
          )}
        </div>

        {data?.total > 20 && (
          <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-700/30">
            Showing {users.length} of {data.total} users
          </div>
        )}
      </Card>
    </div>
  );
}
