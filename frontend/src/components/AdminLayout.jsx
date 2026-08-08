import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users, Package, FileText, PlusCircle, Activity } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700';

  const canCreateCustomers = ['Admin', 'Sales'].includes(user?.role);
  const canCreateProducts = ['Admin', 'Warehouse'].includes(user?.role);
  const canCreateChallans = ['Admin', 'Sales'].includes(user?.role);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl">
        <div className="p-4 border-b border-blue-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-xl">
            N
          </div>
          <h1 className="text-xl font-bold tracking-wider">Nexora ERP</h1>
        </div>
        
        <div className="p-4 bg-blue-950 text-sm">
          <p className="text-blue-200">Logged in as:</p>
          <p className="font-semibold">{user?.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-800 rounded text-xs text-blue-200 border border-blue-700">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          <Link to="/" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/')}`}>
            <Home size={18} /> <span>Dashboard</span>
          </Link>
          
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider">Customers</p>
          </div>
          <Link to="/customers" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/customers')}`}>
            <Users size={18} /> <span>View Customers</span>
          </Link>
          {canCreateCustomers && (
            <Link to="/customers/new" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/customers/new')}`}>
              <PlusCircle size={18} /> <span>Add Customer</span>
            </Link>
          )}

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider">Inventory</p>
          </div>
          <Link to="/products" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/products')}`}>
            <Package size={18} /> <span>View Products</span>
          </Link>
          {canCreateProducts && (
            <Link to="/products/new" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/products/new')}`}>
              <PlusCircle size={18} /> <span>Add Product</span>
            </Link>
          )}

          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider">Sales</p>
          </div>
          <Link to="/challans" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/challans')}`}>
            <FileText size={18} /> <span>View Challans</span>
          </Link>
          {canCreateChallans && (
            <Link to="/challans/new" className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${isActive('/challans/new')}`}>
              <PlusCircle size={18} /> <span>Create Challan</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition"
          >
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
