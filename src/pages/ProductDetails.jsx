import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [productData, shopData] = await Promise.all([
          catalogueService.getPublishedProductBySlug(slug),
          catalogueService.getShop()
        ]);
        
        if (!productData) {
          setError('Product not found.');
          return;
        }
        
        setProduct(productData);
        setShop(shopData);
        
        const primaryImage = productData.product_images?.find(img => img.is_primary) || productData.product_images?.[0];
        if (primaryImage) {
          setSelectedImage(primaryImage.image_url);
        }

        if (shopData?.name) {
          document.title = `${productData.name} — ${shopData.name}`;
        } else {
          document.title = `${productData.name} — Premium Footwear`;
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Something went wrong while loading the product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="store-page store-container">
        <div className="skeleton-line" style={{ width: '200px', marginBottom: '32px' }}></div>
        <div className="product-details-layout">
          <div className="skeleton-image" style={{ paddingTop: '100%' }}></div>
          <div>
            <div className="skeleton-line" style={{ width: '100px', marginBottom: '16px' }}></div>
            <div className="skeleton-line" style={{ width: '80%', height: '40px', marginBottom: '16px' }}></div>
            <div className="skeleton-line" style={{ width: '30%', height: '30px', marginBottom: '32px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '100px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="store-page store-container" style={{ textAlign: 'center', padding: '64px 0' }}>
        <h2 className="store-heading-2">{error || 'Product not found'}</h2>
        <Link to="/collections" className="store-btn store-btn--primary" style={{ marginTop: '24px' }}>
          <ArrowLeft size={20} /> Back to Collections
        </Link>
      </div>
    );
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const handleContact = () => {
    navigate('/contact', { state: { productContext: product.name } });
  };

  return (
    <div className="store-page">
      <div className="store-container">
        
        <div className="product-details-nav">
          <Link to="/collections" className="back-link">
            <ArrowLeft size={16} /> Back to Collection
          </Link>
        </div>

        <div className="product-details-layout">
          
          {/* LEFT: Image Gallery */}
          <div className="product-gallery">
            <div className="product-gallery__main">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="product-gallery__main-img" />
              ) : (
                <div className="product-gallery__placeholder">
                  <ImageIcon size={64} style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <span>No image available</span>
                </div>
              )}
            </div>
            
            {product.product_images && product.product_images.length > 1 && (
              <div className="product-gallery__thumbnails">
                {product.product_images.map((img, index) => (
                  <button
                    key={index}
                    className={`product-gallery__thumb-btn ${selectedImage === img.image_url ? 'product-gallery__thumb-btn--active' : ''}`}
                    onClick={() => setSelectedImage(img.image_url)}
                  >
                    <img src={img.image_url} alt={`${product.name} thumbnail ${index + 1}`} className="product-gallery__thumb-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="product-info">
            {product.brand && (
              <span className="product-info__brand">{product.brand}</span>
            )}
            
            <h1 className="product-info__title">{product.name}</h1>
            
            <div className="product-info__price-row">
              <span className="product-info__price">{formatPrice(product.price)}</span>
              <span className={`product-badge product-badge--${product.availability === 'available' ? 'success' : 'warning'}`}>
                {product.availability === 'available' ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="product-info__meta">
              {product.category?.name && (
                <div className="product-info__meta-item">
                  <span className="product-info__meta-label">Category</span>
                  <span className="product-info__meta-value">{product.category.name}</span>
                </div>
              )}
              {product.sku && (
                <div className="product-info__meta-item">
                  <span className="product-info__meta-label">SKU</span>
                  <span className="product-info__meta-value">{product.sku}</span>
                </div>
              )}
            </div>

            <div className="product-info__description">
              <p>{product.description || 'No description available for this product.'}</p>
            </div>

            <div className="product-info__actions">
              <button onClick={handleContact} className="store-btn store-btn--primary store-btn--full">
                Contact Store
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
