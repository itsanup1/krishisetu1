import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Sprout, Lock, Mail, Zap, UserCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('farmer@krishisetu.com');
  const [password, setPassword] = useState('farmer123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      // Route appropriately
      if (email.includes('admin')) {
        navigate('/admin');
      } else if (email.includes('vendor')) {
        navigate('/vendor/dashboard');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    if (testEmail.includes('admin')) {
      setPassword('admin123');
    } else if (testEmail.includes('vendor')) {
      setPassword('vendor123');
    } else {
      setPassword('farmer123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to Krishisetu</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your agricultural marketplace, rental bookings, or vendor orders
          </p>
        </div>

        {/* Pre-Configured Test Profiles */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold mb-2 text-slate-800">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Pre-Configured Test Profiles:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTestAccount('farmer@krishisetu.com')}
              className={`p-2 rounded-lg text-left border text-xs transition cursor-pointer ${
                email === 'farmer@krishisetu.com'
                  ? 'bg-white border-slate-900 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="block font-semibold text-slate-900">Ramesh (Owner)</span>
              <span className="text-[10px] text-slate-500">Farmer + Equipment</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAccount('farmer2@krishisetu.com')}
              className={`p-2 rounded-lg text-left border text-xs transition cursor-pointer ${
                email === 'farmer2@krishisetu.com'
                  ? 'bg-white border-slate-900 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="block font-semibold text-slate-900">Suresh (Farmer)</span>
              <span className="text-[10px] text-slate-500">Rental Renter</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAccount('vendor@krishisetu.com')}
              className={`p-2 rounded-lg text-left border text-xs transition cursor-pointer ${
                email === 'vendor@krishisetu.com'
                  ? 'bg-white border-slate-900 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="block font-semibold text-slate-900">AgriCorp Chemicals</span>
              <span className="text-[10px] text-slate-500">Vendor Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => setTestAccount('admin@krishisetu.com')}
              className={`p-2 rounded-lg text-left border text-xs transition cursor-pointer ${
                email === 'admin@krishisetu.com'
                  ? 'bg-white border-slate-900 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="block font-semibold text-slate-900">KrishiSetu Operations</span>
              <span className="text-[10px] text-slate-500">Platform Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. farmer@krishisetu.com"
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Sign In
          </Button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don't have an account yet? </span>
            <Link to="/register" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
