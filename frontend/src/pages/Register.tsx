import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Heart, Stethoscope } from 'lucide-react';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { SPECIALIZATIONS } from '@/utils/constants';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
  role: z.enum(['patient', 'doctor']),
  specialization: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    try {
      await authService.register(data);
      toast.success('Account created! Welcome to MediAI Care 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center glow-blue">
              <Heart size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg leading-none">MediVision<span className="text-blue-400"> AI</span></p>
              <p className="text-slate-500 text-xs">Health Intelligence Platform</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the future of healthcare</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['patient', 'doctor'] as const).map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  role === r
                    ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                    : 'border-slate-700 hover:border-slate-500 text-slate-400'
                }`}
              >
                <input type="radio" value={r} {...register('role')} className="sr-only" />
                {r === 'patient' ? <User size={16} /> : <Stethoscope size={16} />}
                <span className="text-sm font-medium capitalize">{r}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Dr. Priya Sharma"
              icon={<User size={15} />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              icon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {role === 'doctor' && (
              <Select
                label="Specialization"
                options={[
                  { value: '', label: 'Select specialization...' },
                  ...SPECIALIZATIONS.map((s) => ({ value: s, label: s })),
                ]}
                error={errors.specialization?.message}
                {...register('specialization')}
              />
            )}

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
