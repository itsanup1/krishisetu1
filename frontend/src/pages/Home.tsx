import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Equipment } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/marketplace/ProductCard';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { Button } from '../components/common/Button';
import {
  Sprout,
  Tractor,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Users,
  Store,
  Truck,
  Sparkles,
  Search,
  Flame,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredEquipment, setFeaturedEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, eq] = await Promise.all([
          api.getProducts(),
          api.getEquipment(),
        ]);
        setFeaturedProducts(prods.slice(0, 6));
        setFeaturedEquipment(eq.slice(0, 6));
      } catch (e) {
        console.error('Failed loading home data', e);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16 bg-white">
      {/* HERO SECTION */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Agricultural Marketplace & Machinery Sharing</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Direct Agricultural Marketplace & Farm Equipment Rental
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Order certified seeds, fertilizers, pesticides, irrigation pipes, and sprayers directly from verified agro suppliers. Rent tractors, rotavators, cultivators, and combine harvesters on-demand with our transparent First-Come, First-Served queue.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/products">
                  <Button size="md" variant="primary" leftIcon={<Sprout className="w-4 h-4" />}>
                    Browse Agri Inputs
                  </Button>
                </Link>
                <Link to="/equipment">
                  <Button size="md" variant="primary" leftIcon={<Tractor className="w-4 h-4" />}>
                    Book Farm Machinery
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-200 max-w-lg">
                <div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">100% Certified</div>
                  <div className="text-xs text-slate-500">ICAR & Govt Tested</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700">Fair FCFS</div>
                  <div className="text-xs text-slate-500">Transparent Queuing</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900">Direct Delivery</div>
                  <div className="text-xs text-slate-500">Pan-India Dispatch</div>
                </div>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Platform Services
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live Catalog & Fleet
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/products"
                    className="block p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          Agricultural Input Marketplace
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          High-germination hybrid seeds, fertilizers, bio-pesticides, HDPE irrigation pipes, and battery sprayers.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/equipment"
                    className="block p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Tractor className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          Machinery Rental & Scheduling
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Book local tractors, rotavators, cultivators, and harvesters with 24-hour reservation confirmation.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span>Direct farmer pricing with no middlemen markups</span>
                    <span className="font-semibold text-slate-900">₹ INR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORY NAVIGATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            to="/products?category=SEEDS"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Certified Seeds</h3>
              <p className="text-xs text-slate-500 mt-0.5">Wheat, paddy, cotton & maize</p>
            </div>
          </Link>

          <Link
            to="/products?category=FERTILIZER"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Soil Fertilizers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Urea, NPK, DAP & compost</p>
            </div>
          </Link>

          <Link
            to="/products?category=PESTICIDE"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pesticides</h3>
              <p className="text-xs text-slate-500 mt-0.5">Neem oil & systemic fungicides</p>
            </div>
          </Link>

          <Link
            to="/products?category=IRRIGATION"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Irrigation Pipes</h3>
              <p className="text-xs text-slate-500 mt-0.5">HDPE drip coils & rain guns</p>
            </div>
          </Link>

          <Link
            to="/products?category=SPRAYER"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Farm Sprayers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Battery knapsack & mist blowers</p>
            </div>
          </Link>

          <Link
            to="/equipment"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition bg-white flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Farm Machinery</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tractors, harvesters & tillers</p>
            </div>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Marketplace</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Agricultural Inputs & Farm Supplies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Certified seeds, fertilizers, pesticides, irrigation pipes, and sprayers from verified vendors</p>
          </div>
          <Link to="/products">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All 14 Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* HOW FCFS QUEUE WORKS */}
      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Machinery Sharing Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Transparent First-Come, First-Served Booking
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Equitable access to expensive farm mechanization for every farmer with clear reservation timelines and automated status updates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center mb-3 text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Select Dates</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose the required start and completion dates for your field preparation, sowing, or harvest.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center mb-3 text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Confirmation Window</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If the slot is open, you receive an exclusive 24-hour reservation window to lock in your booking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center mb-3 text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Transparent Queue</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If another farmer requested the slot first, you are assigned an exact queue rank (#2, #3) with live tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center mb-3 text-xs">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Automated Promotion</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If a pending booking expires or cancels, the next farmer in line is automatically notified and promoted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MACHINERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Mechanization Hub</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Machinery Available for Rent
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">High-capacity tractors, tillers, and harvesters available in your district</p>
          </div>
          <Link to="/equipment">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Equipment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredEquipment.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} />
          ))}
        </div>
      </section>

      {/* PLATFORM BENEFITS FOR USERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* For Farmers */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Farmers</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> Certified inputs with transparent pricing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> On-demand tractors & harvesters without high capital cost
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> Guaranteed reservation windows with FCFS transparency
              </li>
            </ul>
          </div>

          {/* For Equipment Owners */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Tractor className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Equipment Owners</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" /> Monetize idle farm machinery during off-peak days
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" /> Automated calendar management and booking queue
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" /> Direct communication with verified neighboring farmers
              </li>
            </ul>
          </div>

          {/* For Input Vendors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Input Vendors</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" /> Direct access to farmers across agricultural clusters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" /> Streamlined digital orders and inventory management
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" /> Fast digital payment settlement
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-center text-white">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Modernize Your Farm Operations with KrishiSetu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Order tested inputs delivered directly to your farm, or list your machinery to earn reliable rental revenue.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link to="/products">
                <Button size="md" variant="primary" leftIcon={<Sprout className="w-4 h-4" />}>
                  Explore Marketplace
                </Button>
              </Link>
              <Link to="/equipment">
                <Button size="md" variant="primary" leftIcon={<Tractor className="w-4 h-4" />}>
                  Book Machinery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
