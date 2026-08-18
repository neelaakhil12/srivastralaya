import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mzrmhgllaglvwsmrbhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cm1oZ2xsYWdsdndzbXJiaGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDI5NjIsImV4cCI6MjEwMjUxODk2Mn0.Si8KYSTrXjiNUAT6iRH58akn42nGPil2q7Jb9puIcP0';
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_ADMIN_EMAIL = 'srivastralaya6@gmail.com';
const DEFAULT_PASSWORD = 'admin@srivastralaya';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase
    let adminRecord = null;
    try {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .single();
      if (admin) adminRecord = admin;
    } catch (e) {
      // Supabase table or row might not exist yet
    }

    // 2. Default fallback credentials if no record in Supabase yet
    if (!adminRecord && cleanEmail === DEFAULT_ADMIN_EMAIL && password === DEFAULT_PASSWORD) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
          email: cleanEmail,
          role: 'admin'
        }
      });
    }

    if (!adminRecord) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, adminRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        email: adminRecord.email,
        role: adminRecord.role || 'admin'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
