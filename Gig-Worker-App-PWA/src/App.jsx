import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Policy from './pages/Policy';
import Claims from './pages/Claims';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('es_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const RootRedirect = () => {
  const token = localStorage.getItem('es_token');
  if (!token) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/home" element={<ProtectedRoute><AppShell><Home /></AppShell></ProtectedRoute>} />
        <Route path="/policy" element={<ProtectedRoute><AppShell><Policy /></AppShell></ProtectedRoute>} />
        <Route path="/claims" element={<ProtectedRoute><AppShell><Claims /></AppShell></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
}

export default App;
