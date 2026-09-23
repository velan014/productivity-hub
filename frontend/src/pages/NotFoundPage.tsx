import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 text-3xl shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-2">404</h1>
      <h2 className="text-xl font-bold mb-3">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button
        onClick={() => navigate('/app/dashboard')}
        leftIcon={<Home className="w-4 h-4" />}
        size="md"
      >
        Back to Dashboard
      </Button>
    </div>
  );
};
