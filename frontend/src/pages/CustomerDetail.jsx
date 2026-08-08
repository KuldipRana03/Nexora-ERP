import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit, MessageCircle, Calendar } from 'lucide-react';

export const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState({ customer: null, followups: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const canEdit = ['Admin', 'Sales'].includes(user?.role);

  const fetchCustomer = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/customers/${id}`);
      setData(res.data);
    } catch (err) {
      alert('Failed to load customer details');
      navigate('/customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id, navigate]);

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!note) return alert('Note is required');
    
    setIsAddingNote(true);
    try {
      await apiFetch(`/customers/${id}/followups`, {
        method: 'POST',
        body: JSON.stringify({ note, follow_up_date: followUpDate || null })
      });
      setNote('');
      setFollowUpDate('');
      fetchCustomer(); // Refresh data
    } catch (err) {
      alert(err?.data?.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading customer details...</div>;
  if (!data.customer) return null;

  const { customer, followups } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/customers')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Customers</span>
      </button>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{customer.business_name}</p>
            <div className="flex space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : customer.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {customer.status}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {customer.customer_type}
              </span>
            </div>
          </div>
          
          {canEdit && (
            <button 
              onClick={() => navigate(`/customers/${id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              <Edit size={18} />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact Info</h3>
              <p className="text-gray-900 font-medium">{customer.mobile}</p>
              <p className="text-gray-600">{customer.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Address</h3>
              <p className="text-gray-900">{customer.address}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Tax Info</h3>
              <p className="text-gray-900">{customer.gst_number || 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-gray-700 bg-white p-4 rounded-lg border border-gray-100 shadow-sm min-h-[100px]">
              {customer.notes || 'No general notes available.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <MessageCircle size={24} className="text-blue-500" />
            <span>Follow-up History</span>
          </h2>
        </div>
        
        <div className="p-6">
          {canEdit && (
            <form onSubmit={handleAddFollowup} className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-4">Add New Follow-up</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <input 
                    type="text" 
                    placeholder="Enter follow-up note..." 
                    required
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <input 
                    type="date" 
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isAddingNote}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
                >
                  {isAddingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {followups.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No follow-ups recorded yet.</p>
            ) : (
              followups.map(f => (
                <div key={f.id} className="flex space-x-4 border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">{f.note}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="font-semibold">By: {f.created_by_name}</span>
                      <span>Recorded: {new Date(f.created_at).toLocaleString()}</span>
                      {f.follow_up_date && (
                        <span className="flex items-center text-blue-600 font-medium">
                          <Calendar size={12} className="mr-1" />
                          Next Follow-up: {new Date(f.follow_up_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
