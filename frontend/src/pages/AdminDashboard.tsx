import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminStats } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ShieldAlert,
  Users,
  Package,
  Tractor,
  ShoppingCart,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Database,
  Server,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (e) {
        console.error('Error fetching admin stats', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <LoadingSpinner message="Loading Krishisetu administrative overview..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Platform Administration & Governance
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            KrishiSetu Administrative Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Platform telemetry: Registered users, marketplace volume, machinery utilization, and automated FCFS queue scheduling.
          </p>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total_users}</div>
          <span className="text-xs text-slate-400">Farmers, Owners & Vendors</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total_products}</div>
          <span className="text-xs text-slate-400">Seeds, Fertilizers & Pesticides</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Farm Machinery</span>
            <Tractor className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total_equipment}</div>
          <span className="text-xs text-slate-400">Tractors, Harvesters & Tillers</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Marketplace GMV</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{stats.total_revenue.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-400">Over {stats.total_orders} Total Orders</span>
        </div>
      </div>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">User Governance</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect all registered farmers, equipment owners, and agro chemical vendors across districts.
          </p>
          <Link to="/admin/users" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View User Registry
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">FCFS Rental Queue</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect live booking requests, 24-hour confirmation windows, and queue sequence priorities.
          </p>
          <Link to="/admin/bookings" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Inspect FCFS Queues
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Platform Orders</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Monitor Razorpay payment verifications, vendor fulfillment stages, and shipment deliveries.
          </p>
          <Link to="/admin/orders" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Platform Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Technical Architecture Overview */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" /> Platform Architecture Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> FCFS Queue Logic
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Implemented server-side using transactional database locks (<code className="text-slate-200 font-mono">with_for_update()</code>) to eliminate race conditions when multiple farmers simultaneously request overlapping dates.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Normalized Schemas
            </h4>
            <p className="text-slate-400 leading-relaxed">
              PostgreSQL relational models for <code className="text-slate-200 font-mono">users, products, orders, order_items, equipment, booking_requests</code> with foreign key constraints, indexes, and Alembic migrations.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Role-Based Access Control
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Three clean enum roles (<code className="text-slate-200 font-mono">FARMER, VENDOR, ADMIN</code>). Farmers with <code className="text-slate-200 font-mono">is_equipment_owner=True</code> inherit equipment listing capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
