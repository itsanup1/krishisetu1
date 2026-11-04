import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Prop Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Certified Inputs</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                ICAR & government verified seeds, fertilizers, and plant nutrients.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Fair FCFS Rental Queue</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Transparent automated booking with 24-hour reservation window.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Direct Farm Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Reliable dispatch to rural pincodes across agricultural clusters.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Kisan Support Desk</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Dedicated advisory & booking support from 7:00 AM to 8:00 PM.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Krishi<span className="text-emerald-400">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's unified agricultural commerce and machinery sharing platform. Connecting farmers with certified input vendors and local equipment owners.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Helpline: 1800-123-5747</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>support@krishisetu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Agro Innovation Hub, Pune - 411045</span>
              </div>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Agri Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/products?category=SEEDS" className="hover:text-white transition">
                  Certified Hybrid Seeds
                </Link>
              </li>
              <li>
                <Link to="/products?category=FERTILIZER" className="hover:text-white transition">
                  Soil Nutrients & Fertilizers
                </Link>
              </li>
              <li>
                <Link to="/products?category=PESTICIDE" className="hover:text-white transition">
                  Bio & Chemical Crop Protection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">
                  Cart & Instant Checkout
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  Track Delivery Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Equipment Rental Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Equipment Rental
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/equipment?type=TRACTOR" className="hover:text-white transition">
                  Tractors (35 HP - 75 HP)
                </Link>
              </li>
              <li>
                <Link to="/equipment?type=ROTAVATOR" className="hover:text-white transition">
                  Rotavators & Power Tillers
                </Link>
              </li>
              <li>
                <Link to="/equipment?type=HARVESTER" className="hover:text-white transition">
                  Combine Harvesters
                </Link>
              </li>
              <li>
                <Link to="/equipment?type=SPRAYER" className="hover:text-white transition">
                  High-Pressure Boom Sprayers
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-white transition">
                  My Equipment Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Farmers & Partners
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/my-equipment" className="hover:text-white transition">
                  List Your Farm Machinery
                </Link>
              </li>
              <li>
                <Link to="/vendor/products" className="hover:text-white transition">
                  Vendor Partner Portal
                </Link>
              </li>
              <li>
                <Link to="/equipment" className="hover:text-white transition">
                  FCFS Booking Transparency Guide
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Farmer Account Center
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">
                  Admin Platform Operations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} KrishiSetu Agri-Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer">Return & Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
