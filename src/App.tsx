import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatApp from './components/ChatApp';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import InstallPrompt from './components/InstallPrompt';
import { session } from './api/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Token-gated routes. The axios middleware (src/api/client.ts) clears the
// token and redirects to /auth on any 401/403, so a dead session can't linger.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!session.isAuthed()) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <InstallPrompt />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
