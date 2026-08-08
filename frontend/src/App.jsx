import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomersList } from './pages/CustomersList';
import { CustomerForm } from './pages/CustomerForm';
import { CustomerDetail } from './pages/CustomerDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Customers Module */}
            <Route path="customers" element={<CustomersList />} />
            <Route 
              path="customers/new" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                  <CustomerForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="customers/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                  <CustomerForm />
                </ProtectedRoute>
              } 
            />
            <Route path="customers/:id" element={<CustomerDetail />} />
            
            <Route path="products" element={<div className="p-4">Products List (All Roles)</div>} />
            <Route 
              path="products/new" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Warehouse']}>
                  <div className="p-4">Add Product Form (Admin, Warehouse)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="products/stock-movement" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Warehouse']}>
                  <div className="p-4">Stock Movement (Admin, Warehouse)</div>
                </ProtectedRoute>
              } 
            />
            
            <Route path="challans" element={<div className="p-4">Challans List (All Roles)</div>} />
            <Route 
              path="challans/new" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                  <div className="p-4">Create Challan Form (Admin, Sales)</div>
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
