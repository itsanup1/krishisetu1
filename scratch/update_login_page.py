login_content = '''import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Sprout, Lock, Mail, Zap, UserCheck, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  const [email, setEmail] = useState('farmer@krishisetu.com');
  const [password, setPassword] = useState('farmer123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password flow states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

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
        if (!from || from === '/login' || from === '/cart') {
          navigate('/products');
        } else {
          navigate(from);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }
    setIsLoading(true);
    setResetError(null);
    try {
      const res = await api.forgotPassword(resetEmail.trim());
      if (res.reset_token) {
        setResetToken(res.reset_token);
        setResetStep(2);
        setResetSuccess('Reset token generated! Enter your new password below.');
      } else {
        setResetSuccess(res.message);
      }
    } catch (err: any) {
      setResetError(err.response?.data?.detail || err.message || 'Failed to request reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    setResetError(null);
    try {
      const res = await api.resetPassword(resetToken.trim(), newPassword.trim());
      setResetSuccess(res.message);
      setPassword(newPassword.trim());
      setEmail(resetEmail.trim());
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetStep(1);
        setResetToken('');
        setNewPassword('');
      }, 2000);
    } catch (err: any) {
      setResetError(err.response?.data?.detail || err.message || 'Failed to reset password.');
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isForgotPassword ? 'Reset Your Password' : 'Sign in to Krishisetu'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isForgotPassword
              ? 'Regain access to your agricultural marketplace account securely'
              : 'Access your agricultural marketplace, rental bookings, or vendor orders'}
          </p>
        </div>

        {!isForgotPassword ? (
          <>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetEmail(email);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
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
          </>
        ) : (
          /* Forgot / Reset Password Form */
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setResetError(null);
                setResetSuccess(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>

            {resetSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleRequestResetToken} className="space-y-4">
                <div>
                  <Input
                    label="Registered Email Address"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. farmer2@krishisetu.com"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    We will generate a verified one-time cryptographic reset token.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Generate Reset Token
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <Input
                    label="Password Reset Token"
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                  />
                </div>

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Confirm New Password
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
'''

with open('frontend/src/pages/Login.tsx', 'w', encoding='utf-8') as f:
    f.write(login_content)

print("SUCCESS: frontend/src/pages/Login.tsx updated")

