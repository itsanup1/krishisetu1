import React from 'react';
import { Equipment } from '../../types';
import { EquipmentCard } from './EquipmentCard';
import { EmptyState } from '../common/EmptyState';
import { Tractor } from 'lucide-react';

interface EquipmentGridProps {
  equipmentList: Equipment[];
  onResetFilters?: () => void;
}

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({ equipmentList, onResetFilters }) => {
  if (equipmentList.length === 0) {
    return (
      <EmptyState
        icon={<Tractor className="w-8 h-8 text-emerald-600" />}
        title="No Farm Equipment Found"
        description="Try searching for a different equipment type (Tractor, Rotavator, Harvester) or location."
        actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipmentList.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
};
