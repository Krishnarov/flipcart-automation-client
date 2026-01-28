import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Login from './pages/Login';
import OrderCancel from './pages/OrderCancel';
import ProductPurchase from './pages/ProductPurchase';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--glass)',
            color: 'var(--text)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border)',
          },
        }}
      />
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <PrivateRoute>
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/order-cancel" element={<OrderCancel />} />
                  <Route path="/product-purchase" element={<ProductPurchase />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/:jobId" element={<Reports />} />
                </Routes>
              </>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
