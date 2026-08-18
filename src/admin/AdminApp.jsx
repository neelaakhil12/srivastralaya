import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminResetPassword from './AdminResetPassword';
import AdminLayout from './AdminLayout';
import { getAdminSession } from '../services/adminAuth';

export default function AdminApp({ onNavigateToStore }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isResetPasswordView, setIsResetPasswordView] = useState(false);

  useEffect(() => {
    // Check if URL has reset token or is reset password path
    const url = window.location.href;
    if (url.includes('reset-password') || url.includes('token=')) {
      setIsResetPasswordView(true);
    }

    // Check existing active admin session
    const session = getAdminSession();
    if (session) {
      setAdminUser(session);
    }
  }, []);

  const [loginToast, setLoginToast] = useState('');

  if (isResetPasswordView) {
    return (
      <AdminResetPassword
        onNavigateToLogin={(msg) => {
          setIsResetPasswordView(false);
          if (msg) setLoginToast(msg);
          try {
            window.history.replaceState({}, document.title, '/admin');
          } catch {}
        }}
      />
    );
  }

  if (!adminUser) {
    return (
      <AdminLogin
        onLoginSuccess={(admin) => setAdminUser(admin)}
        onNavigateToStore={onNavigateToStore}
        initialSuccessMessage={loginToast}
      />
    );
  }

  return (
    <AdminLayout
      adminUser={adminUser}
      onLogout={() => setAdminUser(null)}
      onNavigateToStore={onNavigateToStore}
    />
  );
}
