import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import OTPVerification from './pages/OTPVerification';
import FoodLogs from './pages/FoodLogs';
import LogMeal from './pages/LogMeal';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Root Redirect Component - handles initial landing
function RootRedirect() {
  const hasToken = localStorage.getItem('access_token');

  if (hasToken) {
    return <Navigate to="/log-meal" replace />;
  }

  return <Navigate to="/auth" replace />;
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasToken = localStorage.getItem('access_token');

  if (!hasToken) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          
          {/* Root Route - redirects based on auth status */}
          <Route path="/" element={<RootRedirect />} />
          
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/food-logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <FoodLogs />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/log-meal"
            element={
              <ProtectedRoute>
                <Layout>
                  <LogMeal />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Layout>
                  <Insights />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

