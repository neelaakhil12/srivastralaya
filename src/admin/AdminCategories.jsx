import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Loader2,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/supabase';
import { uploadToCloudinary } from '../services/cloudinary';

export default function AdminCategories({ isAddingNew, onCloseNewModal }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tagline: '',
    description: '',
    image: '',
    bannerImage: '',
    itemCount: '10+ Items',
    featured: true,
    subcategories: []
  });
  const [subcategoryInput, setSubcategoryInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isAddingNew) {
      handleOpenCreate();
      if (onCloseNewModal) onCloseNewModal();
    }
  }, [isAddingNew]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      tagline: '',
      description: '',
      image: '',
      bannerImage: '',
      itemCount: '15+ Items',
      featured: true,
      subcategories: []
    });
    setSubcategoryInput('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      tagline: cat.tagline || '',
      description: cat.description || '',
      image: cat.image || '',
      bannerImage: cat.bannerImage || cat.image || '',
      itemCount: cat.itemCount || '15+ Items',
      featured: cat.featured ?? false,
      subcategories: Array.isArray(cat.subcategories) ? [...cat.subcategories] : []
    });
    setSubcategoryInput('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setModalError('');
    try {
      const cloudinaryUrl = await uploadToCloudinary(file, 'sri-vastralaya/categories');
      setFormData(prev => ({
        ...prev,
        image: cloudinaryUrl,
        bannerImage: cloudinaryUrl
      }));
    } catch (err) {
      setModalError('Failed to upload image to Cloudinary: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!subcategoryInput.trim()) return;
    if (!formData.subcategories.includes(subcategoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subcategories: [...prev.subcategories, subcategoryInput.trim()]
      }));
    }
    setSubcategoryInput('');
  };

  const handleRemoveSubcategory = (tag) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Category name is required');
      return;
    }

    if (!formData.image) {
      setModalError('Please upload a category image');
      return;
    }

    setSubmitting(true);
    try {
      const slugId = formData.id.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        ...formData,
        id: slugId
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await addCategory(payload);
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setModalError('Error saving category: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.tagline && c.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#701A23]" />
            <span>Category Management</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Organize store departments, banners, and product collections
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#701A23]"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#701A23] hover:bg-[#521117] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#701A23] mb-2" />
          <p className="text-xs font-medium">Fetching categories from Supabase...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No categories found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No categories matched your search term.' : 'Click "Add New Category" to create your first collection.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Category Image */}
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = '/products/generic-product.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {cat.featured && (
                  <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#4A0E17] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
                    {cat.itemCount || 'Collection'}
                  </span>
                  <h3 className="font-serif font-bold text-base text-white leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {cat.tagline || cat.description || 'Exclusive weaves & festive fashion.'}
                  </p>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cat.subcategories.slice(0, 3).map((sub, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          {sub}
                        </span>
                      ))}
                      {cat.subcategories.length > 3 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                          +{cat.subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-gray-400">
                    ID: {cat.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-gray-600 hover:text-[#701A23] hover:bg-[#FAF0F1] rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-fadeIn border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-xs text-gray-500">Image will be securely stored in Cloudinary</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              {/* Category Name */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name: val,
                      id: editingCategory ? prev.id : val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }));
                  }}
                  placeholder="e.g. Silk Sarees"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
              </div>

              {/* Slug / ID */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Slug / Unique ID
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="e.g. silk-sarees"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Timeless Weaves & Festive Elegance"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                />
              </div>

              {/* Cloudinary Image Upload */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Category Image (Cloudinary) *
                </label>
                
                {formData.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-2 h-36 bg-gray-100 group">
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="px-3 py-1.5 bg-white text-gray-900 font-bold text-[11px] rounded-lg cursor-pointer shadow-md hover:bg-gray-100">
                        Replace Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 hover:border-[#701A23] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#FAF0F1]/30">
                    <Upload className="w-7 h-7 text-gray-400 mb-1.5" />
                    <span className="font-semibold text-gray-700 text-xs">
                      {uploadingImage ? 'Uploading to Cloudinary...' : 'Click to Upload Image'}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadingImage && (
                  <div className="flex items-center gap-2 text-[#701A23] text-xs mt-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading directly to Cloudinary (cloud: k1vemtdl)...</span>
                  </div>
                )}
              </div>

              {/* Subcategories */}
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Subcategories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subcategoryInput}
                    onChange={(e) => setSubcategoryInput(e.target.value)}
                    placeholder="e.g. Silk Sarees, Cotton Sarees"
                    className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#701A23] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {formData.subcategories.map((sub, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF0F1] text-[#701A23] text-xs font-semibold border border-[#F5DCD0]"
                    >
                      <span>{sub}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-700"
                        onClick={() => handleRemoveSubcategory(sub)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="categoryFeatured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-[#701A23] rounded border-gray-300 focus:ring-[#701A23]"
                />
                <label htmlFor="categoryFeatured" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Featured Category on Home Page
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 py-2.5 bg-[#701A23] hover:bg-[#521117] text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-gray-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900">Delete Category?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to remove category <strong className="text-gray-800 font-mono">"{deleteConfirmId}"</strong>? This will remove it from the Supabase database.
            </p>
            <div className="flex gap-3 mt-5 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
