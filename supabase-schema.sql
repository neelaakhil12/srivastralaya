-- =========================================================
-- SRI VASTRALAYA SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor if creating tables manually
-- =========================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image TEXT,
    banner_image TEXT,
    item_count TEXT DEFAULT '0 Items',
    featured BOOLEAN DEFAULT false,
    subcategories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    discount TEXT,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    fabric TEXT,
    length TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    shipping NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Completed', 'Cancelled'
    payment_method TEXT DEFAULT 'COD',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    reset_token TEXT,
    reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC ACCESS POLICIES FOR OUR APP
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow anon read & write for public web store & admin operations
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public access admins" ON public.admins FOR ALL USING (true);

-- =========================================================
-- USER AUTH TABLES (for customer login)
-- =========================================================

-- 5. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    google_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. USER OTPs TABLE (short-lived, auto-cleaned)
CREATE TABLE IF NOT EXISTS public.user_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_otps ENABLE ROW LEVEL SECURITY;

-- Allow full public access (secured at app level)
CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public access user_otps" ON public.user_otps FOR ALL USING (true);

-- 7. HERO SLIDERS TABLE
CREATE TABLE IF NOT EXISTS public.hero_sliders (
    id TEXT PRIMARY KEY,
    image TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    link TEXT DEFAULT 'products',
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hero_sliders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select hero_sliders" ON public.hero_sliders FOR SELECT USING (true);
CREATE POLICY "Allow public insert hero_sliders" ON public.hero_sliders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update hero_sliders" ON public.hero_sliders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete hero_sliders" ON public.hero_sliders FOR DELETE USING (true);


