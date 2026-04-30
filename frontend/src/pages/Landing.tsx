import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, MessageSquare, FileText, Calendar, BarChart3,
  Shield, Zap, ArrowRight, CheckCircle, Star,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const features = [
  { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'AI Symptom Chatbot', desc: 'Powered by Google Gemini 1.5 Flash. Analyze symptoms, get precautions, and medical insights instantly.' },
  { icon: FileText,      color: 'text-teal-400',  bg: 'bg-teal-500/10 border-teal-500/20',  title: 'Document Digitizer', desc: 'Upload prescriptions or lab reports – AI extracts medications, dosage, and diagnoses with OCR vision.' },
  { icon: Calendar,      color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', title: 'Smart Scheduler', desc: 'Real-time appointment booking with Socket.io. Doctors get instant notifications when you book.' },
  { icon: BarChart3,     color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  title: 'Health Analytics', desc: 'Track vitals over time. Interactive charts detect trends and flag abnormal readings automatically.' },
  { icon: Shield,        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Secure & Private', desc: 'JWT auth, bcrypt passwords, role-based access (Patient/Doctor/Admin). Your data stays safe.' },
  { icon: Zap,           color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20',   title: 'Lightning Fast', desc: 'Vite + React 18, React Query caching, lazy routes, debounced search – Lighthouse 95+ performance.' },
];

const stats = [
  { label: 'AI Consultations', value: '10K+' },
  { label: 'Doctors', value: '500+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Patient Rating', value: '4.9★' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-700/30 sticky top-0 z-50 bg-slate-900/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-blue">
            <Heart size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base">MediVision</span>
            <span className="text-blue-400 font-bold text-base"> AI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
          <Button size="sm" onClick={() => navigate('/register')}>Get Started Free</Button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="animate-pulse-slow w-2 h-2 bg-blue-400 rounded-full" />
            Powered by Google Gemini 1.5 Flash
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight text-white mb-6"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Healthcare,{' '}
          <span className="text-gradient">Reimagined</span>
          <br />with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          MediAI Care combines Google Gemini, real-time scheduling, and predictive analytics
          into one holistic patient management platform for the modern era.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" onClick={() => navigate('/register')} className="group">
            Start for free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
            Demo Login →
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gradient">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need</h2>
          <p className="text-slate-400">A complete healthcare ecosystem in one platform</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`rounded-2xl border p-6 ${f.bg} hover:-translate-y-1 transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} border flex items-center justify-center mb-4`}>
                <f.icon size={22} className={f.color} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-linear-to-r from-blue-500/20 to-teal-500/20 border border-blue-500/20 p-10 text-center">
          <Star size={32} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Ready to transform healthcare?</h2>
          <p className="text-slate-400 mb-6">Join thousands of patients and doctors already using MediAI Care.</p>
          <Button size="lg" onClick={() => navigate('/register')}>
            Create free account <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={14} className="text-blue-500" />
          <span className="text-slate-400 font-medium">MediAI Care</span>
        </div>
        <p>© {new Date().getFullYear()} MediAI Care. Built with ❤️ for better healthcare.</p>
        <p className="mt-1 text-xs">
          <span className="text-amber-500">⚠️ Disclaimer:</span> AI responses are for informational purposes only. Always consult a qualified doctor.
        </p>
      </footer>
    </div>
  );
}
