import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { EquipmentType, RateUnit } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ArrowLeft, Tractor, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EquipmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [type, setType] = useState<EquipmentType>('TRACTOR');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('650');
  const [rateUnit, setRateUnit] = useState<RateUnit>('HOUR');
  const [specifications, setSpecifications] = useState('');
  const [location, setLocation] = useState(user?.location || 'Nashik, Maharashtra');
  const [imageUrl, setImageUrl] = useState(
    '/assets/images/mahindra_red_tractor_1791501058296.jpg'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      api.getEquipmentById(parseInt(id, 10)).then((eq) => {
        if (eq) {
          setName(eq.name);
          setType(eq.type);
          setDescription(eq.description);
          setRate(eq.rate.toString());
          setRateUnit(eq.rate_unit);
          setSpecifications(eq.specifications);
          setLocation(eq.location);
          setImageUrl(eq.image_url);
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      name,
      type,
      description,
      rate: parseFloat(rate),
      rate_unit: rateUnit,
      specifications,
      location,
      image_url: imageUrl,
    };

    try {
      if (isEdit && id) {
        await api.updateEquipment(parseInt(id, 10), payload);
      } else {
        await api.createEquipment(payload);
      }
      navigate('/owner/equipment');
    } catch (err: any) {
      setError(err.message || 'Failed saving equipment listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/owner/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Machinery
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Tractor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Update Machinery Listing' : 'List Farm Machinery for Rent'}
            </h1>
            <p className="text-xs text-slate-500">
              Provide accurate specs and rates for the automated FCFS rental queue
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Equipment Model / Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mahindra 575 DI Sarpanch 45HP"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Equipment Category"
              value={type}
              onChange={(e) => setType(e.target.value as EquipmentType)}
              options={[
                { value: 'TRACTOR', label: 'Tractor' },
                { value: 'ROTAVATOR', label: 'Rotavator / Rotary Tiller' },
                { value: 'HARVESTER', label: 'Combine Harvester' },
                { value: 'CULTIVATOR', label: 'Cultivator & Plough' },
                { value: 'SEED_DRILL', label: 'Seed Drill' },
                { value: 'SPRAYER', label: 'Boom Sprayer' },
                { value: 'PLOUGH_LEVELER', label: 'Laser Land Leveler' },
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Rental Rate (₹)"
                type="number"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="650"
              />
              <Select
                label="Billing Unit"
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value as RateUnit)}
                options={[
                  { value: 'HOUR', label: 'Per Hour' },
                  { value: 'DAY', label: 'Per Day' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              General Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, suitable crops, and equipment capabilities..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <Input
            label="Technical Specifications"
            required
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            placeholder="e.g. 45 HP, 4 Cylinder Diesel, 8 Forward + 2 Reverse gears, Hydraulic Lift"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Equipment Location (Taluka / District)"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Niphad, Nashik"
            />

            <Input
              label="Image URL"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/owner/equipment">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isEdit ? 'Save Changes' : 'Publish Machinery Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
