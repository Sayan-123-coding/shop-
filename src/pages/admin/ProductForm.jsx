import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../components/ui/Toast';
import { Save, X, Upload, XCircle } from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { shopId } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    brand: '',
    price: '',
    category_id: '',
    availability: 'available',
    is_published: false,
    description: '',
  });

  // Image management
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (!shopId) return;
      try {
        const cats = await categoryService.getCategories(shopId);
        setCategories(cats);

        if (isEdit) {
          const product = await productService.getProductById(id, shopId);
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            sku: product.sku || '',
            brand: product.brand || '',
            price: product.price || '',
            category_id: product.category_id || '',
            availability: product.availability || 'available',
            is_published: product.is_published || false,
            description: product.description || '',
          });
          setExistingImages(product.product_images || []);
        }
      } catch (err) {
        showToast("Failed to load data.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, shopId, isEdit, showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-generate slug from name if in create mode and slug is empty or matches previous auto-gen
    if (name === 'name' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);
    }
    // Reset input so same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewFile = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId, storagePath) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await productService.deleteProductImage(imageId, storagePath);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      showToast("Image removed.");
    } catch (err) {
      showToast("Failed to remove image.", "error");
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.price) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSaving(true);
    try {
      let productId = id;
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null
      };

      if (isEdit) {
        await productService.updateProduct(id, shopId, payload);
      } else {
        const newProduct = await productService.createProduct(payload, shopId);
        productId = newProduct.id;
      }

      // Handle Image Uploads
      if (newImageFiles.length > 0) {
        const { successCount, failedFiles } = await productService.uploadProductImages(
          shopId, 
          productId, 
          newImageFiles
        );

        if (failedFiles.length > 0) {
          showToast(`Product saved, but ${failedFiles.length} images failed to upload.`, "warning");
          // Redirect to edit mode so they can try again
          if (!isEdit) navigate(`/admin/products/${productId}/edit`);
          else window.location.reload(); // Quick way to refresh state
          return;
        }
      }

      showToast(`Product ${isEdit ? 'updated' : 'created'} successfully.`);
      navigate('/admin/products');

    } catch (err) {
      showToast(err.message || "Failed to save product.", "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
        <button 
          type="button" 
          onClick={() => navigate('/admin/products')}
          className="text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                name="name" 
                className="form-input" 
                required 
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL Slug *</label>
              <input 
                type="text" 
                name="slug" 
                className="form-input" 
                required 
                value={formData.slug} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (INR) *</label>
              <input 
                type="number" 
                name="price" 
                step="0.01" 
                min="0"
                className="form-input" 
                required 
                value={formData.price} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category_id" 
                className="form-input" 
                value={formData.category_id} 
                onChange={handleChange}
              >
                <option value="">No Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input 
                type="text" 
                name="sku" 
                className="form-input" 
                value={formData.sku} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input 
                type="text" 
                name="brand" 
                className="form-input" 
                value={formData.brand} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              className="form-input" 
              rows="4"
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Status & Visibility</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select 
                name="availability" 
                className="form-input" 
                value={formData.availability} 
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            
            <div className="form-group flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="font-medium">Publish to store</span>
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold">Product Images</h2>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline text-sm"
            >
              <Upload size={16} className="mr-2" /> Select Images
            </button>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect} 
            />
          </div>

          {(existingImages.length > 0 || newImageFiles.length > 0) ? (
            <div className="image-upload-grid">
              {/* Existing Images */}
              {existingImages.map(img => (
                <div key={img.id} className="image-preview-card group">
                  <img src={img.image_url} alt="Product" />
                  <button 
                    type="button" 
                    onClick={() => removeExistingImage(img.id, img.storage_path)}
                    className="image-remove-btn"
                    title="Remove image"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
              
              {/* New Files to Upload */}
              {newImageFiles.map((file, idx) => (
                <div key={idx} className="image-preview-card group ring-2 ring-primary ring-offset-1">
                  <img src={URL.createObjectURL(file)} alt="Preview" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center py-1 px-2 truncate">
                    {file.name} (New)
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeNewFile(idx)}
                    className="image-remove-btn"
                    title="Cancel upload"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">
              No images uploaded yet.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-2">
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')}
            className="btn btn-outline"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (
              <>
                <Save size={18} className="mr-2" />
                {isEdit ? 'Save Changes' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
