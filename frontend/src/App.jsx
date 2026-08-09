import React, { useState, useEffect, useCallback } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast manager
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Sessão encerrada.', 'info');
  }, [showToast]);

  // Auth Success callback
  const handleAuthSuccess = (token, loggedInUser) => {
    localStorage.setItem('token', token);
    setUser(loggedInUser);
  };

  // Check login on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token is expired or invalid
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Initial auth check failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="global-loader-container">
        <div className="spinner large"></div>
        <p>Carregando sua área de trabalho...</p>
      </div>
    );
  }

  return (
    <div className="app-root-layout">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} showToast={showToast} />
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} showToast={showToast} />
      )}

      {/* Toast notifications portal */}
      <div className="toast-portal-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
