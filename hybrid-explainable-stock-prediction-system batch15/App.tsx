
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { PreferencesProvider } from './context/PreferencesContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/common/Toast';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (username: string, email: string) => {
    const newUser = { username, email, isAuthenticated: true };
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <PreferencesProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-900 font-sans text-white">
          {user?.isAuthenticated ? (
            <Dashboard onLogout={handleLogout} currentUser={user} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
        <Toast />
      </ToastProvider>
    </PreferencesProvider>
  );
};

export default App;
