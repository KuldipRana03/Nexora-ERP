import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <div className="text-center p-8 bg-white shadow rounded-lg max-w-md w-full border-t-4 border-red-500">
      <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
      <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Return to Dashboard
      </a>
    </div>
  </div>
);

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return children;
};
