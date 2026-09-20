import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Grid, LayoutGrid, Gem, Truck, Heart, MapPin } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';
import ProductCard from '../components/product/ProductCard';
import { businessConfig } from '../config/businessConfig';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, shopData] = await Promise.all([
          catalogueService.getPublishedProducts(),
          catalogueService.getVisibleCategories(),
          catalogueService.getShop()
        ]);
        
        setFeaturedProducts(productsData.slice(0, 4));
        setCategories(categoriesData);
        setShop(shopData);

        if (shopData?.name) {
          document.title = `${shopData.name} — Premium Footwear`;
        } else {
          document.title = "Home — Premium Footwear";
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Video playlist for the background
  const heroVideos = [
    '/videos/shoe-drop.mp4',
    '/videos/sandal-carpet.mp4',
    '/videos/clogs-angles.mp4'
  ];
  const [currentVideo, setCurrentVideo] = useState(0);

  return (
    <div className="home-page">
      
      {/* 2. Hero Section */}
      <section className="store-hero">
        {/* Fallback image if videos haven't loaded or don't exist yet */}
        <div className="store-hero__bg-image" style={{ backgroundImage: "url('/images/hero-shoes.jpg')" }}></div>
        
        {/* Looping Background Videos */}
        <video
          key={heroVideos[currentVideo]}
          src={heroVideos[currentVideo]}
          autoPlay
          muted
          playsInline
          onEnded={() => setCurrentVideo((prev) => (prev + 1) % heroVideos.length)}
          className="store-hero__bg-video"
        />

        <div className="store-hero__overlay"></div>
        <div className="store-container store-hero__content-wrap">
          <div className="store-hero__content">
            <span className="store-hero__eyebrow">STEP INTO STYLE</span>
            <h1 className="store-hero__title">Step Into Something Better</h1>
            <p className="store-hero__text">
              Discover footwear designed for everyday comfort, style, and confidence.
            </p>
            <div className="store-hero__actions">
              <Link to="/collections" className="store-btn store-btn--primary store-btn--large">
                Explore Collections <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop By Category */}
      <section className="store-section">
        <div className="store-container">
          <div className="store-section__header">
            <div>
              <h2 className="store-heading-2" style={{ marginBottom: '8px' }}>Shop By Category</h2>
              <p className="store-text-subtle">Find the right pair for every style and occasion.</p>
            </div>
          </div>
          
          {!loading && categories.length > 0 ? (
            <div className="category-scroll">
              {categories.map((cat) => {
                let Icon = Tag;
                if (cat.name.toLowerCase().includes('sneaker')) Icon = LayoutGrid;
                if (cat.name.toLowerCase().includes('formal')) Icon = Gem;

                return (
                  <Link key={cat.id} to={`/collections/${cat.slug}`} className="category-card">
                    <Icon size={32} className="category-card__icon" />
                    <span className="category-card__name">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          ) : !loading ? (
            <div className="empty-state-card">
              <p>More categories coming soon.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* 4. Featured Collection */}
      <section className="store-section store-section--bg">
        <div className="store-container">
          <div className="store-section__header">
            <div>
              <h2 className="store-heading-2" style={{ marginBottom: '8px' }}>Featured Collection</h2>
              <p className="store-text-subtle">Explore some of our latest styles.</p>
            </div>
            <Link to="/collections" className="store-link-primary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          {!loading && featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !loading ? (
            <div className="empty-state-card">
              <p>New arrivals are on their way.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* 5. Trust / Store Benefits */}
      <section className="store-section" style={{ paddingBottom: '0' }}>
        <div className="store-container">
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-item__icon"><Gem size={28} /></div>
              <h3 className="benefit-item__title">Quality Footwear</h3>
              <p className="benefit-item__text">Carefully selected styles for everyday wear.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-item__icon"><Truck size={28} /></div>
              <h3 className="benefit-item__title">Easy Availability</h3>
              <p className="benefit-item__text">Browse the catalogue before visiting the store.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-item__icon"><Heart size={28} /></div>
              <h3 className="benefit-item__title">Trusted Service</h3>
              <p className="benefit-item__text">Friendly in-store assistance when you visit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Visit Our Store / Location */}
      <section className="store-section">
        <div className="store-container">
          <div className="location-card">
            <div className="location-grid">
              
              <div className="location-content">
                <span className="location-content__badge">VISIT OUR STORE</span>
                <h2 className="location-content__title">{shop?.name || 'Shoe Store'}</h2>
                {shop?.tagline && (
                  <p className="location-content__tagline">
                    {shop.tagline}
                  </p>
                )}
                
                <div className="location-address">
                  <MapPin size={24} color="var(--color-primary)" className="location-address__icon" />
                  <div>
                    <p className="location-address__line">{businessConfig.demoLocation.addressLine1}</p>
                    <p className="location-address__line">{businessConfig.demoLocation.addressLine2}</p>
                    <p className="location-address__note">(Demo Address)</p>
                  </div>
                </div>

                <a 
                  href={businessConfig.demoLocation.mapsLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="store-btn store-btn--outline" 
                  style={{ alignSelf: 'flex-start' }}
                >
                  Get Directions &rarr;
                </a>
              </div>

              <div className="location-map">
                <iframe 
                  src={businessConfig.demoLocation.mapEmbedUrl}
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location Map"
                ></iframe>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
