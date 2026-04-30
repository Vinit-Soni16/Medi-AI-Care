import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplets, Stethoscope, Edit3, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { BLOOD_GROUPS, SPECIALIZATIONS } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: profile || {},
  });

  const onSave = async (data: Record<string, unknown>) => {
    try {
      await authService.updateProfile(data);
      refetch();
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">👤 My Profile</h1>

      {/* Hero card */}
      <Card glow>
        <div className="flex items-center gap-5">
          <Avatar name={profile?.name || 'U'} size="xl" online />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <p className="text-slate-400 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={profile?.role || 'patient'} />
              {profile?.specialization && (
                <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                  {profile.specialization}
                </span>
              )}
            </div>
          </div>
          <Button
            variant={editing ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => setEditing((p) => !p)}
          >
            {editing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit</>}
          </Button>
        </div>
      </Card>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSave)}>
        <Card>
          <CardHeader>
            <CardTitle><span className="flex items-center gap-2"><User size={16} className="text-blue-400" />Personal Info</span></CardTitle>
          </CardHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" icon={<User size={14} />} disabled={!editing} {...register('name')} />
            <Input label="Email" type="email" icon={<Mail size={14} />} disabled {...register('email')} />
            <Input label="Phone" icon={<Phone size={14} />} disabled={!editing} placeholder="+91-9876543210" {...register('phone')} />
            <Input label="Age" type="number" disabled={!editing} placeholder="28" {...register('age')} />
            {user?.role === 'patient' && (
              <>
                <Select
                  label="Gender"
                  disabled={!editing}
                  options={[
                    { value: '', label: 'Select gender' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  {...register('gender')}
                />
                <Select
                  label="Blood Group"
                  disabled={!editing}
                  options={[
                    { value: '', label: 'Select blood group' },
                    ...BLOOD_GROUPS.map((b) => ({ value: b, label: b })),
                  ]}
                  {...register('bloodGroup')}
                />
              </>
            )}
            <div className="sm:col-span-2">
              <Input label="Address" icon={<MapPin size={14} />} disabled={!editing} placeholder="City, State" {...register('address')} />
            </div>
          </div>
        </Card>

        {user?.role === 'doctor' && (
          <Card className="mt-5">
            <CardHeader>
              <CardTitle><span className="flex items-center gap-2"><Stethoscope size={16} className="text-teal-400" />Professional Info</span></CardTitle>
            </CardHeader>
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Specialization"
                disabled={!editing}
                options={SPECIALIZATIONS.map((s) => ({ value: s, label: s }))}
                {...register('specialization')}
              />
              <Input label="Qualification (e.g. MBBS, MD)" disabled={!editing} {...register('qualification')} />
              <Input label="Experience (years)" type="number" disabled={!editing} {...register('experience')} />
              <Input label="Consultation Fee (₹)" type="number" disabled={!editing} {...register('consultationFee')} />
            </div>
          </Card>
        )}

        {editing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mt-4">
            <Button type="submit" loading={isSubmitting}>
              <Save size={14} /> Save Changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </motion.div>
        )}
      </form>
    </div>
  );
}
