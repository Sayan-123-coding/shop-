import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { catalogueService } from '../services/catalogueService';
import { businessConfig } from '../config/businessConfig';
import { MapPin, Clock, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const location = useLocation();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await catalogueService.getShop();
        setShop(data);
        if (data?.name) {
          document.title = `Contact — ${data.name}`;
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();

    if (location.state?.productContext) {
      setFormData(prev => ({
        ...prev,
        message: `I'm interested in: ${location.state.productContext}\n\n`
      }));
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      // Keep success state visible for demo
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="store-page"><div className="store-container">Loading...</div></div>;

  return (
    <div className="store-page">
      
      {/* Contact Hero */}
      <section className="contact-hero">
        <div className="store-container text-center">
          <h1 className="store-heading-1">Visit {shop?.name || 'Us'}</h1>
          <p className="store-text-subtle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            We'd love to hear from you. Drop us a message or visit our store.
          </p>
        </div>
      </section>

      <section className="store-section pt-0">
        <div className="store-container">
          <div className="contact-layout">
            
            {/* Left: Store Info */}
            <div className="contact-info-card">
              <h2 className="store-heading-2 contact-info__title">Store Information</h2>
              
              <div className="contact-info__list">
                <div className="contact-info__item">
                  <MapPin className="contact-info__icon" size={24} />
                  <div>
                    <strong className="contact-info__label">Address (Demo)</strong>
                    <p className="contact-info__text">
                      {businessConfig.demoLocation.addressLine1}<br/>
                      {businessConfig.demoLocation.addressLine2}
                    </p>
                    <a href={businessConfig.demoLocation.mapsLink} target="_blank" rel="noreferrer" className="store-link-primary text-sm mt-2 block">
                      Get Directions &rarr;
                    </a>
                  </div>
                </div>

                <div className="contact-info__item">
                  <Clock className="contact-info__icon" size={24} />
                  <div>
                    <strong className="contact-info__label">Opening Hours (Demo)</strong>
                    <p className="contact-info__text">Mon-Sat: 10:00 AM - 8:00 PM</p>
                    <p className="contact-info__text">Sun: Closed</p>
                  </div>
                </div>

                {shop?.phone && (
                  <div className="contact-info__item">
                    <Phone className="contact-info__icon" size={24} />
                    <div>
                      <strong className="contact-info__label">Phone</strong>
                      <p className="contact-info__text">{shop.phone}</p>
                    </div>
                  </div>
                )}
                
                {shop?.email && (
                  <div className="contact-info__item">
                    <Mail className="contact-info__icon" size={24} />
                    <div>
                      <strong className="contact-info__label">Email</strong>
                      <p className="contact-info__text">{shop.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Form */}
            <div className="contact-form-wrap">
              {submitted ? (
                <div className="contact-success">
                  <CheckCircle2 size={48} className="contact-success__icon" />
                  <h3 className="contact-success__title">Thanks! Your enquiry has been noted for this demo.</h3>
                  <p className="contact-success__text">No actual email was sent as this is a demonstration environment.</p>
                  <button onClick={() => setSubmitted(false)} className="store-btn store-btn--outline mt-6">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h2 className="store-heading-2 contact-form__title">Send an Inquiry</h2>
                  
                  <div className="form-group-modern">
                    <label htmlFor="name" className="form-label-modern">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input-modern"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="email" className="form-label-modern">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input-modern"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="form-group-modern">
                    <label htmlFor="message" className="form-label-modern">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input-modern form-textarea-modern"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>

                  <button type="submit" className="store-btn store-btn--primary store-btn--full mt-4">
                    Send Message
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
