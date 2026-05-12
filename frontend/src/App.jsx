import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import ServiceCreate from './pages/ServiceCreate';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ServiceEdit from './pages/ServiceEdit';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute><Layout><Services /></Layout></ProtectedRoute>
      } />
      <Route path="/services/create" element={
        <ProtectedRoute><Layout><ServiceCreate /></Layout></ProtectedRoute>
      } />
      <Route path="/services/:id" element={
        <ProtectedRoute><Layout><ServiceDetail /></Layout></ProtectedRoute>
      } />
      <Route path="/services/:id/edit" element={
        <ProtectedRoute><Layout><ServiceEdit /></Layout></ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute><Layout><Bookings /></Layout></ProtectedRoute>
      } />
      <Route path="/bookings/:id" element={
        <ProtectedRoute><Layout><BookingDetail /></Layout></ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><Layout><Admin /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
