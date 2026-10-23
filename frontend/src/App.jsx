import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const ServiceCreate = lazy(() => import('./pages/ServiceCreate'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const Payments = lazy(() => import('./pages/Payments'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));
const ServiceEdit = lazy(() => import('./pages/ServiceEdit'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Demande = lazy(() => import('./pages/Demande'));

const pageFallback = (
  <div className="min-h-[40vh] flex items-center justify-center text-muted text-sm">
    Chargement…
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={pageFallback}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/suivi/:token" element={<Tracking />} />
        <Route path="/demande" element={<Demande />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute providerOnly><Layout><Services /></Layout></ProtectedRoute>
        } />
        <Route path="/services/create" element={
          <ProtectedRoute providerOnly><Layout><ServiceCreate /></Layout></ProtectedRoute>
        } />
        <Route path="/services/:id" element={
          <ProtectedRoute providerOnly><Layout><ServiceDetail /></Layout></ProtectedRoute>
        } />
        <Route path="/services/:id/edit" element={
          <ProtectedRoute providerOnly><Layout><ServiceEdit /></Layout></ProtectedRoute>
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
    </Suspense>
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
