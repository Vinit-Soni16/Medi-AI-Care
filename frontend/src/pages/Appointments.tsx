import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Stethoscope, Search, Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { appointmentService } from '@/services/appointmentService';
import { userService } from '@/services/vitalService';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { APPOINTMENT_TYPES, TIME_SLOTS } from '@/utils/constants';
import toast from 'react-hot-toast';

interface BookingForm {
  doctorId: string;
  date: string;
  timeSlot: string;
  type: string;
  symptoms: string;
}

export default function Appointments() {
  const { isDoctor } = useAuth();
  const qc = useQueryClient();
  const [showBook, setShowBook] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Record<string, unknown> | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<BookingForm>({
    defaultValues: { type: 'consultation' },
  });

  const watchDate = watch('date');
  const watchDoctorId = watch('doctorId');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAll(),
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => userService.getDoctors(),
    enabled: !isDoctor,
  });

  // Filtered appointments with useMemo
  const filtered = useMemo(() => {
    if (!debouncedFilter) return appointments;
    const q = debouncedFilter.toLowerCase();
    return (appointments as { status: string; doctorId?: { name: string; specialization: string }; patientId?: { name: string }; timeSlot: string }[]).filter(
      (a) =>
        a.status.includes(q) ||
        a.doctorId?.name?.toLowerCase().includes(q) ||
        a.patientId?.name?.toLowerCase().includes(q) ||
        a.timeSlot.toLowerCase().includes(q)
    );
  }, [appointments, debouncedFilter]);

  const loadSlots = useCallback(async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    const data = await appointmentService.getSlots(doctorId, date);
    setAvailableSlots(data.availableSlots);
  }, []);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => appointmentService.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated.');
    },
  });

  const onBook = async (data: BookingForm) => {
    try {
      await appointmentService.book(data);
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked!');
      reset();
      setShowBook(false);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed.');
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📅 Appointments</h1>
          <p className="text-slate-400 text-sm mt-1">{appointments.length} total appointments</p>
        </div>
        {!isDoctor && (
          <Button onClick={() => setShowBook(true)}>
            <Plus size={16} /> Book Appointment
          </Button>
        )}
      </div>

      {/* Filter */}
      <Input
        placeholder="Search by doctor, status, or time..."
        icon={<Search size={14} />}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {/* Appointments list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-slate-500">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No appointments found</p>
            {!isDoctor && (
              <Button size="sm" className="mt-4" onClick={() => setShowBook(true)}>Book your first appointment</Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {(filtered as { _id: string; date: string; timeSlot: string; type: string; status: string; symptoms?: string; doctorId?: { _id: string; name: string; specialization: string; consultationFee: number }; patientId?: { _id: string; name: string; email: string } }[]).map((appt, i) => (
              <motion.div
                key={appt._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card hover padding="sm">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Avatar name={isDoctor ? appt.patientId?.name || 'P' : appt.doctorId?.name || 'D'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {isDoctor ? appt.patientId?.name : `Dr. ${appt.doctorId?.name}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isDoctor ? appt.patientId?.email : appt.doctorId?.specialization}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar size={12} />
                      {formatDate(appt.date)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={12} />
                      {appt.timeSlot}
                    </div>
                    <StatusBadge status={appt.status} />

                    {/* Doctor actions */}
                    {isDoctor && appt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateMutation.mutate({ id: appt._id, status: 'confirmed' })}
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all"
                        >
                          <CheckCircle size={12} /> Confirm
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: appt._id, status: 'cancelled' })}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-lg transition-all"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {appt.symptoms && (
                    <p className="text-xs text-slate-500 mt-2 pl-14">💬 {appt.symptoms}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Booking modal */}
      <AnimatePresence>
        {showBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowBook(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-3xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Book Appointment</h2>
                <button onClick={() => setShowBook(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onBook)} className="space-y-4">
                {/* Doctor select */}
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Select Doctor</label>
                  <select
                    {...register('doctorId', { required: true })}
                    onChange={(e) => {
                      const doc = (doctors as { _id: string; name: string; specialization: string; consultationFee: number }[]).find((d) => d._id === e.target.value);
                      setSelectedDoctor(doc || null);
                    }}
                    className="input-base"
                    style={{ background: '#1e293b' }}
                  >
                    <option value="">Choose a doctor...</option>
                    {(doctors as { _id: string; name: string; specialization: string; consultationFee: number }[]).map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name} – {d.specialization} ({formatCurrency(d.consultationFee)})
                      </option>
                    ))}
                  </select>
                  {selectedDoctor && (
                    <div className="mt-2 flex items-center gap-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <Avatar name={`${selectedDoctor.name}`} size="sm" />
                      <div>
                        <p className="text-xs font-medium text-white">Dr. {`${selectedDoctor.name}`}</p>
                        <p className="text-[11px] text-slate-400">{`${selectedDoctor.specialization}`} · {formatCurrency(selectedDoctor.consultationFee as number)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('date', { required: true })}
                  onChange={(e) => {
                    const docId = watchDoctorId;
                    if (docId && e.target.value) loadSlots(docId, e.target.value);
                  }}
                />

                {/* Time slots */}
                {availableSlots.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Available Slots</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <label key={slot} className="cursor-pointer">
                          <input type="radio" value={slot} {...register('timeSlot', { required: true })} className="sr-only" />
                          <span className="block text-center text-xs py-2 rounded-lg border border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 text-slate-300 transition-all">
                            {slot}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Select
                  label="Visit Type"
                  options={APPOINTMENT_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                  {...register('type')}
                />

                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Symptoms (optional)</label>
                  <textarea
                    {...register('symptoms')}
                    placeholder="Brief description of symptoms..."
                    rows={3}
                    className="input-base resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" fullWidth onClick={() => setShowBook(false)}>Cancel</Button>
                  <Button type="submit" fullWidth loading={isSubmitting}>Confirm Booking</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
