import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import HomePage from './pages/HomePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import MyOrdersPage from './pages/MyOrdersPage.jsx'

function AdminRoute({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

function AppContent() {

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/edit/:productId"
          element={
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category/:categorySlug" element={<CategoryPage />} />
                  <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                </Routes>
              </main>
              <Footer />
              <InstallPrompt />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
