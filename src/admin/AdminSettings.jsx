import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Database,
  Cloud,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { testSmtp } from '../services/adminAuth';
import { seedCategoriesIfEmpty, seedProductsIfEmpty } from '../services/supabase';

export default function AdminSettings({ adminUser }) {
  const [smtpTargetEmail, setSmtpTargetEmail] = useState('srivastralaya6@gmail.com');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null);
  const [smtpError, setSmtpError] = useState('');

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  const handleTestSmtp = async (e) => {
    e.preventDefault();
    setTestingSmtp(true);
    setSmtpResult(null);
    setSmtpError('');

    try {
      const res = await testSmtp(smtpTargetEmail);
      setSmtpResult(res.message || 'SMTP Test email sent successfully!');
    } catch (err) {
      setSmtpError(err.message || 'Failed to send test email. Check server and credentials.');
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSyncSeed = async () => {
    setSeeding(true);
    setSeedSuccess('');
    try {
      await seedCategoriesIfEmpty();
      await seedProductsIfEmpty();
      setSeedSuccess('Categories and Products verified in Supabase database.');
    } catch (err) {
      alert('Sync note: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#701A23]" />
          <span>System Settings & Diagnostics</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Verify connected cloud infrastructure, SMTP email dispatch, and database sync
        </p>
      </div>

      {/* Services Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supabase Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Supabase Database</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono truncate">
              mzrmhgllaglvwsmrbhbv
            </p>
          </div>
        </div>

        {/* Cloudinary Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Ready
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Cloudinary CDN</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
              Cloud: k1vemtdl
            </p>
          </div>
        </div>

        {/* SMTP Nodemailer Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Active
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Nodemailer SMTP</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-mono truncate">
              srivastralaya6@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* SMTP Test Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">Test SMTP Password Reset Delivery</h3>
            <p className="text-xs text-gray-500">Send an instant test email to verify Gmail App Password configuration</p>
          </div>
        </div>

        {smtpResult && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{smtpResult}</span>
          </div>
        )}

        {smtpError && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{smtpError}</span>
          </div>
        )}

        <form onSubmit={handleTestSmtp} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="email"
            required
            value={smtpTargetEmail}
            onChange={(e) => setSmtpTargetEmail(e.target.value)}
            placeholder="Recipient email address"
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23]"
          />
          <button
            type="submit"
            disabled={testingSmtp}
            className="px-5 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {testingSmtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Test Ping...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Supabase Database Auto-Seed Action */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900">Supabase Table Sync & Seed</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ensure standard categories, initial product catalog, and admin profiles are seeded into Supabase.
            </p>
          </div>
          <button
            onClick={handleSyncSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>

        {seedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{seedSuccess}</span>
          </div>
        )}
      </div>
    </div>
  );
}
