import { createClient } from '@supabase/supabase-js';
import { categories as defaultCategories } from '../data/categories';
import { products as defaultProducts } from '../data/products';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mzrmhgllaglvwsmrbhbv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cm1oZ2xsYWdsdndzbXJiaGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDI5NjIsImV4cCI6MjEwMjUxODk2Mn0.Si8KYSTrXjiNUAT6iRH58akn42nGPil2q7Jb9puIcP0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// CATEGORIES SERVICE
// ==========================================
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      // If table is empty or error, try auto-seeding
      if (!data || data.length === 0) {
        await seedCategoriesIfEmpty();
      }
      return defaultCategories;
    }

    // Format fields (e.g., snake_case to camelCase mapping for consistency)
    return data.map(item => ({
      id: item.id,
      name: item.name,
      tagline: item.tagline || '',
      description: item.description || '',
      image: item.image || '/products/generic-product.png',
      bannerImage: item.banner_image || item.image || '/products/generic-product.png',
      itemCount: item.item_count || '0 Items',
      featured: item.featured ?? false,
      subcategories: Array.isArray(item.subcategories) ? item.subcategories : (item.subcategories ? JSON.parse(item.subcategories) : [])
    }));
  } catch (err) {
    console.warn('Using default categories fallback due to:', err);
    return defaultCategories;
  }
}

export async function addCategory(category) {
  const payload = {
    id: category.id || `cat-${Date.now()}`,
    name: category.name,
    tagline: category.tagline || '',
    description: category.description || '',
    image: category.image || '/products/generic-product.png',
    banner_image: category.bannerImage || category.image || '/products/generic-product.png',
    item_count: category.itemCount || '0 Items',
    featured: category.featured || false,
    subcategories: category.subcategories || []
  };

  const { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id, category) {
  const payload = {
    name: category.name,
    tagline: category.tagline,
    description: category.description,
    image: category.image,
    banner_image: category.bannerImage || category.image,
    item_count: category.itemCount,
    featured: category.featured,
    subcategories: category.subcategories
  };

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// PRODUCTS SERVICE
// ==========================================
function getLocalOverrides() {
  try {
    const raw = localStorage.getItem('sv_custom_products');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalOverrides(overrides) {
  try {
    localStorage.setItem('sv_custom_products', JSON.stringify(overrides));
    window.dispatchEvent(new Event('sv_products_updated'));
  } catch (e) {
    console.error('Failed to save local product overrides:', e);
  }
}

export async function getProducts() {
  const localOverrides = getLocalOverrides();
  let baseList = [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (!data || data.length === 0) {
        await seedProductsIfEmpty();
      }
      baseList = defaultProducts;
    } else {
      baseList = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || '',
        price: Number(item.price) || 0,
        oldPrice: item.old_price ? Number(item.old_price) : null,
        discount: item.discount || '',
        isNew: item.is_new ?? false,
        isFeatured: item.is_featured ?? false,
        isBestSeller: item.is_best_seller ?? item.isBestSeller ?? false,
        isTrending: item.is_trending ?? item.isTrending ?? false,
        rating: Number(item.rating) || 4.8,
        reviewsCount: Number(item.reviews_count) || 0,
        image: item.image,
        images: Array.isArray(item.images) ? item.images : (item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [item.image]),
        sizes: Array.isArray(item.sizes) ? item.sizes : (item.sizes ? (typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes) : []),
        description: item.description || '',
        inStock: item.in_stock ?? true,
        fabric: item.fabric || '',
        length: item.length || ''
      }));
    }
  } catch (err) {
    console.warn('Using default products fallback due to:', err);
    baseList = defaultProducts;
  }

  // Merge with local overrides
  const mergedMap = new Map();
  baseList.forEach(p => mergedMap.set(p.id, p));

  Object.values(localOverrides).forEach(p => {
    if (p._deleted) {
      mergedMap.delete(p.id);
    } else {
      const existing = mergedMap.get(p.id) || {};
      mergedMap.set(p.id, { ...existing, ...p });
    }
  });

  return Array.from(mergedMap.values());
}

