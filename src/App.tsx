/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import TransporterDashboard from './pages/TransporterDashboard';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: 'farmer' | 'buyer' | 'transporter' }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) {
    if (user.role === 'farmer') return <Navigate to="/farmer-dashboard" />;
    if (user.role === 'buyer') return <Navigate to="/buyer-dashboard" />;
    return <Navigate to="/transporter-dashboard" />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MarketProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
              {/* 🟢 ChatGPT Style Sliding Sidebar & Header */}
              <Sidebar />

              {/* Main Content Area */}
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route 
                    path="/farmer-dashboard" 
                    element={
                      <ProtectedRoute role="farmer">
                        <FarmerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/buyer-dashboard" 
                    element={
                      <ProtectedRoute role="buyer">
                        <BuyerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/transporter-dashboard" 
                    element={
                      <ProtectedRoute role="transporter">
                        <TransporterDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </MarketProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}