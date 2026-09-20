import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import Services from './pages/Services';
import Payments from './pages/Payments';
import Uncollected from './pages/Uncollected';
import Reports from './pages/Reports';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="payments" element={<Payments />} />
          <Route path="uncollected" element={<Uncollected />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}