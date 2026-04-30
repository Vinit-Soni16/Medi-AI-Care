import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center text-center p-6">
      <div>
        <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6 glow-blue animate-float">
          <Heart size={32} className="text-white" />
        </div>
        <h1 className="text-7xl font-extrabold text-gradient mb-4">404</h1>
        <p className="text-xl font-semibold text-white mb-2">Page Not Found</p>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button>Go Home</Button></Link>
          <Link to="/dashboard"><Button variant="outline">Dashboard</Button></Link>
        </div>
      </div>
    </div>
  );
}
