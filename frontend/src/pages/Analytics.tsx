import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Plus, TrendingUp, TrendingDown, Minus, Activity, AlertCircle } from 'lucide-react';
import { vitalService } from '@/services/vitalService';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { VITAL_TYPES } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; unit?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs border border-slate-600/60">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} {payload[0]?.unit || ''}</p>
    </div>
  );
};

export default function Analytics() {
  const qc = useQueryClient();
  const [selectedType, setSelectedType] = useState('heartRate');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'heartRate', value: '', notes: '' });

  const vitalType = useMemo(() => VITAL_TYPES.find((v) => v.value === selectedType), [selectedType]);

  const { data: vitals = [], isLoading } = useQuery({
    queryKey: ['vitals', selectedType],
    queryFn: () => vitalService.getAll({ type: selectedType, days: 30 }),
    staleTime: 60_000,
  });

  const { data: trends = [] } = useQuery({
    queryKey: ['vital-trends'],
    queryFn: () => vitalService.getTrends(30),
  });

  // Memoize chart data transformation
  const chartData = useMemo(
    () =>
      (vitals as { date: string; value: number; unit: string }[]).map((v) => ({
        date: formatDate(v.date),
        value: v.value,
        unit: v.unit,
      })),
    [vitals]
  );

  const addMutation = useMutation({
    mutationFn: (data: { type: string; value: number; notes: string }) => vitalService.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vitals'] });
      qc.invalidateQueries({ queryKey: ['vital-trends'] });
      toast.success('Vital recorded!');
      setFormData({ type: 'heartRate', value: '', notes: '' });
      setShowForm(false);
    },
    onError: () => toast.error('Failed to save vital.'),
  });

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.value) return toast.error('Value is required.');
      addMutation.mutate({ ...formData, value: parseFloat(formData.value) });
    },
    [formData, addMutation]
  );

  const getTrend = useCallback((trend: { avg: number; min: number; max: number; latest: number }) => {
    const diff = trend.latest - trend.avg;
    if (Math.abs(diff) < 1) return { icon: <Minus size={14} />, color: 'text-slate-400', label: 'Stable' };
    if (diff > 0) return { icon: <TrendingUp size={14} />, color: 'text-red-400', label: `+${diff.toFixed(1)}` };
    return { icon: <TrendingDown size={14} />, color: 'text-emerald-400', label: `${diff.toFixed(1)}` };
  }, []);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📈 Health Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track and visualize your health trends over time</p>
        </div>
        <Button onClick={() => setShowForm((p) => !p)}>
          <Plus size={16} /> Add Vital
        </Button>
      </div>

      {/* Add vital form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card glow>
            <CardTitle className="mb-4">Record New Reading</CardTitle>
            <form onSubmit={handleAdd} className="grid sm:grid-cols-3 gap-4">
              <Select
                label="Vital Type"
                options={VITAL_TYPES.map((v) => ({ value: v.value, label: `${v.icon} ${v.label}` }))}
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              />
              <Input
                label={`Value (${VITAL_TYPES.find((v) => v.value === formData.type)?.unit})`}
                type="number"
                step="0.1"
                placeholder="Enter reading..."
                value={formData.value}
                onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
              />
              <Input
                label="Notes (optional)"
                placeholder="Any context..."
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
              <div className="sm:col-span-3 flex gap-3">
                <Button type="submit" loading={addMutation.isPending}>Save Reading</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Trend summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {VITAL_TYPES.slice(0, 4).map((vt) => {
          const t = (trends as { _id: string; avg: number; min: number; max: number; latest: number; unit: string; count: number; isAbnormal: boolean }[]).find((x) => x._id === vt.value);
          const trend = t ? getTrend(t) : null;
          return (
            <motion.div
              key={vt.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedType(vt.value)}
              className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                selectedType === vt.value
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{vt.icon}</span>
                {t?.isAbnormal && <AlertCircle size={14} className="text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400">{vt.label}</p>
              {t ? (
                <>
                  <p className="text-xl font-bold text-white mt-1">{t.latest.toFixed(1)}</p>
                  <p className="text-[11px] text-slate-500">{vt.unit}</p>
                  {trend && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${trend.color}`}>
                      {trend.icon} {trend.label}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-600 mt-1">No data</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <span>{vitalType?.icon}</span>
              {vitalType?.label} – Last 30 days
            </span>
          </CardTitle>
          <div className="flex gap-2">
            {VITAL_TYPES.map((vt) => (
              <button
                key={vt.value}
                onClick={() => setSelectedType(vt.value)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  selectedType === vt.value
                    ? 'border-blue-500/50 bg-blue-500/15 text-blue-400'
                    : 'border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                {vt.icon}
              </button>
            ))}
          </div>
        </CardHeader>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Activity size={40} className="opacity-30 mb-3" />
            <p className="text-sm">No {vitalType?.label} readings yet</p>
            <Button size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              Add first reading
            </Button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.3)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {vitalType && (
                <>
                  <ReferenceLine y={vitalType.min} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" />
                  <ReferenceLine y={vitalType.max} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 4" />
                </>
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={vitalType?.color || '#3b82f6'}
                strokeWidth={2.5}
                dot={{ fill: vitalType?.color || '#3b82f6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
