import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { catalogueService } from '../services/catalogueService';

export default function About() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await catalogueService.getShop();
        setShop(data);
        if (data?.name) {
          document.title = `About — ${data.name}`;
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  if (loading) return <div className="store-page"><div className="store-container">Loading...</div></div>;

  return (
    <div className="store-page">
      
      {/* Editorial Hero */}
      <section className="about-hero">
        <div className="store-container">
          <div className="about-hero__content">
            <h1 className="store-heading-1 about-hero__title">
              About {shop?.name || 'Us'}
            </h1>
            <p className="about-hero__tagline">
              {shop?.tagline || 'Premium footwear designed for comfort and style.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Split */}
      <section className="store-section">
        <div className="store-container">
          <div className="about-split">
            
            {/* Left: Visual */}
            <div className="about-split__visual">
              <div className="about-split__image-placeholder">
                <div className="about-split__overlay"></div>
                <span className="about-split__label">Premium Quality</span>
              </div>
            </div>

            {/* Right: Content */}
            <div className="about-split__content">
              <span className="about-eyebrow">OUR COMMITMENT</span>
              <h2 className="store-heading-2">Why Shop With Us</h2>
              
              <div className="about-description">
                <p>{shop?.description || 'We are dedicated to providing the best footwear selection for our community, balancing timeless style with modern comfort.'}</p>
              </div>

              <ul className="about-benefits-list">
                <li className="about-benefit">
                  <CheckCircle2 className="about-benefit__icon" size={24} />
                  <div>
                    <strong className="about-benefit__title">Curated Footwear</strong>
                    <p className="about-benefit__text">Carefully selected premium styles for everyday wear.</p>
                  </div>
                </li>
                <li className="about-benefit">
                  <CheckCircle2 className="about-benefit__icon" size={24} />
                  <div>
                    <strong className="about-benefit__title">Easy Catalogue Browsing</strong>
                    <p className="about-benefit__text">Explore our full inventory online before you visit.</p>
                  </div>
                </li>
                <li className="about-benefit">
                  <CheckCircle2 className="about-benefit__icon" size={24} />
                  <div>
                    <strong className="about-benefit__title">In-Store Assistance</strong>
                    <p className="about-benefit__text">Friendly, knowledgeable help when you need it.</p>
                  </div>
                </li>
              </ul>

              <div className="about-actions">
                <Link to="/collections" className="store-btn store-btn--primary">
                  Explore Collections <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
