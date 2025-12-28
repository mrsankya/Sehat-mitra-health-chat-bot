import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SymptomChecker from './pages/SymptomChecker';
import SehatChat from './pages/SehatChat';
import Vaccination from './pages/Vaccination';
import Resources from './pages/Resources';
import KnowledgeBase from './pages/KnowledgeBase';
import HealthNews from './pages/HealthNews';
import Admin from './pages/Admin';
import Login from './pages/Login';
import LivePulse from './pages/LivePulse';
import SmartScan from './pages/SmartScan';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const ProtectedLayout = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedLayout />}>
              <Route index element={<Home />} />
              <Route path="symptoms" element={<SymptomChecker />} />
              <Route path="chat" element={<SehatChat />} />
              <Route path="live" element={<LivePulse />} />
              <Route path="scan" element={<SmartScan />} />
              <Route path="vaccination" element={<Vaccination />} />
              <Route path="resources" element={<Resources />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              <Route path="news" element={<HealthNews />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}