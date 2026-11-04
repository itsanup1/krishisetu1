import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Sprout,
  Tractor,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Store,
  CalendarDays,
  PlusCircle,
  PhoneCall,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isBackendConnected, logout, quickSwitchUser } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickSwitchOpen, setQuickSwitchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Utility Bar */}
      <div className="bg-slate-100 text-slate-600 text-xs px-4 py-1.5 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <PhoneCall className="w-3 h-3 text-emerald-700" />
              Kisan Helpline: <span className="font-semibold text-slate-900">1800-123-5747</span> (Toll Free)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-slate-600">
              Verified Agri-Inputs & Transparent Equipment Rental
            </span>
          </div>

          {/* Backend Status Badge & Discreet Persona Switcher */}
          <div className="relative flex items-center gap-2.5">
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                isBackendConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                isBackendConnected
                  ? 'Connected to FastAPI Backend (http://localhost:8000)'
                  : 'Operating in Offline Demo Mode'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isBackendConnected ? 'Backend Connected' : 'Offline Demo Mode'}</span>
            </div>

            <span className="text-[11px] text-slate-500 hidden md:inline">Current View:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickSwitchOpen(!quickSwitchOpen)}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 px-2 py-0.5 rounded border border-slate-300 text-[11px] font-medium transition cursor-pointer"
                title="Switch between Farmer, Equipment Owner, Vendor, and Admin view"
              >
                <UserCheck className="w-3 h-3 text-emerald-700" />
                <span className="text-slate-900 font-semibold">
                  {user?.role === 'ADMIN'
                    ? 'Administrator'
                    : user?.role === 'VENDOR'
                    ? 'Agro Vendor'
                    : user?.is_equipment_owner
                    ? 'Farmer & Machinery Owner'
                    : 'Farmer (Buyer/Renter)'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {quickSwitchOpen && (
                <div
                  className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800"
                  onClick={() => setQuickSwitchOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Account
                  </div>
                  <button
                    onClick={() => quickSwitchUser('FARMER_OWNER')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Ramesh Kumar</p>
                      <p className="text-[10px] text-slate-500">Farmer & Equipment Owner (Nashik)</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                      Owner
                    </span>
                  </button>
                  <button
                    onClick={() => quickSwitchUser('FARMER')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Suresh Patil</p>
                      <p className="text-[10px] text-slate-500">Farmer (Pune)</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                      Buyer/Renter
                    </span>
                  </button>
                  <button
                    onClick={() => quickSwitchUser('VENDOR')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">Kisan Agro Krishi Kendra</p>
                      <p className="text-[10px] text-slate-500">Verified Input Vendor (Nagpur)</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                      Vendor
                    </span>
                  </button>
                  <button
                    onClick={() => quickSwitchUser('ADMIN')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">KrishiSetu Operations</p>
                      <p className="text-[10px] text-slate-500">Platform Governance & Audit</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Krishi<span className="text-emerald-700">Setu</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
                  Agri Marketplace & Machinery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/products"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive('/products')
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/equipment"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive('/equipment')
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Equipment Rental
              </Link>
              <Link
                to="/crop-doctor"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition inline-flex items-center gap-1.5 ${
                  isActive('/crop-doctor')
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>AI Crop Doctor</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Icon (for Farmers) */}
            {(!user || user.role === 'FARMER') && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-700 text-white rounded-full text-xs font-semibold flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Authenticated User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="leading-tight hidden lg:block">
                    <p className="text-xs font-semibold text-slate-900 max-w-[130px] truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {user.role} {user.is_equipment_owner ? '• Owner' : ''}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 divide-y divide-slate-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.location}</p>
                    </div>

                    {/* Role specific navigation */}
                    <div className="py-1">
                      {user.role === 'FARMER' && (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" /> Farmer Dashboard
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <ShoppingCart className="w-4 h-4 text-slate-500" /> My Orders
                          </Link>
                          <Link
                            to="/bookings"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <CalendarDays className="w-4 h-4 text-slate-500" /> My Equipment Bookings
                          </Link>
                        </>
                      )}

                      {user.is_equipment_owner && (
                        <>
                          <div className="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Machinery Owner
                          </div>
                          <Link
                            to="/owner/equipment"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Tractor className="w-4 h-4 text-slate-500" /> Manage My Equipment
                          </Link>
                          <Link
                            to="/owner/bookings"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <CalendarDays className="w-4 h-4 text-slate-500" /> Incoming Booking Queue
                          </Link>
                          <Link
                            to="/equipment/new"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <PlusCircle className="w-4 h-4 text-slate-500" /> List New Equipment
                          </Link>
                        </>
                      )}

                      {user.role === 'VENDOR' && (
                        <>
                          <Link
                            to="/vendor/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" /> Vendor Dashboard
                          </Link>
                          <Link
                            to="/vendor/products"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Store className="w-4 h-4 text-slate-500" /> Product Inventory & Pricing
                          </Link>
                          <Link
                            to="/vendor/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <ShoppingCart className="w-4 h-4 text-slate-500" /> Dispatch Orders
                          </Link>
                        </>
                      )}

                      {user.role === 'ADMIN' && (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-500" /> Admin Console
                          </Link>
                          <Link
                            to="/admin/orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <ShoppingCart className="w-4 h-4 text-slate-500" /> Platform Orders
                          </Link>
                          <Link
                            to="/admin/users"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <UserCheck className="w-4 h-4 text-slate-500" /> User Registry
                          </Link>
                          <Link
                            to="/admin/bookings"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <CalendarDays className="w-4 h-4 text-slate-500" /> FCFS Rental Queues
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-t border-slate-100 mt-1"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" /> My Profile & Settings
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 w-full text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {(!user || user.role === 'FARMER') && (
              <Link to="/cart" className="relative p-2 text-slate-700">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Agricultural Marketplace
          </Link>
          <Link
            to="/equipment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Equipment Rental
          </Link>
          <Link
            to="/crop-doctor"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-emerald-800 bg-emerald-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Crop Doctor</span>
          </Link>
          {isAuthenticated && user && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">
                {user.name} ({user.role})
              </div>
              {user.role === 'FARMER' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Farmer Dashboard
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Orders
                  </Link>
                </>
              )}
              {user.is_equipment_owner && (
                <Link
                  to="/owner/equipment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Manage Equipment
                </Link>
              )}
              {user.role === 'VENDOR' && (
                <Link
                  to="/vendor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Vendor Dashboard
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
