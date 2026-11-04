import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Equipment } from '../../types';
import { MapPin, ArrowRight, User, Tractor } from 'lucide-react';
import { Button } from '../common/Button';

interface EquipmentCardProps {
  equipment: Equipment;
  onBookClick?: (equipment: Equipment) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const [imgError, setImgError] = useState(false);

  const formatType = (type: string) => {
    return type.replace('_', ' ');
  };

  const getAvailabilityBadge = () => {
    const units = equipment.stock_quantity ?? 1;
    if (equipment.availability_status === 'MAINTENANCE' || units <= 0) {
      return {
        label: 'In Maintenance',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (equipment.availability_status === 'HIGH_DEMAND') {
      return {
        label: `High Demand (${units} unit)`,
        className: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      label: `Available (${units} ${units === 1 ? 'unit' : 'units'})`,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  const availability = getAvailabilityBadge();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:border-slate-300 hover:shadow-sm transition flex flex-col group">
      {/* Image Container */}
      <Link to={`/equipment/${equipment.id}`} className="relative block h-48 overflow-hidden bg-slate-50">
        {!imgError && equipment.image_url ? (
          <img
            src={equipment.image_url}
            alt={equipment.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <Tractor className="w-8 h-8 text-slate-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-500">Agricultural Machinery</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-white/95 text-slate-800 border border-slate-200 shadow-2xs">
            {formatType(equipment.type)}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border shadow-2xs ${availability.className}`}
          >
            {availability.label}
          </span>
        </div>

        <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 text-white px-2.5 py-1 rounded text-xs font-semibold">
          ₹{equipment.rate} / {equipment.rate_unit.toLowerCase()}
        </div>
      </Link>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{equipment.location}</span>
          </div>

          <Link
            to={`/equipment/${equipment.id}`}
            className="text-sm font-bold text-slate-900 hover:text-emerald-700 line-clamp-1 transition mb-1.5 block"
          >
            {equipment.name}
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {equipment.description}
          </p>

          <div className="bg-slate-50 rounded-lg p-2 mb-3 text-[11px] text-slate-600 border border-slate-100">
            <span className="font-semibold text-slate-700 mr-1">Specs:</span>
            <span className="text-slate-500 line-clamp-1">{equipment.specifications}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">
              Owner: {equipment.owner_name || 'Verified Owner'}
            </span>
          </div>

          <Link to={`/equipment/${equipment.id}`} className="shrink-0">
            <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Rent (FCFS)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
