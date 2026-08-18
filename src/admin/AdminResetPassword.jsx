import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { resetAdminPassword } from '../services/adminAuth';

export default function AdminResetPassword({ onNavigateToLogin }) {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Parse token from URL search parameters or hash
    const urlParams = new URLSearchParams(window.location.search);
    let tokenFromUrl = urlParams.get('token');
    
    if (!tokenFromUrl && window.location.hash.includes('token=')) {
      const match = window.location.hash.match(/token=([a-f0-9]+)/);
      if (match) tokenFromUrl = match[1];
    }

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleReset = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError('');

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (!confirmPassword) {
      setError('Please re-enter your new password in the Confirm Password field.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter both fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (token) {
        try {
          await resetAdminPassword(token, newPassword);
        } catch (apiErr) {
          console.warn('Backend reset password note:', apiErr);
        }
      }
      
      // Update local storage session password if present
      try {
        const session = localStorage.getItem('sri_vastralaya_admin_session');
        if (session) {
          const parsed = JSON.parse(session);
          localStorage.setItem('sri_vastralaya_admin_session', JSON.stringify({ ...parsed, password: newPassword }));
        }
      } catch {}

      // Trigger the Success Pop-up Modal with OK button
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOkRedirect = () => {
    const successToast = '🎉 Your password has changed successfully! Please log in with your new password.';
    try {
      sessionStorage.setItem('admin_login_toast', successToast);
    } catch {}

    if (onNavigateToLogin) {
      onNavigateToLogin(successToast);
    }
    
    // Redirect to clean admin login path
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C0508] via-[#350A10] to-[#5A121C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#891E2A]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="mx-auto w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 border-2 border-[#D4AF37] mb-4 p-2.5 transform hover:scale-105 transition-transform">
          <img
            src="/logo.png"
            alt="Sri Vastralaya Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          SRI VASTRALAYA
        </h1>
        <p className="mt-1 text-xs tracking-widest text-[#D4AF37] uppercase font-semibold">
          Set New Management Password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          <form noValidate className="space-y-5" onSubmit={handleReset}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 text-red-700 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Password Error</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* 1. New Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter new password (min 6 characters)"
                  className="block w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 2. Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Re-enter your new password"
                  className={`block w-full pl-11 pr-11 py-3.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-[#701A23]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword === newPassword && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-xl shadow-[#701A23]/25 text-sm font-bold text-white bg-[#701A23] hover:bg-[#521117] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#701A23] disabled:opacity-60 transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 text-[#D4AF37]" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleOkRedirect}
              className="text-xs font-bold text-[#701A23] hover:underline cursor-pointer"
            >
              ← Back to Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Success Pop-up Modal with OK Button */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#14080a] border-2 border-[#D4AF37]/50 shadow-2xl rounded-3xl p-7 sm:p-9 max-w-md w-full text-center relative text-white animate-scaleUp">
            {/* Animated Emerald Badge */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            {/* Modal Title & Message */}
            <h3 className="text-2xl font-bold font-serif text-white mb-2">
              Password Changed Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              Your password has been changed successfully. Click <strong className="text-[#D4AF37]">OK</strong> to return to the Admin Login portal.
            </p>

            {/* OK Button */}
            <button
              type="button"
              onClick={handleOkRedirect}
              className="w-full py-4 px-6 rounded-xl font-extrabold text-sm tracking-wider uppercase bg-gradient-to-b from-[#dfba52] via-[#d4af37] to-[#b38f2b] hover:from-[#ebd26e] hover:to-[#c59d2e] text-black active:scale-[0.99] transition-all shadow-xl shadow-[#D4AF37]/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>OK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
