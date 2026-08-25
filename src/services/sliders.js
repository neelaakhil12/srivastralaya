import { getStoreConfig, saveStoreConfig } from './supabase';

const DEFAULT_SLIDERS = [
  { id: 'slide-1', image: '/slider/image.png', title: 'Timeless Sarees Collection', subtitle: 'Handcrafted Elegance for Festive & Bridal Celebrations', link: 'sarees', active: true },
  { id: 'slide-2', image: '/slider/image copy.png', title: 'Grand Silk & Weaves', subtitle: 'Exquisite Heritage Weaves Direct from Artisans', link: 'sarees', active: true },
  { id: 'slide-3', image: '/slider/image copy 2.png', title: 'Royal Temple Jewellery', subtitle: 'Traditional Antique Designs with Premium Finish', link: 'jewellery', active: true },
  { id: 'slide-4', image: '/slider/image copy 3.png', title: 'Contemporary Designer Dresses', subtitle: 'Stylish & Comfortable Fits for Every Festive Occasion', link: 'dresses', active: true },
  { id: 'slide-5', image: '/slider/image copy 4.png', title: 'Exclusive Festive Offers', subtitle: 'Best Prices on Premium Silks & Jewellery Sets', link: 'products', active: true },
  { id: 'slide-6', image: '/slider/image copy 5.png', title: 'Ethnic Shirts & T-Shirts', subtitle: 'Comfortable Cotton & Festive Menswear', link: 'shirts', active: true },
  { id: 'slide-7', image: '/slider/image copy 6.png', title: 'Custom Photo Frames & Gifts', subtitle: 'Memories Framed with Devotion and Artistry', link: 'photoframes', active: true },
  { id: 'slide-8', image: '/slider/image copy 7.png', title: 'Fashion Hair Accessories', subtitle: 'Unique Floral & Traditional Hair Decor', link: 'hair-accessories', active: true },
];

// Async fetch from Supabase to sync across browsers
export async function syncSlidersFromCloud() {
  try {
    const config = await getStoreConfig();
    if (config && Array.isArray(config.sliders) && config.sliders.length > 0) {
      localStorage.setItem('sv_hero_sliders', JSON.stringify(config.sliders));
      if (config.sliderSettings) {
        localStorage.setItem('sv_slider_settings', JSON.stringify(config.sliderSettings));
      }
      window.dispatchEvent(new Event('sv_sliders_updated'));
      return config.sliders;
    }
  } catch (e) {}
  return null;
}

export function getHeroSliders() {
  // Trigger background cloud sync
  syncSlidersFromCloud();

  try {
    const raw = localStorage.getItem('sv_hero_sliders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_SLIDERS;
}

export async function saveHeroSliders(sliders) {
  try {
    localStorage.setItem('sv_hero_sliders', JSON.stringify(sliders));
    window.dispatchEvent(new Event('sv_sliders_updated'));
    // Persist to Supabase cloud
    await saveStoreConfig({ sliders });
  } catch (e) {
    console.error('Failed to save hero sliders:', e);
  }
}

export function getSliderSettings() {
  try {
    const raw = localStorage.getItem('sv_slider_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    intervalSeconds: 2.5,
    autoPlay: true
  };
}

export async function saveSliderSettings(settings) {
  try {
    localStorage.setItem('sv_slider_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('sv_sliders_updated'));
    // Persist to Supabase cloud
    await saveStoreConfig({ sliderSettings: settings });
  } catch (e) {
    console.error('Failed to save slider settings:', e);
  }
}
