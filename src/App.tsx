import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegisterPig from './pages/RegisterPig';
import PigList from './pages/PigList';
import Users from './pages/Users';
import Barangays from './pages/Barangays';
import Profile from './pages/Profile';
import History from './pages/History';
import Messaging from './pages/Messaging';
import Drafts from './pages/Drafts';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
      return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

// Wrapper to use hook
function AppRoutes() {
  const { currentUser } = useApp();
  
  if (!currentUser) {
      // If we are not logged in, we can render the login route here
      // But typically we handle this via ProtectedRoute or redirect
      // This hook usage is just to ensure context is available
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register-pig" element={<RegisterPig />} />
        <Route path="/pigs" element={<PigList filter="all" />} />
        <Route path="/my-pigs" element={<PigList filter="mine" />} />
        <Route path="/users" element={<Users />} />
        <Route path="/barangays" element={<Barangays />} />
        <Route path="/history" element={<History />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/drafts" element={<Drafts />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
