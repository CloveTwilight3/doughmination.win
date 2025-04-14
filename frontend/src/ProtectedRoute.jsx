import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// This component wraps protected routes to ensure only authenticated users can access them
const ProtectedRoute = ({ children, adminRequired = false }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Check if admin when required
        if (adminRequired) {
          const adminRes = await fetch('/api/is_admin', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (adminRes.ok) {
            const data = await adminRes.json();
            setIsAdmin(!!data.isAdmin);
          } else {
            // If request fails, they're not an admin
            setIsAdmin(false);
          }
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [adminRequired]);

  if (loading) {
    return <div className="text-center p-8">Verifying access...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated, but remember where they were trying to go
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (adminRequired && !isAdmin) {
    // Redirect to home if admin access is required but user is not an admin
    return <Navigate to="/" replace />;
  }

  // If authenticated (and admin when required), render the children
  return children;
};

export default ProtectedRoute;