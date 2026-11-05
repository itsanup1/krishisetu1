my_eq_code = '''import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Equipment, OwnerDashboardStats } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Tractor, PlusCircle, Edit3, Trash2, CalendarCheck, MapPin, Clock, Coins, CheckCircle2, ShieldAlert } from 'lucide-react';

export const MyEquipment: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyEquipment = async () => {
    setIsLoading(true);
    try {
      const [data, ownerStats] = await Promise.all([
        api.getMyListedEquipment().catch(() => []),
        api.getOwnerDashboardStats().catch(() => null),
      ]);
      setEquipmentList(data || []);
      setStats(ownerStats);
    } catch (e) {
      console.error('Error fetching my equipment', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEquipment();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this equipment listing? Active rentals will be safely preserved.')) return;
    try {
      await api.deleteEquipment(id);
      await fetchMyEquipment();
    } catch (e: any) {
      alert(e.message || 'Error deactivating equipment');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Tractor className="w-4 h-4 text-amber-600" />
            Equipment Owner Management
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Machinery Owner Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            List and manage farm equipment available for rental to neighboring farmers with automated availability enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/owner/bookings">
            <Button variant="outline" size="sm" leftIcon={<CalendarCheck className="w-4 h-4" />}>
              Incoming Requests {stats && stats.pending_requests_count > 0 && `(${stats.pending_requests_count})`}
            </Button>
          </Link>
          <Link to="/equipment/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              List New Equipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Owner Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Machinery</span>
              <Tractor className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_listings_count}</div>
            <span className="text-[11px] text-slate-400">Listed Fleet Units</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Requests</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600">{stats.pending_requests_count}</div>
            <span className="text-[11px] text-slate-400">Require Owner Approval</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active Deployments</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.active_rentals_count}</div>
            <span className="text-[11px] text-slate-400">Currently in Field</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Rental Earnings</span>
              <Coins className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-black text-slate-900">₹{stats.total_rental_earnings.toLocaleString('en-IN')}</div>
            <span className="text-[11px] text-slate-400">Confirmed Rent Payments</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Loading your machinery listings..." />
      ) : equipmentList.length === 0 ? (
        <EmptyState
          icon={<Tractor className="w-8 h-8 text-amber-600" />}
          title="No Equipment Listed Yet"
          description="Monetize your tractors, harvesters, or tillers by listing them on Krishisetu's FCFS rental engine."
          actionLabel="List My Equipment"
          onAction={() => (window.location.href = '/equipment/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={eq.image_url}
                    alt={eq.name}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src = '/assets/images/mahindra_red_tractor_1791501058296.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                      {eq.type}
                    </span>
                    {(eq.rental_id || eq.product_id) && (
                      <span className="bg-slate-900/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        ID: {eq.rental_id || eq.product_id}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-xs">
                    ₹{eq.rate} / {eq.rate_unit.toLowerCase()}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-base">{eq.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{eq.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{eq.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                <Link to={`/equipment/edit/${eq.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                    Edit Listing
                  </Button>
                </Link>
                <button
                  onClick={() => handleDelete(eq.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                  title="Deactivate listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
'''

with open('frontend/src/pages/MyEquipment.tsx', 'w', encoding='utf-8') as f:
    f.write(my_eq_code)

print("SUCCESS: frontend/src/pages/MyEquipment.tsx updated")

