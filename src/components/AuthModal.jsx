import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Mail, Shield, ArrowRight, RefreshCw, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();

  // Steps: 'form' | 'otp' | 'google-profile' | 'success'
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP login fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Google profile step fields (pre-filled from Google)
  const [googlePayload, setGooglePayload] = useState(null);
  const [googleName, setGoogleName] = useState('');
  const [googlePhone, setGooglePhone] = useState('');

  // OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const googleBtnRef = useRef(null);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!isAuthModalOpen || step !== 'form') return;
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 360,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isAuthModalOpen, step]);

  // Reset on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('form');
      setError('');
      setName('');
      setPhone('');
      setEmail('');
      setGooglePayload(null);
      setGoogleName('');
      setGooglePhone('');
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(0);
      setLoading(false);
    }
  }, [isAuthModalOpen]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeAuthModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your full name.');
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) return setError('Please enter a valid 10-digit Indian mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.');

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.replace(/\s/g, ''), email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handling ────────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[idx] = digit;
    setOtpDigits(newDigits);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtpDigits(text.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) return setError('Please enter all 6 digits of the OTP.');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStep('success');
      setTimeout(() => login(data.user, data.token), 1200);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google Credential Handler — goes to profile step ─────────────────────
  const handleGoogleCredential = (response) => {
    try {
      const base64Payload = response.credential.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      setGooglePayload(payload);
      setGoogleName(payload.name || '');
      setGooglePhone('');
      setError('');
      setStep('google-profile');
    } catch {
      setError('Google Sign-In failed. Please try OTP login instead.');
    }
  };

  // ── Complete Google Profile (name + phone confirm) ─────────────────────────
  const handleGoogleProfileSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!googleName.trim()) return setError('Please enter your full name.');
    if (!/^[6-9]\d{9}$/.test(googlePhone.replace(/\s/g, ''))) return setError('Please enter a valid 10-digit Indian mobile number.');

    const googleUser = {
      id: googlePayload.sub,
      name: googleName.trim(),
      email: googlePayload.email || '',
      phone: googlePhone.replace(/\s/g, ''),
      avatar_url: googlePayload.picture || null,
      google_id: googlePayload.sub,
    };
    const token = btoa(JSON.stringify({ ...googleUser, iat: Date.now() }));
    setStep('success');
    setTimeout(() => login(googleUser, token), 1200);
  };

  // ── Step indicator config ─────────────────────────────────────────────────
  const isGoogleFlow = step === 'google-profile';
  const stepLabels = isGoogleFlow
    ? ['Google Auth', 'Your Details']
    : ['Details', 'Verify OTP'];
  const stepActive = (i) => {
    if (isGoogleFlow) return i === 1;
    return (i === 0 && step === 'form') || (i === 1 && step === 'otp');
  };
  const stepDone = (i) => {
    if (isGoogleFlow) return i === 0;
    return i === 0 && step === 'otp';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="absolute inset-0" onClick={closeAuthModal} />

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#701A23] to-[#4A0E17] px-6 py-5">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 60%)' }} />
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-[#D4AF37] font-bold tracking-[3px] uppercase mb-1">Welcome to</p>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Sri Vastralaya
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            {step === 'form' && 'Sign in or create your account'}
            {step === 'otp' && `OTP sent to ${email}`}
            {step === 'google-profile' && 'Complete your profile'}
            {step === 'success' && 'You are now signed in!'}
          </p>
        </div>

        {/* ── Step Indicators ─────────────────────────────────────────────── */}
        {step !== 'success' && (
          <div className="flex items-center gap-2 px-6 pt-4 pb-0">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  stepDone(i) ? 'bg-green-500 text-white' : stepActive(i) ? 'bg-[#701A23] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {stepDone(i) ? '✓' : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${stepActive(i) ? 'text-[#701A23]' : stepDone(i) ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                {i < 1 && <div className={`flex-1 h-px mx-1 w-8 ${stepDone(i) ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: OTP Form ────────────────────────────────────────────── */}
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="px-6 py-5 space-y-4">
            {/* Google Button */}
            {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
              <div className="w-full flex justify-center">
                <div ref={googleBtnRef} className="w-full" />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 bg-gray-50 text-sm text-gray-400 cursor-not-allowed select-none">
                <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-40">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google <span className="text-[11px]">(Client ID not set)</span></span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or sign in with OTP</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">+91</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9xxxxxxxxx"
                  className="w-full pl-16 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">OTP will be sent to this email address</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : (
                <>
                  <Shield className="w-4 h-4" />
                  Send OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400">
              By continuing, you agree to our{' '}
              <span className="text-[#701A23] font-semibold cursor-pointer hover:underline">Terms</span> &amp;{' '}
              <span className="text-[#701A23] font-semibold cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </form>
        )}

        {/* ── STEP 2: OTP Verify ───────────────────────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="px-6 py-5 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#FAF0F1] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Mail className="w-7 h-7 text-[#701A23]" />
              </div>
              <p className="text-sm text-gray-600">We sent a <strong className="text-[#701A23]">6-digit OTP</strong> to</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{email}</p>
            </div>

            <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
              {otpDigits.map((d, i) => (
                <input
                  key={`otp-${i}`}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none ${
                    d ? 'border-[#701A23] bg-[#FAF0F1] text-[#701A23]' : 'border-gray-200 focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10'
                  }`}
                />
              ))}
            </div>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-gray-500">Resend OTP in <strong className="text-[#701A23]">{countdown}s</strong></p>
              ) : (
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtpDigits(['','','','','','']); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#701A23] font-semibold hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-60"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verify &amp; Sign In
                </>
              )}
            </button>

            <button type="button" onClick={() => setStep('form')} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to details
            </button>
          </form>
        )}

        {/* ── STEP: Google Profile Completion ─────────────────────────────── */}
        {step === 'google-profile' && (
          <form onSubmit={handleGoogleProfileSubmit} className="px-6 py-5 space-y-4">
            {/* Google account badge */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
              {googlePayload?.picture ? (
                <img src={googlePayload.picture} alt="Google" className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  G
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-700">Signed in with Google</p>
                <p className="text-xs text-blue-600 truncate">{googlePayload?.email}</p>
              </div>
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 ml-auto">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>

            <p className="text-xs text-gray-500 text-center -mt-1">
              Please confirm your details to complete sign-in
            </p>

            {/* Full Name (pre-filled from Google, editable) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10 transition-all"
                />
              </div>
            </div>

            {/* Phone Number (empty, must fill) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">+91</div>
                <input
                  type="tel"
                  value={googlePhone}
                  onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9xxxxxxxxx"
                  autoFocus
                  className="w-full pl-16 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#701A23] focus:ring-2 focus:ring-[#701A23]/10 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Required for order updates and delivery notifications</p>
            </div>

            {/* Email (locked, from Google) */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={googlePayload?.email || ''}
                  readOnly
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <p className="text-[11px] text-green-600 mt-1.5 font-medium">✓ Verified by Google</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#701A23] hover:bg-[#521117] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Sign In
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => { setStep('form'); setGooglePayload(null); setError(''); }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Use different sign-in method
            </button>
          </form>
        )}

        {/* ── STEP: Success ────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="px-6 py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Welcome!
            </h3>
            <p className="text-sm text-gray-500">You are successfully signed in.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
