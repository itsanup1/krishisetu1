import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Sprout, UserPlus, AlertCircle, Tractor } from 'lucide-react';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<UserRole>('FARMER');
  const [isEquipmentOwner, setIsEquipmentOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        is_equipment_owner: role === 'FARMER' ? isEquipmentOwner : false,
        location,
      });

      if (role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Krishisetu Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join India's fair agricultural marketplace & machinery rental network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Primary Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('FARMER');
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  role === 'FARMER'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-bold text-sm block">Farmer</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Buy seeds & rent farm equipment
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('VENDOR');
                  setIsEquipmentOwner(false);
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  role === 'VENDOR'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-bold text-sm block">Agri Vendor</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Sell seeds, fertilizer, & pesticides
                </span>
              </button>
            </div>
          </div>

          {/* If farmer, optional equipment owner toggle */}
          {role === 'FARMER' && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-start gap-3">
              <input
                type="checkbox"
                id="isOwnerCheckbox"
                checked={isEquipmentOwner}
                onChange={(e) => setIsEquipmentOwner(e.target.checked)}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="isOwnerCheckbox" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Tractor className="w-3.5 h-3.5 text-emerald-600" /> I am also an Equipment Owner
                </span>
                <span className="text-slate-500 text-[11px]">
                  Check this if you own tractors, rotavators, or harvesters and wish to earn rental income via the FCFS queue.
                </span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patil"
            />
            <Input
              label="Phone Number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@krishisetu.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <Input
            label="Location (Taluka / District / State)"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Niphad, Nashik, Maharashtra"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Account
          </Button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link to="/login" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
