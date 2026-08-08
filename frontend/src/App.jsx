import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomersList } from './pages/CustomersList';
import { CustomerForm } from './pages/CustomerForm';
import { CustomerDetail } from './pages/CustomerDetail';
import { ProductsList } from './pages/ProductsList';
import { ProductForm } from './pages/ProductForm';
import { StockMovementForm } from './pages/StockMovementForm';

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
            
            {/* Products Module */}
            <Route path="products" element={<ProductsList />} />
            <Route 
              path="products/new" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Warehouse']}>
                  <ProductForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="products/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Warehouse']}>
                  <ProductForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="products/:id/stock" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Warehouse']}>
                  <StockMovementForm />
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
