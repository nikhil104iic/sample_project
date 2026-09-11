import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — wraps a component and redirects to /login
 * if no JWT token is found in localStorage.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
