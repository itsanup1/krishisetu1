import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCategory } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ArrowLeft, Package, Save } from 'lucide-react';

export const VendorProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('SEEDS');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('450');
  const [stock, setStock] = useState('100');
  const [imageUrl, setImageUrl] = useState(
    '/assets/images/wheat_seeds_sack_1791500903435.jpg'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      api.getProduct(parseInt(id, 10)).then((p) => {
        if (p) {
          setName(p.name);
          setCategory(p.category);
          setDescription(p.description);
          setPrice(p.price.toString());
          setStock(p.stock.toString());
          setImageUrl(p.image_url);
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
      category,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      image_url: imageUrl,
    };

    try {
      if (isEdit && id) {
        await api.updateProduct(parseInt(id, 10), payload);
      } else {
        await api.createProduct(payload);
      }
      navigate('/vendor/products');
    } catch (err: any) {
      setError(err.message || 'Failed saving product item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        to="/vendor/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Update Catalog Product' : 'Add Agricultural Input to Marketplace'}
            </h1>
            <p className="text-xs text-slate-500">
              List certified seeds, fertilizers, pesticides, irrigation pipes, or sprayers
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
            label="Product Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Certified HD-2967 High Yield Wheat Seeds"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Input Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              options={[
                { value: 'SEEDS', label: 'Certified Seeds' },
                { value: 'FERTILIZER', label: 'Fertilizers & Nutrients' },
                { value: 'PESTICIDE', label: 'Pesticides & Crop Care' },
                { value: 'IRRIGATION', label: 'Irrigation Pipes & Drip' },
                { value: 'SPRAYER', label: 'Agricultural Sprayers' },
              ]}
            />

            <Input
              label="Price (₹)"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450"
            />

            <Input
              label="Available Stock Units"
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description & Recommended Dosage
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide crop suitability, germination rate, application per acre, and batch specs..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <Input
            label="Product Image URL"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/vendor/products">
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
              {isEdit ? 'Save Changes' : 'Publish Product to Marketplace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
