import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// 1. SUPABASE CLIENT
// -------------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------------------------------------------------
// 2. CLOUDINARY CONFIGURATION
// -------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'k1vemtdl',
  api_key: process.env.CLOUDINARY_API_KEY || '111466383194774',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'holv89f9bITRerfFL2ZFuaBiON4',
  secure: true
});

// -------------------------------------------------------------
// 3. NODEMAILER / SMTP CONFIGURATION
// -------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'srivastralaya6@gmail.com',
    pass: (process.env.SMTP_PASSWORD || 'lqiogflceipicdsm').replace(/\s+/g, '') // remove spaces
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection on startup
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️ SMTP Connection Warning:', error.message);
  } else {
    console.log('✅ SMTP Mailer is ready to send emails via:', process.env.SMTP_USER || 'srivastralaya6@gmail.com');
  }
});

// -------------------------------------------------------------
// 4. PERSISTENT LOCAL STORE (Resilient Fallback & Sync Engine)
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'admin-store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_ADMIN_EMAIL = (process.env.SMTP_USER || 'srivastralaya6@gmail.com').toLowerCase();
const DEFAULT_PASSWORD = 'admin@srivastralaya';

function getLocalStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch (err) {
    console.warn('Store read error:', err.message);
  }
  return {
    admins: {
      [DEFAULT_ADMIN_EMAIL]: {
        email: DEFAULT_ADMIN_EMAIL,
        password_hash: bcrypt.hashSync(DEFAULT_PASSWORD, 10),
        role: 'admin',
        reset_token: null,
        reset_expires: null
      }
    }
  };
}

function saveLocalStore(store) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Store write error:', err.message);
  }
}

// Initialize store if missing
getLocalStore();

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sri Vastralaya API Server is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Cloudinary Upload Endpoint
app.post('/api/cloudinary/upload', async (req, res) => {
  try {
    const { image, folder = 'sri-vastralaya' } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return res.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      width: uploadResponse.width,
      height: uploadResponse.height
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary',
      error: error.message
    });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let adminRecord = null;

    // 1. Try querying Supabase
    try {
      const { data: admin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .single();
      if (admin) adminRecord = admin;
    } catch {
      // Supabase table not created yet or connection error
    }

    // 2. Fallback to local store
    if (!adminRecord) {
      const store = getLocalStore();
      if (store.admins && store.admins[cleanEmail]) {
        adminRecord = store.admins[cleanEmail];
      } else if (cleanEmail === DEFAULT_ADMIN_EMAIL) {
        // Auto initialize default admin
        const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        store.admins[cleanEmail] = {
          email: cleanEmail,
          password_hash: hash,
          role: 'admin'
        };
        saveLocalStore(store);
        adminRecord = store.admins[cleanEmail];
      }
    }

    if (!adminRecord) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, adminRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      admin: {
        email: adminRecord.email,
        role: adminRecord.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Forgot Password - Send SMTP Email with Reset Link
app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { email, originUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const store = getLocalStore();

    // Ensure admin exists in local store / Supabase
    if (!store.admins[cleanEmail]) {
      const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      store.admins[cleanEmail] = {
        email: cleanEmail,
        password_hash: hash,
        role: 'admin',
        reset_token: null,
        reset_expires: null
      };
    }

    // Generate secure crypto token & 1 hour expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Save token in local store
    store.admins[cleanEmail].reset_token = resetToken;
    store.admins[cleanEmail].reset_expires = resetExpires;
    saveLocalStore(store);

    // Also attempt saving to Supabase if table exists
    try {
      await supabase
        .from('admins')
        .upsert({
          email: cleanEmail,
          password_hash: store.admins[cleanEmail].password_hash,
          reset_token: resetToken,
          reset_expires: resetExpires,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
    } catch {
      // Ignore Supabase table not created yet
    }

    // Base URL for reset link
    const baseUrl = originUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${baseUrl}/admin/reset-password?token=${resetToken}`;

    // Send Email via Nodemailer SMTP
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Sri Vastralaya" <${process.env.SMTP_USER}>`,
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
              ⚠️ <strong>Security Notice:</strong> This reset link will expire in <strong>1 hour</strong>. When you create a new password, your previous password will immediately stop working.
            </div>
          </div>
          
          <div style="background-color: #fcf8f8; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #f0e6e6;">
            <p style="margin: 0; font-weight: 600; color: #555555;">Sri Vastralaya — Traditional & Modern Fashion</p>
            <p style="margin: 4px 0 0 0;">Secured with Nodemailer SMTP & Supabase</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: `Password reset link sent successfully to ${cleanEmail}`
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send reset email via SMTP',
      error: error.message
    });
  }
});

// Reset Password - Verify Token & Update to New Password
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const store = getLocalStore();
    let targetAdminEmail = null;

    // 1. Search local store for token
    for (const [adminEmail, adminData] of Object.entries(store.admins || {})) {
      if (adminData.reset_token === token) {
        // Check expiry
        if (adminData.reset_expires && new Date(adminData.reset_expires) < new Date()) {
          return res.status(400).json({ success: false, message: 'Password reset link has expired. Please request a new one.' });
        }
        targetAdminEmail = adminEmail;
        break;
      }
    }

    // 2. If not found in store, check Supabase
    if (!targetAdminEmail) {
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
          targetAdminEmail = admin.email;
        }
      } catch {
        // Ignore error
      }
    }

    if (!targetAdminEmail) {
      return res.status(400).json({ success: false, message: 'Invalid or already used password reset link. Please request a new link.' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update in local store: save new hash and invalidate reset token
    if (store.admins[targetAdminEmail]) {
      store.admins[targetAdminEmail].password_hash = newPasswordHash;
      store.admins[targetAdminEmail].reset_token = null;
      store.admins[targetAdminEmail].reset_expires = null;
      saveLocalStore(store);
    }

    // Also update in Supabase
    try {
      await supabase
        .from('admins')
        .update({
          password_hash: newPasswordHash,
          reset_token: null,
          reset_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('email', targetAdminEmail);
    } catch {
      // Ignore Supabase error if table not present
    }

    return res.json({
      success: true,
      message: 'Your password has been successfully updated! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Test SMTP connection and dispatch test mail
app.post('/api/admin/test-smtp', async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || process.env.SMTP_USER || 'srivastralaya6@gmail.com';

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Sri Vastralaya" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: '✅ Sri Vastralaya SMTP Integration Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #701A23; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #701A23;">SMTP Connected Successfully!</h2>
          <p>This is a verification email dispatched by your Sri Vastralaya admin server.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Mailer:</strong> ${process.env.SMTP_USER}</p>
        </div>
      `
    });

    return res.json({
      success: true,
      message: `Test email sent to ${recipient}`,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('SMTP Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'SMTP Test failed',
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Sri Vastralaya API Server running on port ${PORT}`);
});
