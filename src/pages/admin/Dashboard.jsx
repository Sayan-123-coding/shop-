import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../components/ui/Toast';
import { Package, Tags, CheckCircle, AlertCircle, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const { shopId } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    hiddenProducts: 0,
    totalCategories: 0
  });

  useEffect(() => {
    async function fetchDashboardData() {
      if (!shopId) return;
      try {
        setLoading(true);
        const [products, categories] = await Promise.all([
          productService.getProducts(shopId),
          categoryService.getCategories(shopId)
        ]);

        const available = products.filter(p => p.availability === 'available').length;
        const outOfStock = products.filter(p => p.availability === 'out_of_stock').length;
        const hidden = products.filter(p => p.availability === 'hidden').length;

        setStats({
          totalProducts: products.length,
          availableProducts: available,
          outOfStockProducts: outOfStock,
          hiddenProducts: hidden,
          totalCategories: categories.length
        });
      } catch (err) {
        console.error("Dashboard error:", err);
        showToast("Failed to load dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [shopId, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-32 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
      
      {stats.totalProducts === 0 && stats.totalCategories === 0 ? (
        <div className="card empty-state">
          <Package size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Welcome to your new store!</h2>
          <p className="text-gray-500 max-w-md">
            Your catalogue is currently empty. Add your first categories and products to start building your digital storefront.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card card-sm stat-card">
            <div className="stat-card-header text-gray-500">
              <Package size={20} />
              <span className="font-medium">Total Products</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </div>

          <div className="card card-sm stat-card">
            <div className="stat-card-header text-success">
              <CheckCircle size={20} />
              <span className="font-medium">Available</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.availableProducts}</div>
          </div>

          <div className="card card-sm stat-card">
            <div className="stat-card-header text-warning">
              <AlertCircle size={20} />
              <span className="font-medium">Out of Stock</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.outOfStockProducts}</div>
          </div>

          <div className="card card-sm stat-card">
            <div className="stat-card-header text-gray-500">
              <EyeOff size={20} />
              <span className="font-medium">Hidden</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.hiddenProducts}</div>
          </div>

          <div className="card card-sm stat-card">
            <div className="stat-card-header text-primary">
              <Tags size={20} />
              <span className="font-medium">Categories</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalCategories}</div>
          </div>
        </div>
      )}
    </div>
  );
}
