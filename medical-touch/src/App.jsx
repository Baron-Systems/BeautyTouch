import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminCategoryProductsPage from './pages/admin/AdminCategoryProductsPage.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import AdminProfitsPage from './pages/admin/AdminProfitsPage.jsx'
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage.jsx'
import AdminBrandsPage from './pages/admin/AdminBrandsPage.jsx'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx'
import BrandPage from './pages/BrandPage.jsx'
import MyOrdersPage from './pages/MyOrdersPage.jsx'

function AdminRoute({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

function AppContent() {
  const { theme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className={`min-h-screen flex flex-col bg-white ${theme === 'dark' ? 'dark' : ''}`}>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:productId" element={<AdminProductForm />} />
          <Route path="products/category/:categoryId" element={<AdminCategoryProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="profits" element={<AdminProfitsPage />} />
          <Route path="delivery" element={<AdminDeliveryPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>

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
                  <Route path="/brand/:brandId" element={<BrandPage />} />
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
