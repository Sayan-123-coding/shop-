import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Collections from './pages/Collections';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import Categories from './pages/admin/Categories';
import Settings from './pages/admin/Settings';

// Auth Guard for Protected Routes
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return children ? children : <Outlet />;
}

// Public Route Guard (prevents logged in users from seeing login page)
function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (session) return <Navigate to="/admin" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:category" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin Login Route (Public Only) */}
        <Route 
          path="/admin/login" 
          element={
            <PublicOnlyRoute>
              <AdminLogin />
            </PublicOnlyRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
