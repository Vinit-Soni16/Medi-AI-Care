import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Heart, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'At least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || msg);
    }
  };

  const demoLogin = async (role: 'patient' | 'doctor' | 'admin') => {
    const creds = {
      patient: { email: 'patient@medivision.ai', password: 'patient123' },
      doctor:  { email: 'dr.priya@medivision.ai', password: 'doctor123' },
      admin:   { email: 'admin@medivision.ai',   password: 'admin123' },
    };
    try {
      await authService.login(creds[role].email, creds[role].password);
      toast.success(`Logged in as ${role}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed – is the backend running?');
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
          <h1 className="text-2xl font-bold text-white mt-6">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={15} />}
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPw((p) => !p)} className="text-slate-400 hover:text-white">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register('password')}
            />
            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Sign in
            </Button>
          </form>

          {/* Demo logins */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="text-xs text-slate-500">Quick demo access</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['patient', 'doctor', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => demoLogin(role)}
                  className="py-2 px-3 rounded-xl border border-slate-700 text-xs font-medium text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all capitalize"
                >
                  👤 {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
