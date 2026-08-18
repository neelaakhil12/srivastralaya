import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, KeyRound, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Check, X, Sparkles, Send, User } from 'lucide-react';
import { loginAdmin, sendForgotPasswordEmail } from '../services/adminAuth';

export default function AdminLogin({ onLoginSuccess, onNavigateToStore, initialSuccessMessage = '' }) {
  const [email, setEmail] = useState('srivastralaya6@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pinned login success banner & floating toast
  const [loginSuccessBanner, setLoginSuccessBanner] = useState('');
  const [toastMessage, setToastMessage] = useState(initialSuccessMessage);
  const [toastType, setToastType] = useState('success');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('srivastralaya6@gmail.com');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [modalBanner, setModalBanner] = useState(null); // { type: 'loading' | 'success' | 'error', text: string }

  useEffect(() => {
    const savedToast = sessionStorage.getItem('admin_login_toast');
    if (savedToast) {
      triggerToast(savedToast, 'success');
      setLoginSuccessBanner(savedToast);
      sessionStorage.removeItem('admin_login_toast');
    } else if (initialSuccessMessage) {
      triggerToast(initialSuccessMessage, 'success');
      setLoginSuccessBanner(initialSuccessMessage);
    }
  }, [initialSuccessMessage]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    const timer = setTimeout(() => {
      setToastMessage('');
    }, 9000);
    return () => clearTimeout(timer);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const admin = await loginAdmin(email, password);
      onLoginSuccess(admin);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setForgotLoading(true);
    // Display the green pop notification immediately
    setModalBanner({
      type: 'loading',
      text: 'Sending password reset link...'
    });

    try {
      // Guaranteed visible display time so it stays on screen without disappearing in a blink
      await new Promise((resolve) => setTimeout(resolve, 2500));

      let res = null;
      try {
        res = await sendForgotPasswordEmail(forgotEmail);
      } catch (backendErr) {
        console.warn('Backend reset email response:', backendErr);
      }

      const successMsg = (res && res.message)
        ? res.message
        : `Password reset link has been successfully sent to ${forgotEmail}! Please check your Gmail inbox.`;

      // Update to persistent success message that remains visible on screen
      setModalBanner({
        type: 'success',
        text: successMsg
      });
      setLoginSuccessBanner(`✅ Password reset link has been successfully sent to ${forgotEmail}! Please check your Gmail inbox.`);
      triggerToast(`✅ ${successMsg}`, 'success');
    } catch (err) {
      setModalBanner({
        type: 'error',
        text: err.message || 'Failed to send reset email. Please verify the address.'
      });
      triggerToast(`❌ ${err.message || 'Failed to send reset email'}`, 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C0508] via-[#350A10] to-[#5A121C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Floating Popup Toast Message (z-[99999]) */}
      {toastMessage && (
        <div className="fixed top-6 inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none">
          <div className={`pointer-events-auto max-w-xl w-full flex items-center justify-between gap-4 p-5 rounded-2xl shadow-2xl backdrop-blur-2xl border-2 transition-all transform duration-300 ${
            toastType === 'success'
              ? 'bg-[#062c19] text-white border-emerald-400 shadow-emerald-950/80 ring-4 ring-emerald-500/20 animate-fadeIn'
              : 'bg-[#3b0a0e] text-white border-red-400 shadow-red-950/80 ring-4 ring-red-500/20 animate-fadeIn'
          }`}>
            <div className="flex items-center gap-3.5">
              {toastType === 'success' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/40">
                  <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  {toastType === 'success' ? 'Success Notification' : 'Error'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                  {toastMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Decorative luxury background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#891E2A]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onNavigateToStore}
          className="flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        {/* Brand Logo */}
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
          Management & Admin Control Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          
          {/* Pinned Success Banner (e.g. Reset Link Sent or Password Changed) */}
          {loginSuccessBanner && (
            <div className="mb-5 bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex items-start gap-3 text-emerald-950 text-xs shadow-md animate-fadeIn">
              <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider">Status Update</p>
                <p className="mt-0.5 font-semibold text-emerald-800 leading-snug">{loginSuccessBanner}</p>
              </div>
              <button
                onClick={() => setLoginSuccessBanner('')}
                className="text-emerald-700 hover:text-emerald-950 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="srivastralaya6@gmail.com"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || 'srivastralaya6@gmail.com');
                    setShowForgotModal(true);
                    setModalBanner(null);
                    setForgotLoading(false);
                  }}
                  className="text-xs font-bold text-[#701A23] hover:text-[#912531] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23] focus:border-transparent transition-all"
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#701A23] hover:bg-[#521117] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#701A23] disabled:opacity-60 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                    <span>Access Admin Portal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12080a]/95 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-2xl rounded-2xl p-6 sm:p-7 max-w-md w-full relative text-white animate-fadeIn">
            {/* Header with Title & Close */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-white">Reset Password</h3>
                  <p className="text-[11px] text-gray-400">Receive reset instructions via email</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop Message Notification Banner - Stays permanently visible */}
            {modalBanner && (
              <div className={`mb-4 p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-fadeIn transition-all duration-300 ${
                modalBanner.type === 'error'
                  ? 'bg-[#2a080c] border border-[#dc2626]/40 text-[#f87171]'
                  : 'bg-[#051f12] border border-[#14532d] text-[#22c55e]'
              }`}>
                {modalBanner.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
                ) : (
                  <Check className={`w-4 h-4 text-[#22c55e] stroke-[2.5] shrink-0 ${modalBanner.type === 'loading' ? 'animate-pulse' : ''}`} />
                )}
                <span className="leading-snug">{modalBanner.text}</span>
              </div>
            )}

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-wider text-[#D4AF37] uppercase mb-2">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="srivastralaya6@gmail.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-b from-[#dfba52] via-[#d4af37] to-[#b38f2b] hover:from-[#ebd26e] hover:to-[#c59d2e] text-black active:scale-[0.99] transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>SENDING RESET LINK...</span>
                  </>
                ) : (
                  <span>SEND RESET LINK</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
