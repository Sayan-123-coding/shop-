import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../components/ui/Toast';
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function Products() {
  const { shopId } = useAuth();
  const { showToast } = useToast();
  
  const [products, setProducts] = [useState([]), useState([])][0];
  const [_products, _setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!shopId) return;
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          productService.getProducts(shopId),
          categoryService.getCategories(shopId)
        ]);
        _setProducts(prods);
        setCategories(cats);
      } catch (err) {
        showToast("Failed to load products.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [shopId, showToast]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsDeleting(id);
      await productService.deleteProduct(id, shopId);
      _setProducts(prev => prev.filter(p => p.id !== id));
      showToast("Product deleted successfully.");
    } catch (err) {
      showToast("Failed to delete product.", "error");
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = _products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchAvailability = filterAvailability === 'all' || p.availability === filterAvailability;
    const matchCategory = filterCategory === 'all' || p.category_id === filterCategory;
    return matchSearch && matchAvailability && matchCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-heading">Products</h1>
          <div className="skeleton h-10 w-32"></div>
        </div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          <Plus size={18} className="mr-2" /> Add Product
        </Link>
      </div>

      <div className="card">
        <div className="filter-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="form-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-input"
            value={filterAvailability}
            onChange={e => setFilterAvailability(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="hidden">Hidden</option>
          </select>
          <select 
            className="form-input"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Search size={32} />
            <h2>No products found</h2>
            <p>We couldn't find any products matching your search or filter criteria.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name / SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
                return (
                  <tr key={product.id}>
                    <td className="w-16">
                      <div className="w-12 h-12 rounded border bg-gray-50 overflow-hidden flex items-center justify-center">
                        {primaryImage ? (
                          <img src={primaryImage.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-300" size={24} />
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.sku && <div className="text-xs text-gray-500">SKU: {product.sku}</div>}
                    </td>
                    <td>{product.category?.name || '-'}</td>
                    <td className="font-medium">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}
                    </td>
                    <td>
                      <span className={`badge ${
                        product.availability === 'available' ? 'badge-success' : 
                        product.availability === 'hidden' ? 'badge-neutral' : 'badge-error'
                      }`}>
                        {product.availability.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.is_published ? 'badge-success' : 'badge-neutral'}`}>
                        {product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/admin/products/${product.id}/edit`} 
                          className="p-2 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isDeleting === product.id}
                          className="p-2 text-gray-500 hover:text-error transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
