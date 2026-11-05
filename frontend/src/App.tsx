import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleBasedRoute } from './components/routing/RoleBasedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { EquipmentList } from './pages/EquipmentList';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Bookings } from './pages/Bookings';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { MyEquipment } from './pages/MyEquipment';
import { EquipmentForm } from './pages/EquipmentForm';
import { EquipmentBookings } from './pages/EquipmentBookings';
import { VendorDashboard } from './pages/VendorDashboard';
import { VendorProducts } from './pages/VendorProducts';
import { VendorProductForm } from './pages/VendorProductForm';
import { VendorOrders } from './pages/VendorOrders';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminBookings } from './pages/AdminBookings';
import { AdminOrders } from './pages/AdminOrders';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Browsing Routes */}
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/equipment" element={<EquipmentList />} />
                <Route path="/equipment/:id" element={<EquipmentDetail />} />

                {/* Farmer / Customer Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <FarmerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <Bookings />
                    </ProtectedRoute>
                  }
                />

                {/* Equipment Owner Routes (Farmer with is_equipment_owner=true) */}
                <Route
                  path="/owner/equipment"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <MyEquipment />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/my-equipment"
                  element={<Navigate to="/owner/equipment" replace />}
                />
                <Route
                  path="/owner/bookings"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <EquipmentBookings />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/my-equipment/bookings"
                  element={<Navigate to="/owner/bookings" replace />}
                />
                <Route
                  path="/equipment/new"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <EquipmentForm />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/equipment/edit/:id"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <EquipmentForm />
                    </RoleBasedRoute>
                  }
                />

                {/* Vendor Routes */}
                <Route
                  path="/vendor/dashboard"
                  element={
                    <RoleBasedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                      <VendorDashboard />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/vendor/products"
                  element={
                    <RoleBasedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                      <VendorProducts />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/vendor/products/new"
                  element={
                    <RoleBasedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                      <VendorProductForm />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/vendor/products/edit/:id"
                  element={
                    <RoleBasedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                      <VendorProductForm />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/vendor/orders"
                  element={
                    <RoleBasedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                      <VendorOrders />
                    </RoleBasedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminUsers />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminBookings />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <RoleBasedRoute allowedRoles={['ADMIN']}>
                      <AdminOrders />
                    </RoleBasedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
