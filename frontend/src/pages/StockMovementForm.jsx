import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Save, X, ArrowLeft } from 'lucide-react';

export const StockMovementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    quantity_changed: '',
    movement_type: 'IN',
    reason: ''
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiFetch(`/products/${id}`);
        setProduct(data.data);
      } catch (err) {
        alert('Failed to fetch product data');
        navigate('/products');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setBackendError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.quantity_changed || isNaN(formData.quantity_changed) || Number(formData.quantity_changed) <= 0) {
      newErrors.quantity_changed = 'Valid positive quantity is required';
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setBackendError('');

    try {
      await apiFetch(`/products/${id}/stock-movement`, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          quantity_changed: Number(formData.quantity_changed)
        })
      });
      
      navigate('/products');
    } catch (err) {
      if (err?.status === 400 && err?.data?.message && !err?.data?.errors) {
        // Handle specific stock error (e.g. "Insufficient stock for this OUT movement")
        setBackendError(err.data.message);
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        const beErrors = {};
        err.data.errors.forEach(error => {
          beErrors[error.path] = error.msg;
        });
        setErrors(beErrors);
      } else {
        setBackendError(err?.data?.message || 'Failed to log movement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/products')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Products</span>
      </button>

      <div className="bg-white rounded-xl shadow p-8">
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Log Stock Movement</h2>
          <div className="mt-4 flex space-x-8 text-sm">
            <div>
              <p className="text-gray-500">Product</p>
              <p className="font-semibold text-gray-900">{product.name} ({product.sku})</p>
            </div>
            <div>
              <p className="text-gray-500">Current Stock</p>
              <p className="font-bold text-blue-600 text-lg">{product.current_stock}</p>
            </div>
          </div>
        </div>

        {backendError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
            {backendError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type *</label>
              <select 
                name="movement_type" value={formData.movement_type} onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                  formData.movement_type === 'IN' 
                    ? 'focus:ring-green-500 border-green-300 bg-green-50' 
                    : 'focus:ring-red-500 border-red-300 bg-red-50'
                }`}
              >
                <option value="IN">Stock IN (Add)</option>
                <option value="OUT">Stock OUT (Remove)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input 
                type="number" name="quantity_changed" min="1" value={formData.quantity_changed} onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.quantity_changed ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.quantity_changed && <p className="text-red-500 text-xs mt-1">{errors.quantity_changed}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Note *</label>
              <input 
                type="text" name="reason" value={formData.reason} onChange={handleChange}
                placeholder={formData.movement_type === 'IN' ? 'e.g. Received new shipment from supplier' : 'e.g. Damaged goods, expired, etc.'}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
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
              className={`flex items-center space-x-2 px-6 py-2 text-white rounded-lg transition disabled:opacity-70 ${
                formData.movement_type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Save size={18} />
              <span>{isLoading ? 'Processing...' : `Confirm ${formData.movement_type}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
