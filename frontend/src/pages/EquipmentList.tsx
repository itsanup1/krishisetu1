import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Equipment } from '../types';
import { api } from '../services/api';
import { EquipmentGrid } from '../components/equipment/EquipmentGrid';
import { EquipmentFilters } from '../components/equipment/EquipmentFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Clock, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const EquipmentList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'ALL';

  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEquipment(selectedType, selectedLocation, searchQuery);
      setEquipmentList(data);
    } catch (e) {
      console.error('Error fetching equipment list', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedType, selectedLocation, searchQuery]);

  const handleTypeSelect = (t: string) => {
    setSelectedType(t);
    if (t === 'ALL') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', t);
    }
    setSearchParams(searchParams);
  };

  const handleReset = () => {
    setSelectedType('ALL');
    setSelectedLocation('');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Farm Equipment Rental
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Rent tractors, rotavators, seed drills, and combine harvesters directly from local machinery owners with our automated First-Come, First-Served (FCFS) queue system.
          </p>
        </div>

        {user?.is_equipment_owner && (
          <Link to="/equipment/new">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              List My Machinery
            </Button>
          </Link>
        )}
      </div>

      {/* FCFS Queue Explanation Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">First-Come, First-Served (FCFS) Scheduling Policy</span>
            <span className="text-slate-500 text-[11px]">
              Submitting a booking grants an exclusive 24-hour confirmation window if open, or an exact queue position (#2, #3) if previously requested.
            </span>
          </div>
        </div>
        <Link to="/bookings" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap">
          View My Bookings →
        </Link>
      </div>

      {/* Filter toolbar */}
      <EquipmentFilters
        selectedType={selectedType}
        onSelectType={handleTypeSelect}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading agricultural machinery fleet..." />
      ) : (
        <EquipmentGrid equipmentList={equipmentList} onResetFilters={handleReset} />
      )}
    </div>
  );
};
