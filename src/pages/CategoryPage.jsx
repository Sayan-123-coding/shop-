import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PackageX, ArrowLeft } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';
import ProductCard from '../components/product/ProductCard';

export default function CategoryPage() {
  const { category: categorySlug } = useParams();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const [catData, shopData] = await Promise.all([
          catalogueService.getProductsByCategory(categorySlug),
          catalogueService.getShop()
        ]);
        
        const { category: cat, products: prods } = catData;
        
        setShop(shopData);
        if (cat) {
          setCategory(cat);
          setProducts(prods || []);
          if (shopData?.name) {
            document.title = `${cat.name} — ${shopData.name}`;
          } else {
            document.title = `${cat.name} — Premium Footwear`;
          }
        } else {
          setCategory(null);
          document.title = "Category Not Found — Premium Footwear";
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Something went wrong while loading this category.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="store-page">
        <div className="store-container" style={{ padding: '40px 0' }}>
          <div className="skeleton-line" style={{ width: '100px', marginBottom: '16px' }}></div>
          <div className="skeleton-line" style={{ width: '250px', height: '40px', marginBottom: '16px' }}></div>
          <div className="skeleton-line" style={{ width: '30%', height: '24px', marginBottom: '40px' }}></div>
          
          <div className="product-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-line" style={{ width: '40%' }}></div>
                <div className="skeleton-line" style={{ width: '80%', height: '24px' }}></div>
                <div className="skeleton-line" style={{ width: '30%' }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="store-page">
        <div className="store-container">
          <div className="error-card">
            <p className="error-card__text">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="store-btn store-btn--outline"
              style={{ marginTop: '16px' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="store-page">
        <div className="store-container">
          <div className="empty-state-large" style={{ padding: '100px 24px' }}>
            <PackageX size={64} className="empty-state-large__icon" />
            <h1 className="store-heading-1" style={{ marginBottom: '16px' }}>Category Not Found</h1>
            <p className="store-text-subtle" style={{ marginBottom: '32px' }}>
              The category you're looking for doesn't exist or is currently unavailable.
            </p>
            <Link 
              to="/collections" 
              className="store-btn store-btn--primary"
            >
              <ArrowLeft size={16} /> Back to All Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="store-container" style={{ padding: '40px 16px' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/collections" className="back-link">
            <ArrowLeft size={16} /> All Collections
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="store-heading-1" style={{ marginBottom: '16px' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="store-text-subtle" style={{ maxWidth: '800px' }}>
              {category.description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state-large">
            <PackageX size={48} className="empty-state-large__icon" />
            <h3 className="empty-state-large__title">No products found</h3>
            <p className="empty-state-large__text">
              There are currently no items in this category.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
