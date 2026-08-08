import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}!</h3>
        <p className="text-gray-600">
          You are logged in as <span className="font-semibold text-blue-600">{user?.role}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Customers</p>
            <p className="text-2xl font-bold text-gray-800">Module Active</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Inventory</p>
            <p className="text-2xl font-bold text-gray-800">Module Active</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sales Challans</p>
            <p className="text-2xl font-bold text-gray-800">Module Active</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">System Status</p>
            <p className="text-2xl font-bold text-gray-800">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};
