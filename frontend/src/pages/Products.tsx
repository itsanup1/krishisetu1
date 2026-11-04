import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { ProductFilters } from '../components/marketplace/ProductFilters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'ALL';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts(selectedCategory, searchQuery);
      setProducts(data);
    } catch (e) {
      console.error('Error fetching products', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'ALL') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Agricultural Marketplace</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Order certified seeds, fertilizers, pesticides, irrigation pipes, and agricultural sprayers directly from registered agro vendors with doorstep dispatch.
        </p>
      </div>

      {/* Filter toolbar */}
      <ProductFilters
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message="Loading marketplace products..." />
      ) : (
        <ProductGrid products={products} onResetFilters={handleResetFilters} />
      )}
    </div>
  );
};
