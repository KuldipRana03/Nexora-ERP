import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Save, X } from 'lucide-react';

export const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '0',
    min_stock_alert: '0',
    warehouse_location: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const data = await apiFetch(`/products/${id}`);
          const p = data.data;
          setFormData({
            name: p.name || '',
            sku: p.sku || '',
            category: p.category || '',
            unit_price: p.unit_price || '',
            current_stock: p.current_stock || '0',
            min_stock_alert: p.min_stock_alert || '0',
            warehouse_location: p.warehouse_location || ''
          });
        } catch (err) {
          alert('Failed to fetch product data');
          navigate('/products');
        }
      };
      fetchProduct();
    }
  }, [id, navigate, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit_price || isNaN(formData.unit_price) || Number(formData.unit_price) <= 0) {
      newErrors.unit_price = 'Valid unit price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const endpoint = isEditMode ? `/products/${id}` : '/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (isEditMode) {
        delete payload.current_stock; // Handled by stock movements on edit
      }
      
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload)
      });
      
      navigate('/products');
    } catch (err) {
      if (err?.status === 409) {
        setErrors({ sku: err.data.message });
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const backendErrors = {};
        err.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        alert(err?.data?.message || 'Failed to save product');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button onClick={() => navigate('/products')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input 
              type="text" name="sku" value={formData.sku} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.sku ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input 
              type="text" name="category" value={formData.category} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input 
                type="number" step="0.01" min="0.01" name="unit_price" value={formData.unit_price} onChange={handleChange}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.unit_price ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.unit_price && <p className="text-red-500 text-xs mt-1">{errors.unit_price}</p>}
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
              <input 
                type="number" name="current_stock" value={formData.current_stock} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Alert</label>
            <input 
              type="number" name="min_stock_alert" value={formData.min_stock_alert} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Location (Optional)</label>
            <input 
              type="text" name="warehouse_location" value={formData.warehouse_location} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mr-4 px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-70"
          >
            <Save size={18} />
            <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
