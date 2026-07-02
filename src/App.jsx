import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InflowPage from './pages/InflowPage';
import OutflowPage from './pages/OutflowPage';
import TailoringDashboard from './pages/TailoringDashboard';
import TailoringOrderForm from './pages/TailoringOrderForm';
import TailorExpenseForm from './pages/TailorExpenseForm';
import TailoringOrderDetails from './pages/TailoringOrderDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inflow" element={<InflowPage />} />
        <Route path="/outflow" element={<OutflowPage />} />
        
        {/* Tailoring Routes */}
        <Route path="/tailoring" element={<TailoringDashboard />} />
        <Route path="/tailoring/new" element={<TailoringOrderForm />} />
        <Route path="/tailoring/expense" element={<TailorExpenseForm />} />
        <Route path="/tailoring/order/:id" element={<TailoringOrderDetails />} />
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
