import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Eye,
  Check,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ExternalLink,
  Save,
  RotateCcw
} from 'lucide-react';
import {
  getHeroSliders,
  saveHeroSliders,
  getSliderSettings,
  saveSliderSettings,
  syncSlidersFromCloud
} from '../services/sliders';
import { uploadToCloudinary } from '../services/cloudinary';

const CATEGORY_OPTIONS = [
  { value: 'products', label: 'All Products / Shop' },
  { value: 'sarees', label: 'Sarees Collection' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'hair-accessories', label: 'Hair Accessories' },
  { value: 'shirts', label: 'Shirts' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'photoframes', label: 'Photo Frames' },
  { value: 'fancy-items', label: 'Fancy Items' },
  { value: 'categories', label: 'All Categories Page' }
];

export default function AdminHeroSliders() {
  const [sliders, setSliders] = useState(getHeroSliders);
  const [settings, setSettings] = useState(getSliderSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Slide Form State
  const [formData, setFormData] = useState({
    id: '',
    image: '',
    title: '',
    subtitle: '',
    link: 'products',
    active: true
  });

  useEffect(() => {
    loadData();
    window.addEventListener('sv_sliders_updated', loadData);
    return () => window.removeEventListener('sv_sliders_updated', loadData);
  }, []);

  const loadData = async () => {
    setSliders(getHeroSliders());
    setSettings(getSliderSettings());
    const cloudSliders = await syncSlidersFromCloud();
    if (cloudSliders && Array.isArray(cloudSliders) && cloudSliders.length > 0) {
      setSliders(cloudSliders);
    }
  };

  const showSuccess = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormData({
      id: `slide-${Date.now()}`,
      image: '',
      title: '',
      subtitle: '',
      link: 'products',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setFormData({ ...sliders[index] });
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    // 1. Instant local preview via FileReader
    const reader = new FileReader();
    reader.onload = async (event) => {
      const localDataUrl = event.target.result;
      setFormData(prev => ({ ...prev, image: localDataUrl }));

      // 2. Try Cloudinary upload in background
      try {
        const cloudUrl = await uploadToCloudinary(file, 'hero-sliders');
        if (cloudUrl) {
          setFormData(prev => ({ ...prev, image: cloudUrl }));
        }
      } catch (err) {
        console.warn('Using local image payload:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => setUploadingImage(false);
    reader.readAsDataURL(file);
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please upload an image or provide an image URL for the slide.');
      return;
    }

    let updated = [...sliders];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...formData };
    } else {
      updated.push({ ...formData, id: formData.id || `slide-${Date.now()}` });
    }

    setSliders(updated);
    setIsModalOpen(false);
    await saveHeroSliders(updated);
    showSuccess(editingIndex !== null ? 'Slide updated successfully!' : 'New hero slide added successfully!');
  };

  const handleDeleteSlide = async (index) => {
    if (!window.confirm(`Are you sure you want to delete Slide #${index + 1}?`)) return;
    const updated = sliders.filter((_, i) => i !== index);
    setSliders(updated);
    await saveHeroSliders(updated);
    showSuccess('Slide deleted.');
  };

  const handleToggleActive = async (index) => {
    const updated = [...sliders];
    updated[index].active = !updated[index].active;
    setSliders(updated);
    await saveHeroSliders(updated);
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;
    const updated = [...sliders];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSliders(updated);
    await saveHeroSliders(updated);
  };



  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSliderSettings(newSettings);
    showSuccess('Slider speed settings updated!');
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset all hero sliders to default original 8 banners?')) return;
    localStorage.removeItem('sv_hero_sliders');
    loadData();
    showSuccess('Reset to original default sliders.');
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF0F1] flex items-center justify-center text-[#701A23]">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
              Homepage Hero Sliders
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload, arrange, and manage banner slides displayed on the main storefront header
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors cursor-pointer"
            title="Reset to default banner images"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-sm font-bold animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Slider Speed & Autoplay Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-700 uppercase tracking-wide">
            Slide Transition Speed:
          </span>
          <select
            value={settings.intervalSeconds}
            onChange={(e) => handleSaveSettings({ ...settings, intervalSeconds: Number(e.target.value) })}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-[#701A23]"
          >
            <option value={1.5}>1.5 Seconds (Fast)</option>
            <option value={2}>2.0 Seconds</option>
            <option value={2.5}>2.5 Seconds (Recommended)</option>
            <option value={3}>3.0 Seconds</option>
            <option value={4}>4.0 Seconds</option>
            <option value={5}>5.0 Seconds (Relaxed)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-gray-500">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Total <strong>{sliders.length}</strong> slides ({sliders.filter(s => s.active !== false).length} active on store)</span>
        </div>
      </div>

      {/* Sliders Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sliders.map((slide, index) => {
          const isActive = slide.active !== false;
          return (
            <div
              key={slide.id || index}
              className={`bg-white rounded-2xl border ${
                isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
              } shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md`}
            >
              {/* Slide Image Preview */}
              <div className="relative aspect-[21/9] bg-gray-100 overflow-hidden group">
                <img
                  src={slide.image}
                  alt={slide.title || `Slide ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Index badge */}
                <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Slide #{index + 1}
                </span>

                {/* Active/Inactive badge */}
                <span
                  className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* Slide Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                    {slide.title || `Banner Slide #${index + 1}`}
                  </h3>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                    {slide.subtitle || 'Hero banner slide for homepage'}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#701A23] font-semibold">
                    <ExternalLink className="w-3 h-3" />
                    <span>Links to: <strong>{slide.link || 'products'}</strong></span>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  {/* Re-order arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 cursor-pointer"
                      title="Move Left / Earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === sliders.length - 1}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 cursor-pointer"
                      title="Move Right / Later"
                    >
                      <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                    </button>
                  </div>

                  {/* Edit, Toggle, Delete buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(index)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'Hide' : 'Enable'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(index)}
                      className="p-1.5 text-gray-600 hover:text-[#701A23] hover:bg-[#FAF0F1] rounded-lg transition-colors cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteSlide(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Slide Modal ──────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-fadeIn border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  {editingIndex !== null ? `Edit Slide #${editingIndex + 1}` : 'Add New Hero Banner Slide'}
                </h3>
                <p className="text-xs text-gray-500">
                  Banner image will be displayed on the homepage slider
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 mt-4 text-xs">
              {/* Image Upload / URL */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Slide Banner Image *
                </label>

                {/* Upload Button */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF0F1] hover:bg-[#F5DCD0] text-[#701A23] rounded-xl font-bold border border-[#F5DCD0] cursor-pointer transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploadingImage ? 'Uploading Image...' : 'Upload Image from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Or paste image URL (e.g. /slider/image.png or https://...)"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Image Preview Box */}
                {formData.image && (
                  <div className="mt-3 relative aspect-[21/9] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full"
                      title="Clear image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Slide Title / Heading (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Timeless Kanjeevaram Sarees"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Subtitle / Promo Text (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Handcrafted silks with authentic pure zari"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
              </div>

              {/* Redirect Target / Category Link */}
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Redirect Destination on Click
                </label>
                <select
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slideActive"
                  checked={formData.active !== false}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded text-[#701A23] focus:ring-[#701A23]"
                />
                <label htmlFor="slideActive" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Display this banner slide actively on the homepage
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingIndex !== null ? 'Update Slide' : 'Save New Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
