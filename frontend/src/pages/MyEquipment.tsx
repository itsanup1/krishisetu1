import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Equipment } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Tractor, PlusCircle, Edit3, Trash2, CalendarCheck, MapPin, Clock } from 'lucide-react';

export const MyEquipment: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyListedEquipment();
      setEquipmentList(data);
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
    if (!confirm('Are you sure you want to delete this equipment listing?')) return;
    try {
      await api.deleteEquipment(id);
      await fetchMyEquipment();
    } catch (e: any) {
      alert(e.message || 'Error deleting equipment');
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Machinery Listings</h1>
          <p className="text-sm text-slate-500 mt-1">
            List and manage farm equipment available for rental to neighboring farmers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/owner/bookings">
            <Button variant="outline" size="sm" leftIcon={<CalendarCheck className="w-4 h-4" />}>
              Incoming Queue Requests
            </Button>
          </Link>
          <Link to="/equipment/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add New Equipment
            </Button>
          </Link>
        </div>
      </div>

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
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                      {eq.type}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{eq.name}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {eq.location}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{eq.rate} / {eq.rate_unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{eq.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <Link to={`/owner/bookings?equipment_id=${eq.id}`} className="text-xs font-bold text-emerald-600 hover:underline">
                  View Bookings
                </Link>

                <div className="flex items-center gap-2">
                  <Link to={`/equipment/edit/${eq.id}`}>
                    <button
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(eq.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
