import React, { useEffect } from 'react';
import { ShieldCheck, FileText, Scale, ShoppingBag, Truck, RefreshCw, AlertCircle, Mail, Phone } from 'lucide-react';

export default function TermsPage({ setActivePage }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <section className="text-center space-y-3" data-aos="fade-down">
        <div className="inline-flex items-center gap-2 bg-[#FAF0F1] text-[#701A23] border border-[#F5DCD0] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Scale className="w-4 h-4 text-[#D4AF37]" />
          <span>Legal & Transparency</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Terms & Conditions
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Last Updated: August 29, 2026
        </p>
      </section>

      {/* Intro Box */}
      <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-gray-100 space-y-3 text-sm text-gray-700 leading-relaxed shadow-xs" data-aos="fade-up">
        <p>
          Welcome to <strong>Sri Vastralaya</strong> (<a href="https://srivastralaya.com" className="text-[#701A23] font-semibold underline">srivastralaya.com</a>), owned and operated by <strong>Pranu</strong>. By accessing or shopping from our website or initiating orders through our official WhatsApp channels, you agree to comply with and be bound by the following terms and conditions.
        </p>
        <p>
          Please review them carefully before placing an order. If you disagree with any part of these terms, please refrain from using our service.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8" data-aos="fade-up">
        {/* 1. Products & Pricing */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">1. Product Information & Pricing</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • We take utmost care to present accurate product descriptions, fabric details, colors, and prices. However, slight variations in color tone or weave texture may occur due to photographic lighting or display screens.
            </p>
            <p>
              • All prices listed on the website are in Indian Rupees (INR ₹) and are inclusive of applicable taxes unless stated otherwise.
            </p>
            <p>
              • We reserve the right to modify prices or discontinue items at any time without prior notice.
            </p>
          </div>
        </div>

        {/* 2. Orders & Payments */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">2. Orders & Secure Payments</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • Orders can be placed online through our website checkout or via our official WhatsApp assistance (+91 9618093699).
            </p>
            <p>
              • Online transactions are securely processed through industry-certified payment gateways (including Razorpay, UPI, Credit/Debit Cards, and Net Banking). Sri Vastralaya never stores your credit card or CVV details.
            </p>
            <p>
              • An order is confirmed once payment verification is successful.
            </p>
          </div>
        </div>

        {/* 3. Shipping & Delivery */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">3. Shipping & Delivery Timeline</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • We deliver across India through reliable courier partners.
            </p>
            <p>
              • Orders are typically dispatched within 24–48 hours of confirmation. Delivery time generally takes 3–7 business days depending on destination location.
            </p>
            <p>
              • Once dispatched, tracking details (AWB number and tracking URL) are shared via your account dashboard and WhatsApp/Email.
            </p>
          </div>
        </div>

        {/* 4. Exchange & Return Policy */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">4. Returns & Exchanges</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • In the unlikely event that you receive a damaged, defective, or incorrect product, please notify us within <strong>48 hours</strong> of package delivery along with an unboxing video/photograph.
            </p>
            <p>
              • Items must be in their original, unwashed, and unused condition with all tags and original packaging intact.
            </p>
            <p>
              • Approved replacements or exchanges will be processed swiftly upon receipt of the returned item.
            </p>
          </div>
        </div>

        {/* 5. Intellectual Property & Copyright */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0F1] text-[#701A23] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900">5. Intellectual Property</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 space-y-2 leading-relaxed pt-1">
            <p>
              • All content, logos, catalog imagery, product names, and branding on <em>srivastralaya.com</em> are the exclusive property of <strong>Sri Vastralaya</strong>.
            </p>
            <p>
              • Unauthorized copying, reproduction, or redistribution of our media or brand identity without explicit written permission is strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Banner */}
      <section className="bg-[#701A23] text-white p-6 sm:p-8 rounded-2xl text-center space-y-4 shadow-lg" data-aos="fade-up">
        <h3 className="font-serif text-2xl font-bold">Have Questions Regarding Our Terms?</h3>
        <p className="text-gray-200 text-xs sm:text-sm max-w-xl mx-auto">
          We are committed to transparent and friendly service. Reach out directly to Pranu on WhatsApp or via email anytime.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
          <a
            href="https://wa.me/919618093699"
            target="_blank"
            rel="noreferrer"
            className="bg-[#25D366] hover:bg-[#1eb956] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Chat on WhatsApp (+91 9618093699)
          </a>
          <a
            href="mailto:Srivastralaya6@gmail.com"
            className="bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-2.5 rounded-xl border border-white/20 transition-all"
          >
            Email: Srivastralaya6@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}
