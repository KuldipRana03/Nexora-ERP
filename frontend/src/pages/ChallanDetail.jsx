import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export const ChallanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState({ challan: null, items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const canManageStatus = ['Admin', 'Sales'].includes(user?.role);

  const fetchChallan = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/challans/${id}`);
      setData(res.data);
    } catch (err) {
      alert('Failed to load challan details');
      navigate('/challans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id, navigate]);

  const handleUpdateStatus = async (status) => {
    if (!window.confirm(`Are you sure you want to mark this challan as ${status}?`)) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      await apiFetch(`/challans/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchChallan(); // Refresh data
    } catch (err) {
      if (err?.status === 400 || err?.status === 409) {
        setError(err.data.message || `Failed to update to ${status}. Insufficient stock?`);
      } else {
        setError('An unexpected error occurred while updating status.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading challan details...</div>;
  if (!data.challan) return null;

  const { challan, items } = data;
  const isDraft = challan.status === 'Draft';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/challans')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Challans</span>
      </button>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm shadow-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{challan.challan_number}</h1>
            <p className="text-gray-500 mb-4">Date: {new Date(challan.created_at).toLocaleString()}</p>
            <div className="flex space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                challan.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                challan.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {challan.status}
              </span>
            </div>
          </div>
          
          {canManageStatus && isDraft && (
            <div className="flex space-x-3">
              <button 
                onClick={() => handleUpdateStatus('Confirmed')}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-70"
              >
                <CheckCircle size={18} />
                <span>Confirm Challan</span>
              </button>
              <button 
                onClick={() => handleUpdateStatus('Cancelled')}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-70"
              >
                <XCircle size={18} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer Details</h3>
            <p className="text-xl font-medium text-gray-900">{challan.customer_name}</p>
          </div>

          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Line Items</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => {
                  const lineTotal = Number(item.unit_price_snapshot) * Number(item.quantity);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.product_name_snapshot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.product_sku_snapshot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${Number(item.unit_price_snapshot).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-500 uppercase tracking-wider">Total Amount:</td>
                  <td colSpan="2" className="px-6 py-4 text-right text-xl font-bold text-gray-900">
                    ${items.reduce((sum, item) => sum + (Number(item.unit_price_snapshot) * Number(item.quantity)), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
