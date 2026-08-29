import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Search,
  Globe,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  Sparkles
} from 'lucide-react';
import { testSmtp } from '../services/adminAuth';
import { seedCategoriesIfEmpty, seedProductsIfEmpty } from '../services/supabase';
import { getGSCVerificationCode, setGSCVerificationCode } from '../utils/seo';

export default function AdminSettings({ adminUser }) {
  const [smtpTargetEmail, setSmtpTargetEmail] = useState('srivastralaya6@gmail.com');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpResult, setSmtpResult] = useState(null);
  const [smtpError, setSmtpError] = useState('');

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  // SEO & Google Console States
  const [gscCode, setGscCode] = useState('');
  const [gscSaved, setGscSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');

  useEffect(() => {
    const existing = getGSCVerificationCode();
    if (existing) {
      setGscCode(existing);
    }
  }, []);

  const handleSaveGSC = (e) => {
    e.preventDefault();
    setGSCVerificationCode(gscCode.trim());
    setGscSaved(true);
    setTimeout(() => setGscSaved(false), 3000);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(''), 2500);
  };

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

      {/* Google Search Console & SEO Control Center */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900">Google Search Console & SEO Hub</h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  gscCode ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${gscCode ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  {gscCode ? 'Verification Active' : 'Ready to Connect'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage site ownership verification, XML sitemap indexing, and search appearance
              </p>
            </div>
          </div>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs shrink-0"
          >
            <span>Open Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Verification Code Form */}
        <form onSubmit={handleSaveGSC} className="space-y-3 bg-[#FAF8F5] p-4 sm:p-5 rounded-xl border border-gray-200/60">
          <label className="block text-xs font-bold text-gray-800">
            Google Site Verification Meta Tag / Token:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={gscCode}
                onChange={(e) => setGscCode(e.target.value)}
                placeholder="e.g. google-site-verification token or code"
                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#701A23]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              {gscSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved & Applied!</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-[#D4AF37]" />
                  <span>Save & Update Tag</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Paste the verification code from Google Search Console (HTML tag method) and click Save. It injects directly into the live site head.
          </p>
        </form>

        {/* Search Engine Snippet Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Google Search Result Live Preview (SERP):</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 rounded-full bg-[#701A23] text-white text-[8px] flex items-center justify-center font-bold">
                SV
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 text-[11px]">
                <span className="font-medium text-gray-900">Sri Vastralaya</span>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="text-gray-500 truncate">https://srivastralaya.com</span>
              </div>
            </div>
            <h4 className="text-sm sm:text-base font-medium text-[#1a0dab] hover:underline cursor-pointer">
              Sri Vastralaya - Stylish &amp; Affordable Fashion for Every Occasion
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Discover beautiful sarees, stylish dresses, jewellery, hair accessories, shirts &amp; fancy fashion items at affordable prices. Handpicked collections curated by Pranu.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-[#1a0dab]">
              <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-medium">Sarees</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-medium">Jewellery</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-medium">Hair Accessories</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-medium">Our Story</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 font-medium">Contact</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {/* Sitemap */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-800">XML Sitemap</p>
                <p className="text-[10px] text-gray-500 truncate">/sitemap.xml</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard('https://srivastralaya.com/sitemap.xml', 'sitemap')}
                title="Copy Sitemap URL"
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                {copiedLink === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Robots.txt */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCode className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-800">Robots Directive</p>
                <p className="text-[10px] text-gray-500 truncate">/robots.txt</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard('https://srivastralaya.com/robots.txt', 'robots')}
                title="Copy Robots.txt URL"
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                {copiedLink === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Schema & Rich Results Test */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-800">Rich Results Test</p>
                <p className="text-[10px] text-gray-500 truncate">Schema.org Validator</p>
              </div>
            </div>
            <a
              href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fsrivastralaya.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4-Step Google Search Console Setup Guide */}
        <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl space-y-2 text-xs text-blue-950">
          <p className="font-bold text-blue-900 flex items-center gap-1.5">
            <span>📋 Step-by-Step Google Search Console Setup:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-blue-900/90 text-[11px] leading-relaxed">
            <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="font-bold underline text-blue-800">Google Search Console</a> and click <strong>Add Property</strong> (enter your live URL).</li>
            <li>Choose <strong>HTML tag</strong> verification method and copy the code inside <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">content="..."</code>.</li>
            <li>Paste it above and click <strong>Save &amp; Update Tag</strong>.</li>
            <li>Click <strong>Verify</strong> in Google Search Console, then go to <strong>Sitemaps</strong> menu and submit <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900">sitemap.xml</code>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
