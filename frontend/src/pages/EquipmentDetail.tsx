import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Equipment, BookingRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/equipment/BookingModal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Layers,
  Sparkles,
  Tractor,
} from 'lucide-react';

export const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeBookings, setActiveBookings] = useState<BookingRequest[]>([]);
  const [imgError, setImgError] = useState(false);

  const fetchEquipmentDetail = async () => {
    if (!id) return;
    try {
      const data = await api.getEquipmentById(parseInt(id, 10));
      setEquipment(data);
      // Fetch bookings for this equipment to display schedule transparency
      const eqBookings = await api.getEquipmentBookings(parseInt(id, 10));
      const thisEqBookings = eqBookings.filter(
        (b) => b.status === 'CONFIRMED' || b.status === 'CONFIRMATION_PENDING'
      );
      setActiveBookings(thisEqBookings);
    } catch (e) {
      console.error('Failed fetching equipment detail', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetail();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading machinery specifications..." />;
  }

  if (!equipment) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Equipment Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">The equipment item could not be retrieved.</p>
        <Link to="/equipment">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Equipment
          </Button>
        </Link>
      </div>
    );
  }

  const isFarmer = !user || user.role === 'FARMER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        to="/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Equipment Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: Image and Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 h-80 sm:h-96 border border-slate-200">
            {!imgError && equipment.image_url ? (
              <img
                src={equipment.image_url}
                alt={equipment.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                <Tractor className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-xs font-medium text-slate-500">Farm Machinery</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-2xs">
                {equipment.type.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Description & Specs Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900">Machinery Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{equipment.description}</p>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" /> Technical Specifications
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-mono">
                {equipment.specifications}
              </p>
            </div>
          </div>

          {/* Live Schedule / Reserved Windows Transparency */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Currently Reserved Windows
            </h3>
            <p className="text-xs text-slate-500">
              Check these reserved slots to select an open window or prepare for the FCFS queue:
            </p>

            {activeBookings.length === 0 ? (
              <p className="text-xs font-medium text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                ✅ No active bookings currently booked! Your request will receive the immediate 24-hour Confirmation Window.
              </p>
            ) : (
              <div className="space-y-2">
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {new Date(b.start_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                        })}{' '}
                        —{' '}
                        {new Date(b.end_date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                        })}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Rental Info & Booking Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6 sticky top-24">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Equipment Rental Unit Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900">
                    ₹{equipment.rate}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    / per {equipment.rate_unit.toLowerCase()}
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  equipment.availability_status === 'HIGH_DEMAND'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {equipment.availability_status === 'HIGH_DEMAND'
                  ? `High Demand (${equipment.stock_quantity ?? 1} unit)`
                  : `Available (${equipment.stock_quantity ?? 1} ${(equipment.stock_quantity ?? 1) === 1 ? 'unit' : 'units'})`}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {equipment.name}
            </h1>

            {/* Location & Owner info */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Location:</strong> {equipment.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Machinery Owner:</strong> {equipment.owner_name || 'Verified Farmer Owner'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Fleet Quantity:</strong> {equipment.stock_quantity ?? 1} active machine(s)
                </span>
              </div>
              {equipment.owner_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong>Contact:</strong> +91 {equipment.owner_phone}
                  </span>
                </div>
              )}
            </div>

            {/* Booking rules explainer */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> FCFS Queue Policy
              </div>
              <ul className="text-[11px] text-amber-800 space-y-1 list-disc list-inside">
                <li>Non-overlapping requests get immediate confirmation priority.</li>
                <li>Confirmation window duration: <strong>24 Hours</strong>.</li>
                <li>If not confirmed in time, the system auto-promotes the next queued request!</li>
              </ul>
            </div>

            {/* Book Now Button */}
            {isFarmer ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsBookingModalOpen(true)}
                leftIcon={<Calendar className="w-5 h-5" />}
              >
                Request Rental Slot (FCFS)
              </Button>
            ) : (
              <div className="bg-slate-100 text-slate-600 text-xs p-3 rounded-xl text-center">
                Signed in as {user.role}. Switch to a Farmer account to submit booking requests.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          equipment={equipment}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={fetchEquipmentDetail}
        />
      )}
    </div>
  );
};
