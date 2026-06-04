import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanDetail from './pages/ScanDetail';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';

function ProtectedRoute({ children, doctorOnly = false }: { children: React.ReactNode; doctorOnly?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (doctorOnly && profile?.role !== 'doctor') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/scan/new" element={<ProtectedRoute><NewScan /></ProtectedRoute>} />
      <Route path="/scan/:id" element={<ProtectedRoute><ScanDetail /></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute doctorOnly><PatientList /></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute doctorOnly><PatientDetail /></ProtectedRoute>} />
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
