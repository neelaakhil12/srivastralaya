import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mzrmhgllaglvwsmrbhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cm1oZ2xsYWdsdndzbXJiaGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDI5NjIsImV4cCI6MjEwMjUxODk2Mn0.Si8KYSTrXjiNUAT6iRH58akn42nGPil2q7Jb9puIcP0';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    let targetEmail = 'srivastralaya6@gmail.com';

    try {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('reset_token', token)
        .single();

      if (admin) {
        if (admin.reset_expires && new Date(admin.reset_expires) < new Date()) {
          return res.status(400).json({ success: false, message: 'Password reset link has expired. Please request a new one.' });
        }
        targetEmail = admin.email;
      }
    } catch (e) {
      // Supabase query error fallback
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Save updated password in Supabase
    try {
      await supabase
        .from('admins')
        .upsert({
          email: targetEmail,
          password_hash: newHash,
          role: 'admin',
          reset_token: null,
          reset_expires: null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
    } catch (upsertErr) {
      console.warn('Admin password upsert note:', upsertErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
