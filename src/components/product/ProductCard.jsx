import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product }) {
  const { name, slug, price, availability, category, product_images } = product;

  // Find primary image or first available
  const primaryImage = product_images?.find(img => img.is_primary) || product_images?.[0];

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Link to={`/product/${slug}`} className="product-card">
      
      {/* Image Container */}
      <div className="product-card__image-wrap">
        {primaryImage ? (
          <img 
            src={primaryImage.image_url} 
            alt={name}
            className="product-card__image"
            loading="lazy"
          />
        ) : (
          <div className="product-card__placeholder">
            <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: '8px' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>No image</span>
          </div>
        )}
        
        {/* Badges */}
        {availability === 'out_of_stock' && (
          <span className="product-card__badge">
            Out of Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="product-card__content">
        <span className="product-card__category">
          {category?.name || 'Uncategorized'}
        </span>
        <h3 className="product-card__title">
          {name}
        </h3>
        
        <div className="product-card__footer">
          <span className="product-card__price">
            {formatPrice(price)}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--color-primary)' }}>&rarr;</span>
        </div>
      </div>
    </Link>
  );
}
