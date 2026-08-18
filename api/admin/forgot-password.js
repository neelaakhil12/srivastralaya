import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mzrmhgllaglvwsmrbhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cm1oZ2xsYWdsdndzbXJiaGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDI5NjIsImV4cCI6MjEwMjUxODk2Mn0.Si8KYSTrXjiNUAT6iRH58akn42nGPil2q7Jb9puIcP0';
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'srivastralaya6@gmail.com',
    pass: (process.env.SMTP_PASSWORD || 'lqiogflceipicdsm').replace(/\s+/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Enable CORS
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
    const { email, originUrl } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Upsert admin record with reset token in Supabase
    try {
      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id, password_hash')
        .eq('email', cleanEmail)
        .single();

      const hashToSave = existingAdmin?.password_hash || await bcrypt.hash('admin@srivastralaya', 10);

      await supabase
        .from('admins')
        .upsert({
          email: cleanEmail,
          password_hash: hashToSave,
          role: 'admin',
          reset_token: resetToken,
          reset_expires: resetExpires,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
    } catch (dbErr) {
      console.warn('Supabase token save warning:', dbErr.message);
    }

    const baseUrl = originUrl || (req.headers.origin) || 'https://srivastralaya.vercel.app';
    const resetLink = `${baseUrl}/admin/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Sri Vastralaya" <srivastralaya6@gmail.com>`,
      to: cleanEmail,
      subject: '🔐 Reset Your Sri Vastralaya Admin Password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0e6e6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #701A23, #4A0E17); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; color: #D4AF37;">SRI VASTRALAYA</h1>
            <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; color: #ffffff; letter-spacing: 0.5px;">Admin Security Portal</p>
          </div>
          
          <div style="padding: 35px 30px; color: #333333; line-height: 1.6;">
            <h2 style="font-size: 20px; font-weight: 600; color: #701A23; margin-top: 0;">Password Reset Request</h2>
            <p style="font-size: 14px; color: #444444;">Hello Management Team,</p>
            <p style="font-size: 14px; color: #444444;">
              We received a request to reset the password for your Sri Vastralaya Admin account (<strong>${cleanEmail}</strong>).
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetLink}" style="background-color: #701A23; color: #ffffff; text-decoration: none; padding: 15px 34px; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(112, 26, 35, 0.35);">
                Click Here to Reset Password
              </a>
            </div>

            <p style="font-size: 13px; color: #666666;">Or copy and paste this link into your browser:</p>
            <p style="background: #fdf6f7; padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #701A23; border: 1px dashed #e8b4b8; font-family: monospace;">
              ${resetLink}
            </p>
            
            <div style="margin-top: 30px; padding: 16px; background: #fff8e1; border-left: 4px solid #D4AF37; border-radius: 6px; font-size: 13px; color: #7a6000;">
              ⚠️ <strong>Security Notice:</strong> This reset link will expire in <strong>1 hour</strong>.
            </div>
          </div>
          
          <div style="background-color: #fcf8f8; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #f0e6e6;">
            <p style="margin: 0; font-weight: 600; color: #555555;">Sri Vastralaya — Traditional & Modern Fashion</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: `Password reset link has been successfully sent to ${cleanEmail}! Please check your Gmail inbox.`
    });
  } catch (error) {
    console.error('Vercel forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset email: ' + error.message
    });
  }
}
