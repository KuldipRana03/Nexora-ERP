import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Save, X, Plus, Trash2 } from 'lucide-react';

export const ChallanForm = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ALL customers and products for dropdowns (in a real app with large data, use async select)
        const [custRes, prodRes] = await Promise.all([
          apiFetch('/customers?limit=1000'),
          apiFetch('/products?limit=1000')
        ]);
        setCustomers(custRes.data.customers);
        setProducts(prodRes.data.products);
      } catch (err) {
        alert('Failed to load initial data');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      return setError('Please select a customer');
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].product_id) return setError(`Please select a product for item ${i + 1}`);
      if (!items[i].quantity || isNaN(items[i].quantity) || Number(items[i].quantity) <= 0) {
        return setError(`Please enter a valid quantity for item ${i + 1}`);
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: Number(selectedCustomerId),
        items: items.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      };

      await apiFetch('/challans', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      navigate('/challans');
    } catch (err) {
      setError(err?.data?.message || 'Failed to create challan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <div className="p-8 text-center text-gray-500">Loading form data...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Create New Challan (Draft)</h2>
        <button onClick={() => navigate('/challans')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer *</label>
          <select 
            value={selectedCustomerId} 
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Choose a Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.business_name})</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Products *</label>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} /> <span>Add Another Item</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <select 
                    value={item.product_id} 
                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) - Stock: {p.current_stock}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/challans')}
            className="mr-4 px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-70"
          >
            <Save size={18} />
            <span>{isSubmitting ? 'Saving Draft...' : 'Save Draft Challan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
