import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send, CheckCircle2, User, HelpCircle, ChevronDown } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.message.trim()) errs.message = 'Please enter your message';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      // reset after delay or keep message
    }
  };

  const contactCards = [
    {
      icon: <Phone className="w-6 h-6 text-[#701A23]" />,
      title: "Phone Support",
      detail: "+91 9618093699",
      subdetail: "Available 9:00 AM - 9:00 PM IST",
      href: "tel:9618093699",
      actionText: "Call Us Now"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
      title: "WhatsApp Chat",
      detail: "+91 9618093699",
      subdetail: "Instant response for product inquiries",
      href: "https://wa.me/919618093699?text=Hello%20Sri%20Vastralaya,%20I%20have%20an%20inquiry.",
      actionText: "Chat on WhatsApp"
    },
    {
      icon: <Mail className="w-6 h-6 text-[#701A23]" />,
      title: "Email Us",
      detail: "Srivastralaya6@gmail.com",
      subdetail: "Send your detailed questions",
      href: "mailto:Srivastralaya6@gmail.com",
      actionText: "Send Email"
    }
  ];

  const faqs = [
    {
      q: "How can I place an order for sarees or jewellery?",
      a: "You can easily add items to your cart on this website and click 'Place Order via WhatsApp', or reach out to us directly at +91 9618093699."
    },
    {
      q: "What payment methods are accepted?",
      a: "We accept UPI (GPay, PhonePe, Paytm), Net Banking, direct Bank Transfer, and cash on delivery where available."
    },
    {
      q: "What is the delivery time across India?",
      a: "Orders are usually dispatched within 24 hours. Standard delivery takes 3 to 5 business days across India."
    },
    {
      q: "Is there free shipping available?",
      a: "Yes! All orders above ₹2000 qualify for 100% Free Express Shipping."
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-down">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">We Are Here To Help</span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Contact Sri Vastralaya
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Have a question about a product, order tracking, or saree draping guidance? Reach out to Pranu directly.
        </p>
      </section>

      {/* Contact Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
        {contactCards.map((card, idx) => (
          <a
            key={idx}
            href={card.href}
            target={card.href.startsWith('http') ? '_blank' : '_self'}
            rel="noreferrer"
            className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 text-center"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF0F1] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="text-base font-extrabold text-[#701A23] mt-1">{card.detail}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subdetail}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-xs font-bold text-[#701A23] group-hover:underline">
                {card.actionText} →
              </span>
            </div>
          </a>
        ))}
      </section>

      {/* Main Form & Business Information Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12" data-aos="fade-up">
        {/* Left Side: Business Info */}
        <div className="lg:col-span-5 bg-[#701A23] text-white p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="bg-white p-2.5 rounded-xl inline-block shadow-md border border-[#D4AF37]/30">
              <img src="/logo.png" alt="Sri Vastralaya" className="h-24 sm:h-28 w-auto object-contain" />
            </div>

            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
              We look forward to serving you with stylish and affordable fashion. Feel free to contact us anytime for customized saree inquiries or order assistance.
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-gray-200 pt-4 border-t border-[#891E2A]">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Owner: <strong className="text-white">Pranu</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <a href="tel:9618093699" className="hover:text-white underline">
                  9618093699
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <a href="https://wa.me/919618093699" target="_blank" rel="noreferrer" className="hover:text-white underline">
                  WhatsApp: 9618093699
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <a href="mailto:Srivastralaya6@gmail.com" className="hover:text-white underline">
                  Srivastralaya6@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#891E2A] text-xs text-gray-300">
            <p><strong>Note:</strong> Submitting this contact form does not require any payment.</p>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">Send Us a Message</h3>
            <p className="text-xs text-gray-500 mt-1">Fill out the form below and we will get back to you promptly.</p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-emerald-900">Message Received!</h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for contacting <strong>Sri Vastralaya</strong>. Pranu will respond to your message shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', message: '' });
                }}
                className="bg-[#701A23] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#701A23]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="9618093699"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#701A23]'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#701A23]'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.email}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you are looking for..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none resize-none ${
                    errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#701A23]'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#701A23] hover:bg-[#521117] text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Contact Message</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="space-y-6" data-aos="fade-up">
        <div className="text-center space-y-2">
          <HelpCircle className="w-6 h-6 text-[#701A23] mx-auto" />
          <h2 className="font-serif text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isFaqOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isFaqOpen ? null : idx)}
                  className="w-full text-left p-4 font-serif font-bold text-base text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#701A23] transition-transform ${isFaqOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFaqOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
