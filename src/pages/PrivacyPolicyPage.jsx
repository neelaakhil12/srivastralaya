import React, { useEffect } from 'react';
import { Lock, Shield, Eye, Database, Cookie, UserCheck, Mail, Phone, Heart } from 'lucide-react';

export default function PrivacyPolicyPage({ setActivePage }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <section className="text-center space-y-3" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#FAF0F1] text-[#701A23] border border-[#F5DCD0] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Lock className="w-4 h-4 text-[#D4AF37]" />
          <span>Data Privacy & Security</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Privacy Policy
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Last Updated: August 29, 2026
        </p>
      </section>

      {/* Intro Box */}
      <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed shadow-xs" data-aos="fade-up">
        <p>
          At <strong>Sri Vastralaya</strong> (<a href="https://srivastralaya.com" className="text-[#701A23] font-semibold underline">srivastralaya.com</a>), founded and owned by <strong>Pranu</strong>, we deeply respect your trust and are committed to protecting your personal privacy.
        </p>
        <p>
          This Privacy Policy outlines what information we collect, how we securely use it to fulfill your orders, and how your rights are protected.
        </p>
      </div>

      {/* Policy Details */}
      <div className="space-y-8" data-aos="fade-up">
        {/* 1. Information Collected */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">1. Information We Collect</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>We may collect information you provide directly when browsing, creating an account, or placing an order:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>Contact Information:</strong> Full name, phone/WhatsApp number, email address.</li>
              <li><strong>Delivery Information:</strong> Shipping address, pin code, city, and state.</li>
              <li><strong>Order Information:</strong> Products selected, order dates, transaction reference IDs, and customer support communications.</li>
            </ul>
          </div>
        </div>

        {/* 2. How Information is Used */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>Your details are used strictly for legitimate e-commerce operations, including:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Processing, fulfilling, and dispatching your fashion and saree orders.</li>
              <li>Sending order confirmation invoices, shipping tracking links, and delivery updates via SMS/WhatsApp/Email.</li>
              <li>Providing responsive customer service and addressing personalized styling or fabric inquiries.</li>
              <li>Maintaining security and preventing fraudulent transactions.</li>
            </ul>
          </div>
        </div>

        {/* 3. Payment Security */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">3. Payment & Data Security</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • All online payments on <strong>Sri Vastralaya</strong> are encrypted through RBI-compliant, PCI-DSS certified payment gateway infrastructure (such as Razorpay).
            </p>
            <p>
              • <strong>We never store or view your full debit/credit card numbers, CVV codes, or net banking passwords.</strong>
            </p>
            <p>
              • All data transferred between your browser and our servers is secured using SSL/TLS encryption.
            </p>
          </div>
        </div>

        {/* 4. Non-Disclosure & Third Parties */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">4. Sharing of Information</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • <strong>We do not sell, rent, or trade your personal data to any third-party marketing companies.</strong>
            </p>
            <p>
              • We share necessary delivery details only with trusted courier and logistics partners solely for delivering your packages to your doorstep.
            </p>
          </div>
        </div>

        {/* 5. Cookies & Local Storage */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">5. Cookies & Storage</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              We use browser local storage and essential session cookies to remember items in your shopping bag, wishlist preferences, and maintain login sessions for a seamless shopping experience.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Banner */}
      <section className="bg-[#701A23] text-white p-6 sm:p-8 rounded-2xl text-center space-y-4 shadow-lg" data-aos="fade-up">
        <h3 className="font-serif text-2xl font-bold">Privacy Inquiries</h3>
        <p className="text-gray-200 text-xs sm:text-sm max-w-xl mx-auto">
          If you have any questions or would like to request updates or deletion of your personal account data, please contact us.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
          <a
            href="mailto:Srivastralaya6@gmail.com"
            className="bg-[#D4AF37] hover:bg-[#c59b27] text-[#701A23] font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Email: Srivastralaya6@gmail.com
          </a>
          <a
            href="https://wa.me/919618093699"
            target="_blank"
            rel="noreferrer"
            className="bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-2.5 rounded-xl border border-white/20 transition-all"
          >
            WhatsApp Support: +91 9618093699
          </a>
        </div>
      </section>
    </div>
  );
}
