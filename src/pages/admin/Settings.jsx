import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { shopService } from '../../services/shopService';
import { useToast } from '../../components/ui/Toast';
import { Save } from 'lucide-react';

export default function Settings() {
  const { shopId } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    tagline: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    async function loadShop() {
      if (!shopId) return;
      try {
        setLoading(true);
        const shop = await shopService.getShopById(shopId);
        setFormData({
          name: shop.name || '',
          business_type: shop.business_type || '',
          tagline: shop.tagline || '',
          description: shop.description || '',
          phone: shop.phone || '',
          whatsapp: shop.whatsapp || '',
          email: shop.email || '',
          address: shop.address || ''
        });
      } catch (err) {
        showToast("Failed to load shop settings.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [shopId, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("Shop Name is required.", "error");
      return;
    }

    setSaving(true);
    try {
      await shopService.updateShop(shopId, formData);
      showToast("Settings updated successfully.");
    } catch (err) {
      showToast("Failed to update settings.", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold font-heading">Store Settings</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h2>
          
          <div className="form-group">
            <label className="form-label">Store Name *</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              required 
              value={formData.name} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Business Type</label>
              <input 
                type="text" 
                name="business_type" 
                className="form-input" 
                placeholder="e.g. Footwear Retail"
                value={formData.business_type} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input 
                type="text" 
                name="tagline" 
                className="form-input" 
                placeholder="e.g. Premium Shoes for Everyone"
                value={formData.tagline} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-input" 
              rows="3"
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Contact Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                className="form-input" 
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input 
                type="text" 
                name="whatsapp" 
                className="form-input" 
                value={formData.whatsapp} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <textarea 
              name="address" 
              className="form-input" 
              rows="2"
              value={formData.address} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        
      </form>
    </div>
  );
}
