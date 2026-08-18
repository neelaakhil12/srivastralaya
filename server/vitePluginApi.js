import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

// Load .env
dotenv.config();

// Initialize Supabase & Cloudinary
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mzrmhgllaglvwsmrbhbv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'k1vemtdl',
  api_key: process.env.CLOUDINARY_API_KEY || '111466383194774',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'holv89f9bITRerfFL2ZFuaBiON4',
  secure: true
});

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

const STORE_DIR = path.resolve(process.cwd(), 'server', 'data');
const STORE_PATH = path.join(STORE_DIR, 'admin-store.json');

if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

const DEFAULT_ADMIN_EMAIL = (process.env.SMTP_USER || 'srivastralaya6@gmail.com').toLowerCase();
const DEFAULT_PASSWORD = 'admin@srivastralaya';

function getLocalStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('Store read error:', e);
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
  } catch (e) {
    console.error('Store write error:', e);
  }
}

// Ensure store exists
getLocalStore();

// Helper to read JSON request body from incoming stream
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, obj) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.end(JSON.stringify(obj));
}

/**
 * Vite plugin that serves backend API routes directly inside Vite's dev server!
 */
export function viteApiPlugin() {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Handle preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
          return res.end();
        }

        // 1. Health check
        if (url === '/api/health') {
          return sendJson(res, 200, {
            status: 'ok',
            message: 'Sri Vastralaya Vite Embedded API Server is running smoothly',
            timestamp: new Date().toISOString()
          });
        }

        // 2. Cloudinary upload
        if (url === '/api/cloudinary/upload' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { image, folder = 'sri-vastralaya' } = body;
            if (!image) {
              return sendJson(res, 400, { success: false, message: 'Image data is required' });
            }

            const uploadResponse = await cloudinary.uploader.upload(image, {
              folder: folder,
              resource_type: 'auto',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }]
            });

            return sendJson(res, 200, {
              success: true,
              url: uploadResponse.secure_url,
              public_id: uploadResponse.public_id,
              format: uploadResponse.format
            });
          } catch (err) {
            console.error('Cloudinary upload error:', err);
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // 3. Admin login
        if (url === '/api/admin/login' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { email, password } = body;
            if (!email || !password) {
              return sendJson(res, 400, { success: false, message: 'Email and password required' });
            }

            const cleanEmail = email.trim().toLowerCase();
            let adminRecord = null;

            // Try Supabase first
            try {
              const { data: admin } = await supabase.from('admins').select('*').eq('email', cleanEmail).single();
              if (admin) adminRecord = admin;
            } catch {}

            // Fallback to local store
            if (!adminRecord) {
              const store = getLocalStore();
              if (store.admins && store.admins[cleanEmail]) {
                adminRecord = store.admins[cleanEmail];
              } else if (cleanEmail === DEFAULT_ADMIN_EMAIL) {
                const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
                store.admins[cleanEmail] = { email: cleanEmail, password_hash: hash, role: 'admin' };
                saveLocalStore(store);
                adminRecord = store.admins[cleanEmail];
              }
            }

            if (!adminRecord) {
              return sendJson(res, 401, { success: false, message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, adminRecord.password_hash);
            if (!isMatch) {
              return sendJson(res, 401, { success: false, message: 'Invalid email or password' });
            }

            return sendJson(res, 200, {
              success: true,
              message: 'Login successful',
              admin: { email: adminRecord.email, role: adminRecord.role || 'admin' }
            });
          } catch (err) {
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // 4. Forgot password (SMTP Email)
        if (url === '/api/admin/forgot-password' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { email, originUrl } = body;
            if (!email) {
              return sendJson(res, 400, { success: false, message: 'Email is required' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const store = getLocalStore();

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

            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

            store.admins[cleanEmail].reset_token = resetToken;
            store.admins[cleanEmail].reset_expires = resetExpires;
            saveLocalStore(store);

            // Also sync to Supabase if table exists
            try {
              await supabase.from('admins').upsert({
                email: cleanEmail,
                password_hash: store.admins[cleanEmail].password_hash,
                reset_token: resetToken,
                reset_expires: resetExpires,
                updated_at: new Date().toISOString()
              }, { onConflict: 'email' });
            } catch {}

            const baseUrl = originUrl || 'http://localhost:5173';
            const resetLink = `${baseUrl}/admin/reset-password?token=${resetToken}`;

            // Send via Nodemailer SMTP
            const mailOptions = {
              from: process.env.SMTP_FROM || `"Sri Vastralaya" <${process.env.SMTP_USER}>`,
              to: cleanEmail,
              subject: '🔐 Reset Your Sri Vastralaya Admin Password',
              html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0e6e6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
                  <div style="background: linear-gradient(135deg, #701A23, #4A0E17); padding: 32px 24px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; color: #D4AF37;">SRI VASTRALAYA</h1>
                    <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; color: #ffffff;">Admin Security Portal</p>
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

            return sendJson(res, 200, {
              success: true,
              message: `Password reset link sent successfully to ${cleanEmail}`
            });
          } catch (err) {
            console.error('Forgot password error:', err);
            return sendJson(res, 500, { success: false, message: 'Failed to send reset email via SMTP: ' + err.message });
          }
        }

        // 5. Reset password
        if (url === '/api/admin/reset-password' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { token, newPassword } = body;
            if (!token || !newPassword) {
              return sendJson(res, 400, { success: false, message: 'Token and new password required' });
            }

            if (newPassword.length < 6) {
              return sendJson(res, 400, { success: false, message: 'Password must be at least 6 characters' });
            }

            const store = getLocalStore();
            let targetAdminEmail = null;

            for (const [adminEmail, adminData] of Object.entries(store.admins || {})) {
              if (adminData.reset_token === token) {
                if (adminData.reset_expires && new Date(adminData.reset_expires) < new Date()) {
                  return sendJson(res, 400, { success: false, message: 'Password reset link has expired' });
                }
                targetAdminEmail = adminEmail;
                break;
              }
            }

            // Also check Supabase
            if (!targetAdminEmail) {
              try {
                const { data: admin } = await supabase.from('admins').select('*').eq('reset_token', token).single();
                if (admin) targetAdminEmail = admin.email;
              } catch {}
            }

            if (!targetAdminEmail) {
              return sendJson(res, 400, { success: false, message: 'Invalid or already used password reset link' });
            }

            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            if (store.admins[targetAdminEmail]) {
              store.admins[targetAdminEmail].password_hash = newPasswordHash;
              store.admins[targetAdminEmail].reset_token = null;
              store.admins[targetAdminEmail].reset_expires = null;
              saveLocalStore(store);
            }

            try {
              await supabase.from('admins').update({
                password_hash: newPasswordHash,
                reset_token: null,
                reset_expires: null,
                updated_at: new Date().toISOString()
              }).eq('email', targetAdminEmail);
            } catch {}

            return sendJson(res, 200, {
              success: true,
              message: 'Your password has been successfully updated! You can now log in with your new password.'
            });
          } catch (err) {
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // 6. Test SMTP
        if (url === '/api/admin/test-smtp' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { targetEmail } = body;
            const recipient = targetEmail || process.env.SMTP_USER || 'srivastralaya6@gmail.com';

            const info = await transporter.sendMail({
              from: process.env.SMTP_FROM || `"Sri Vastralaya" <${process.env.SMTP_USER}>`,
              to: recipient,
              subject: '✅ Sri Vastralaya SMTP Integration Test',
              html: `<h3>SMTP is active and working!</h3><p>Time: ${new Date().toLocaleString()}</p>`
            });

            return sendJson(res, 200, { success: true, message: `Test email sent to ${recipient}`, messageId: info.messageId });
          } catch (err) {
            return sendJson(res, 500, { success: false, message: 'SMTP Test failed: ' + err.message });
          }
        }

        next();
      });
    }
  };
}
