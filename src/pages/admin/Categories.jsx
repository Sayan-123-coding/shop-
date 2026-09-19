import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit, Trash2, X, Save, Tags } from 'lucide-react';

export default function Categories() {
  const { shopId } = useAuth();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    is_visible: true,
    display_order: 0
  });

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  async function loadCategories() {
    if (!shopId) return;
    try {
      setLoading(true);
      const data = await categoryService.getCategories(shopId);
      setCategories(data);
    } catch (err) {
      showToast("Failed to load categories.", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddNew = () => {
    setFormData({ name: '', slug: '', parent_id: '', is_visible: true, display_order: 0 });
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || '',
      is_visible: category.is_visible,
      display_order: category.display_order
    });
    setEditId(category.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name' && !editId) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      showToast("Name and Slug are required.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id || null,
        display_order: parseInt(formData.display_order) || 0
      };

      if (editId) {
        await categoryService.updateCategory(editId, shopId, payload);
        showToast("Category updated.");
      } else {
        await categoryService.createCategory(payload, shopId);
        showToast("Category created.");
      }
      
      setShowForm(false);
      loadCategories();
    } catch (err) {
      showToast(err.message || "Failed to save category.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    setIsDeleting(id);
    try {
      await categoryService.deleteCategory(id, shopId);
      showToast("Category deleted.");
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      showToast(err.message || "Failed to delete category.", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return <div className="p-6">Loading categories...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">Categories</h1>
        {!showForm && (
          <button onClick={handleAddNew} className="btn btn-primary">
            <Plus size={18} className="mr-2" /> Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="card border-primary">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold">{editId ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input type="text" name="slug" className="form-input" required value={formData.slug} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select name="parent_id" className="form-input" value={formData.parent_id} onChange={handleChange}>
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c.id !== editId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Display Order</label>
                <input type="number" name="display_order" className="form-input" value={formData.display_order} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group flex items-center mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_visible" checked={formData.is_visible} onChange={handleChange} className="w-5 h-5 text-primary" />
                <span className="font-medium">Visible to customers</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCancel} className="btn btn-outline" disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        {categories.length === 0 ? (
          <div className="empty-state">
            <Tags size={32} />
            <h2>No categories yet</h2>
            <p>Click "Add Category" to get started creating your store's taxonomy.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Visibility</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td className="font-medium">{category.name}</td>
                  <td className="text-gray-500 text-sm">{category.slug}</td>
                  <td>{category.parent ? category.parent.name : '-'}</td>
                  <td>
                    <span className={`badge ${category.is_visible ? 'badge-success' : 'badge-neutral'}`}>
                      {category.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-500 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={isDeleting === category.id}
                        className="p-2 text-gray-500 hover:text-error transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
