filters_code = '''import React from 'react';
import { Search, MapPin, X, IndianRupee } from 'lucide-react';

interface EquipmentFiltersProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  maxPrice?: number;
  onMaxPriceChange: (price: number | undefined) => void;
}

const EQUIPMENT_TYPES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Machinery' },
  { id: 'TRACTOR', label: 'Tractors' },
  { id: 'ROTAVATOR', label: 'Rotavators' },
  { id: 'HARVESTER', label: 'Harvesters' },
  { id: 'CULTIVATOR', label: 'Cultivators & Ploughs' },
  { id: 'SEED_DRILL', label: 'Seed Drills' },
  { id: 'SPRAYER', label: 'Boom Sprayers' },
  { id: 'PLOUGH_LEVELER', label: 'Laser Land Levelers' },
];

export const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({
  selectedType,
  onSelectType,
  selectedLocation,
  onLocationChange,
  searchQuery,
  onSearchChange,
  maxPrice,
  onMaxPriceChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search query */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment by model..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location filter */}
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by district or city..."
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition"
          />
          {selectedLocation && (
            <button
              onClick={() => onLocationChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Price filter */}
        <div className="relative">
          <select
            value={maxPrice !== undefined ? maxPrice.toString() : ''}
            onChange={(e) => {
              const val = e.target.value;
              onMaxPriceChange(val ? parseFloat(val) : undefined);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition cursor-pointer"
          >
            <option value="">All Rental Prices</option>
            <option value="500">Under ₹500 / hr</option>
            <option value="800">Under ₹800 / hr</option>
            <option value="1200">Under ₹1,200 / hr</option>
            <option value="2000">Under ₹2,000 / hr</option>
          </select>
        </div>
      </div>

      {/* Equipment Type tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
        {EQUIPMENT_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
'''

with open('frontend/src/components/equipment/EquipmentFilters.tsx', 'w', encoding='utf-8') as f:
    f.write(filters_code)

print("SUCCESS: frontend/src/components/equipment/EquipmentFilters.tsx updated")

