import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Save, X } from 'lucide-react';

export const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    business_name: '',
    customer_type: 'Retail',
    address: '',
    status: 'Lead',
    gst_number: '',
    notes: '',
    follow_up_date: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          const data = await apiFetch(`/customers/${id}`);
          const c = data.data.customer;
          setFormData({
            name: c.name || '',
            mobile: c.mobile || '',
            email: c.email || '',
            business_name: c.business_name || '',
            customer_type: c.customer_type || 'Retail',
            address: c.address || '',
            status: c.status || 'Lead',
            gst_number: c.gst_number || '',
            notes: c.notes || '',
            follow_up_date: c.follow_up_date ? c.follow_up_date.slice(0, 10) : ''
          });
        } catch (err) {
          alert('Failed to fetch customer data');
          navigate('/customers');
        }
      };
      fetchCustomer();
    }
  }, [id, navigate, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.business_name) newErrors.business_name = 'Business name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const endpoint = isEditMode ? `/customers/${id}` : '/customers';
      const method = isEditMode ? 'PUT' : 'POST';
      
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData)
      });
      
      navigate('/customers');
    } catch (err) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        // Map backend express-validator errors to fields
        const backendErrors = {};
        err.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        alert(err?.data?.message || 'Failed to save customer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <button onClick={() => navigate('/customers')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <input 
              type="text" name="business_name" value={formData.business_name} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
            <input 
              type="text" name="mobile" value={formData.mobile} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type *</label>
            <select 
              name="customer_type" value={formData.customer_type} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.customer_type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
            </select>
            {errors.customer_type && <p className="text-red-500 text-xs mt-1">{errors.customer_type}</p>}
          </div>

          {/* Status (Only on Edit or default Lead) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select 
              name="status" value={formData.status} onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div>
          
          {/* GST Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
            <input 
              type="text" name="gst_number" value={formData.gst_number} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.gst_number && <p className="text-red-500 text-xs mt-1">{errors.gst_number}</p>}
          </div>

          {/* Follow up date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Follow-up Date (Optional)</label>
            <input 
              type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.follow_up_date && <p className="text-red-500 text-xs mt-1">{errors.follow_up_date}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea 
            name="address" rows="3" value={formData.address} onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
          ></textarea>
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea 
            name="notes" rows="2" value={formData.notes} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
          {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/customers')}
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
            <span>{isLoading ? 'Saving...' : 'Save Customer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
