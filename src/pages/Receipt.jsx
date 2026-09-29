import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { orderService } from '../services/orderService';

export default function Receipt() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderByOrderId(orderId);
        if (!data) throw new Error('Order not found');
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError('Order receipt not found.');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="store-page store-container" style={{ textAlign: 'center', padding: '64px 0' }}>
        <div>Loading receipt...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="store-page store-container" style={{ textAlign: 'center', padding: '64px 0' }}>
        <h2 className="store-heading-2">{error || 'Receipt not found'}</h2>
        <Link to="/" className="store-btn store-btn--primary" style={{ marginTop: '24px' }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const formattedDate = new Date(order.created_at).toLocaleString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="store-page" style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: '#25D366', color: '#fff', padding: '30px 20px', textAlign: 'center' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 12px' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Order Received</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Thank you for your order!</p>
        </div>

        <div style={{ padding: '30px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Order ID</div>
              <div style={{ fontWeight: 600, color: '#111827' }}>{order.order_id}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Date</div>
              <div style={{ fontWeight: 500, color: '#111827' }}>{formattedDate}</div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Customer Details</h3>
            <div style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.5 }}>
              <div><strong>Name:</strong> {order.customer_name}</div>
              <div><strong>Phone:</strong> {order.customer_phone}</div>
              <div><strong>Address:</strong> {order.customer_address}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Order Summary</h3>
            
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.95rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Size: {item.size} &times; {item.quantity}
                    {item.sku && ` | SKU: ${item.sku}`}
                  </div>
                </div>
                <div style={{ fontWeight: 500 }}>
                  {formatPrice(item.total)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #eee', marginTop: '20px', paddingTop: '20px', fontSize: '1.1rem', fontWeight: 600 }}>
            <div>Total</div>
            <div style={{ color: '#25D366' }}>{formatPrice(order.total)}</div>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center', borderTop: '1px solid #eee' }}>
          <Link to="/" className="store-btn store-btn--primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={18} style={{ marginRight: '8px' }} /> Return to Store
          </Link>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '16px' }}>
            We've received your WhatsApp message and will process your order shortly.
          </div>
        </div>

      </div>
    </div>
  );
}
