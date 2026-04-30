import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Results from './pages/Results';
import Settings from './pages/Settings';
import PublicBoard from './pages/PublicBoard';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<PublicBoard />} />
      <Route path="/login" element={user ? <Navigate to="/admin" replace /> : <Login />} />
      
      <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="results" element={<Results />} />
        <Route path="settings" element={<ProtectedRoute requireAdmin={true}><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