export async function addProduct(product) {
  const localOverrides = getLocalOverrides();
  const generatedId = product.id || `sv-${Date.now()}`;
  const normalized = {
    ...product,
    id: generatedId,
    price: Number(product.price) || 0,
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    isNew: product.isNew ?? false,
    isFeatured: product.isFeatured ?? false,
    isBestSeller: product.isBestSeller ?? false,
    isTrending: product.isTrending ?? false,
    inStock: product.inStock ?? true,
    sizes: product.sizes && product.sizes.length ? product.sizes : null
  };

  localOverrides[generatedId] = normalized;
  saveLocalOverrides(localOverrides);

  const payload = {
    id: generatedId,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory || '',
    price: Number(product.price) || 0,
    old_price: product.oldPrice ? Number(product.oldPrice) : null,
    discount: product.discount || '',
    is_new: product.isNew ?? false,
    is_featured: product.isFeatured ?? false,
    is_best_seller: product.isBestSeller ?? false,
    is_trending: product.isTrending ?? false,
    sizes: product.sizes && product.sizes.length ? product.sizes : null,
    rating: Number(product.rating) || 4.8,
    reviews_count: Number(product.reviewsCount) || 0,
    image: product.image,
    images: product.images && product.images.length ? product.images : [product.image],
    description: product.description || '',
    in_stock: product.inStock ?? true,
    fabric: product.fabric || '',
    length: product.length || ''
  };

  try {
    const { data, error } = await supabase
      .from('products')
      .upsert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    if (err.message && (err.message.includes('is_best_seller') || err.message.includes('is_trending') || err.message.includes('sizes'))) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.is_best_seller;
      delete fallbackPayload.is_trending;
      delete fallbackPayload.sizes;
      const { data, error } = await supabase
        .from('products')
        .upsert([fallbackPayload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    console.warn('Supabase add product warning (saved locally):', err.message);
    return normalized;
  }
}

export async function updateProduct(id, product) {
  const localOverrides = getLocalOverrides();
  const normalized = {
    ...(localOverrides[id] || {}),
    ...product,
    id: id,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    isNew: product.isNew ?? false,
    isFeatured: product.isFeatured ?? false,
    isBestSeller: product.isBestSeller ?? false,
    isTrending: product.isTrending ?? false,
    inStock: product.inStock ?? true,
    sizes: product.sizes && product.sizes.length ? product.sizes : null
  };

  localOverrides[id] = normalized;
  saveLocalOverrides(localOverrides);

  const payload = {
    id: id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    price: Number(product.price),
    old_price: product.oldPrice ? Number(product.oldPrice) : null,
    discount: product.discount,
    is_new: product.isNew,
    is_featured: product.isFeatured,
    is_best_seller: product.isBestSeller ?? false,
    is_trending: product.isTrending ?? false,
    sizes: product.sizes && product.sizes.length ? product.sizes : null,
    rating: Number(product.rating) || 4.8,
    reviews_count: Number(product.reviewsCount) || 0,
    image: product.image,
    images: product.images,
    description: product.description,
    in_stock: product.inStock,
    fabric: product.fabric,
    length: product.length
  };

  try {
    const { data, error } = await supabase
      .from('products')
      .upsert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    if (err.message && (err.message.includes('is_best_seller') || err.message.includes('is_trending') || err.message.includes('sizes'))) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.is_best_seller;
      delete fallbackPayload.is_trending;
      delete fallbackPayload.sizes;
      const { data, error } = await supabase
        .from('products')
        .upsert([fallbackPayload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    console.warn('Supabase update product warning (saved locally):', err.message);
    return normalized;
  }
}

export async function deleteProduct(id) {
  const localOverrides = getLocalOverrides();
  localOverrides[id] = { id, _deleted: true };
  saveLocalOverrides(localOverrides);

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (e) {
    console.warn('Supabase delete warning:', e.message);
  }
  return true;
}

// ==========================================
// ORDERS SERVICE
// ==========================================
export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      customerName: item.customer_name,
      customerPhone: item.customer_phone,
      customerEmail: item.customer_email || '',
      customerAddress: item.customer_address || '',
      items: Array.isArray(item.items) ? item.items : (item.items ? JSON.parse(item.items) : []),
      subtotal: Number(item.subtotal) || 0,
      discount: Number(item.discount) || 0,
      shipping: Number(item.shipping) || 0,
      total: Number(item.total) || 0,
      status: item.status || 'Pending',
      paymentMethod: item.payment_method || 'COD',
      notes: item.notes || '',
      createdAt: item.created_at
    }));
  } catch (err) {
    console.warn('Orders fetch error, returning local cache/mock:', err);
    return [];
  }
}

export async function addOrder(order) {
  const payload = {
    id: order.id || `ORD-${Date.now().toString().slice(-6)}`,
    customer_name: order.customerName || 'Customer',
    customer_phone: order.customerPhone || 'N/A',
    customer_email: order.customerEmail || '',
    customer_address: order.customerAddress || '',
    items: order.items || [],
    subtotal: Number(order.subtotal) || 0,
    discount: Number(order.discount) || 0,
    shipping: Number(order.shipping) || 0,
    total: Number(order.total) || 0,
    status: order.status || 'Pending',
    payment_method: order.paymentMethod || 'WhatsApp / COD',
    notes: order.notes || ''
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Order save to Supabase error:', error);
    return payload;
  }
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrder(id) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ==========================================
// AUTO-SEEDING HELPERS
// ==========================================
export async function seedCategoriesIfEmpty() {
  try {
    const { data: existing } = await supabase.from('categories').select('id').limit(1);
    if (!existing || existing.length === 0) {
      const formatted = defaultCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        tagline: cat.tagline || '',
        description: cat.description || '',
        image: cat.image,
        banner_image: cat.bannerImage || cat.image,
        item_count: cat.itemCount || '0 Items',
        featured: cat.featured || false,
        subcategories: cat.subcategories || []
      }));
      await supabase.from('categories').insert(formatted);
      console.log('✅ Seeded default categories into Supabase');
    }
  } catch (err) {
    console.log('Categories auto-seed note:', err.message);
  }
}

export async function seedProductsIfEmpty() {
  try {
    const { data: existing } = await supabase.from('products').select('id').limit(1);
    if (!existing || existing.length === 0) {
      const formatted = defaultProducts.map(prod => ({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        subcategory: prod.subcategory || '',
        price: prod.price,
        old_price: prod.oldPrice || null,
        discount: prod.discount || '',
        is_new: prod.isNew || false,
        is_featured: prod.isFeatured || false,
        rating: prod.rating || 4.8,
        reviews_count: prod.reviewsCount || 0,
        image: prod.image,
        images: prod.images || [prod.image],
        description: prod.description || '',
        in_stock: prod.inStock ?? true,
        fabric: prod.fabric || '',
        length: prod.length || ''
      }));
      await supabase.from('products').insert(formatted);
      console.log('✅ Seeded default products into Supabase');
    }
  } catch (err) {
    console.log('Products auto-seed note:', err.message);
  }
}
