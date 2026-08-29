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
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cm1oZ2xsYWdsdndzbXJiaGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDI5NjIsImV4cCI6MjEwMjUxODk2Mn0.Si8KYSTrXjiNUAT6iRH58akn42nGPil2q7Jb9puIcP0';
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Razorpay credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TVcO0xD4rxTPu1';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'aPYKAniQQEps0H3duhSfRX7t';

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

        // Razorpay create order
        if (url === '/api/razorpay/create-order' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { amount, currency = 'INR', receipt, notes } = body;
            const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TVcO0xD4rxTPu1';
            const keySecret = process.env.RAZORPAY_KEY_SECRET || 'aPYKAniQQEps0H3duhSfRX7t';
            const amountInPaise = Math.round(Number(amount) * 100);
            const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

            const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                amount: amountInPaise,
                currency,
                receipt: receipt || `ORD-${Date.now()}`,
                notes: notes || {}
              })
            });

            const rzpData = await rzpRes.json();
            if (!rzpRes.ok || !rzpData.id) {
              return sendJson(res, rzpRes.status || 500, {
                success: false,
                message: rzpData.error?.description || 'Failed to create Razorpay order'
              });
            }

            return sendJson(res, 200, {
              success: true,
              orderId: rzpData.id,
              amount: rzpData.amount,
              currency: rzpData.currency,
              keyId: keyId
            });
          } catch (err) {
            console.error('Razorpay create-order error:', err);
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // Razorpay verify payment
        if (url === '/api/razorpay/verify-payment' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
            const keySecret = process.env.RAZORPAY_KEY_SECRET || 'aPYKAniQQEps0H3duhSfRX7t';

            if (razorpay_order_id && razorpay_signature) {
              const generatedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

              if (generatedSignature !== razorpay_signature) {
                return sendJson(res, 400, { success: false, message: 'Invalid payment signature' });
              }
            }

            return sendJson(res, 200, { success: true, verified: true, paymentId: razorpay_payment_id });
          } catch (err) {
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

        // ============================================================
        // USER AUTH ROUTES
        // ============================================================

        // 7. Send OTP (email)
        if (url === '/api/user/send-otp' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { name, phone, email } = body;

            if (!name || !phone || !email) {
              return sendJson(res, 400, { success: false, message: 'Name, phone and email are required' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              return sendJson(res, 400, { success: false, message: 'Please enter a valid email address' });
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

            // Store OTP in Supabase (upsert by email)
            try {
              await supabase.from('user_otps').delete().eq('email', email.toLowerCase());
              await supabase.from('user_otps').insert({
                email: email.toLowerCase(),
                otp,
                name,
                phone,
                expires_at: new Date(expiresAt).toISOString()
              });
            } catch (dbErr) {
              console.warn('Supabase OTP store warn:', dbErr.message);
              // Fallback: store in-memory
              if (!global._otpStore) global._otpStore = {};
              global._otpStore[email.toLowerCase()] = { otp, name, phone, expiresAt };
            }

            // Send OTP email
            const mailOptions = {
              from: process.env.SMTP_FROM || `"Sri Vastralaya" <${process.env.SMTP_USER}>`,
              to: email,
              subject: '🔐 Your Sri Vastralaya Login OTP',
              html: `
                <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #f0e6e6;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                  <div style="background:linear-gradient(135deg,#701A23,#4A0E17);padding:28px 24px;text-align:center;">
                    <h1 style="margin:0;font-size:26px;color:#D4AF37;letter-spacing:1px;">SRI VASTRALAYA</h1>
                    <p style="margin:6px 0 0;font-size:13px;color:#fff;opacity:0.85;">Your Trusted Fashion Destination</p>
                  </div>
                  <div style="padding:32px 28px;">
                    <p style="font-size:15px;color:#333;margin-top:0;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size:14px;color:#555;line-height:1.6;">Use the OTP below to securely sign in to your Sri Vastralaya account. This code is valid for <strong>5 minutes</strong>.</p>
                    <div style="text-align:center;margin:28px 0;">
                      <div style="display:inline-block;background:linear-gradient(135deg,#FAF0F1,#fff);border:2px dashed #701A23;border-radius:12px;padding:20px 40px;">
                        <p style="margin:0;font-size:13px;color:#701A23;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Your OTP</p>
                        <p style="margin:8px 0 0;font-size:42px;font-weight:900;color:#701A23;letter-spacing:10px;">${otp}</p>
                      </div>
                    </div>
                    <p style="font-size:13px;color:#888;text-align:center;">⚠️ Never share this OTP with anyone. Sri Vastralaya will never ask for your OTP.</p>
                  </div>
                  <div style="background:#fcf8f8;padding:16px;text-align:center;font-size:12px;color:#999;border-top:1px solid #f0e6e6;">
                    <p style="margin:0;font-weight:600;color:#555;">Sri Vastralaya — Traditional &amp; Modern Fashion</p>
                    <p style="margin:4px 0 0;">Hyderabad, Telangana | srivastralaya6@gmail.com</p>
                  </div>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);

            return sendJson(res, 200, { success: true, message: `OTP sent to ${email}` });
          } catch (err) {
            console.error('Send OTP error:', err);
            return sendJson(res, 500, { success: false, message: 'Failed to send OTP: ' + err.message });
          }
        }

        // 8. Verify OTP & login/register user
        if (url === '/api/user/verify-otp' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { email, otp } = body;

            if (!email || !otp) {
              return sendJson(res, 400, { success: false, message: 'Email and OTP are required' });
            }

            const cleanEmail = email.toLowerCase();
            let storedName = '';
            let storedPhone = '';
            let otpValid = false;

            // Check Supabase first
            try {
              const { data: otpRecord } = await supabase
                .from('user_otps')
                .select('*')
                .eq('email', cleanEmail)
                .single();

              if (otpRecord) {
                const expired = new Date(otpRecord.expires_at) < new Date();
                if (!expired && otpRecord.otp === otp) {
                  otpValid = true;
                  storedName = otpRecord.name;
                  storedPhone = otpRecord.phone;
                  // Delete used OTP
                  await supabase.from('user_otps').delete().eq('email', cleanEmail);
                }
              }
            } catch (dbErr) {
              // Fallback to in-memory
              const memOtp = global._otpStore && global._otpStore[cleanEmail];
              if (memOtp && memOtp.otp === otp && memOtp.expiresAt > Date.now()) {
                otpValid = true;
                storedName = memOtp.name;
                storedPhone = memOtp.phone;
                delete global._otpStore[cleanEmail];
              }
            }

            if (!otpValid) {
              return sendJson(res, 401, { success: false, message: 'Invalid or expired OTP. Please try again.' });
            }

            // Upsert user record
            let userRecord = null;
            try {
              const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', cleanEmail)
                .single();

              if (existingUser) {
                userRecord = existingUser;
                // Update name/phone if changed
                await supabase.from('users').update({ name: storedName, phone: storedPhone }).eq('email', cleanEmail);
                userRecord.name = storedName;
                userRecord.phone = storedPhone;
              } else {
                const { data: newUser } = await supabase.from('users').insert({
                  name: storedName,
                  phone: storedPhone,
                  email: cleanEmail
                }).select().single();
                userRecord = newUser;
              }
            } catch (dbErr) {
              console.warn('User upsert warn:', dbErr.message);
              userRecord = { id: `local-${Date.now()}`, name: storedName, phone: storedPhone, email: cleanEmail };
            }

            // Create a simple session token (base64 encoded JSON — no JWT dependency needed)
            const tokenPayload = { id: userRecord?.id, email: cleanEmail, name: storedName, phone: storedPhone, iat: Date.now() };
            const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

            return sendJson(res, 200, {
              success: true,
              message: 'Login successful',
              token,
              user: {
                id: userRecord?.id,
                name: storedName,
                phone: storedPhone,
                email: cleanEmail,
                avatar_url: userRecord?.avatar_url || null
              }
            });
          } catch (err) {
            console.error('Verify OTP error:', err);
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // 9. Get user orders (by email or phone)
        if (url.startsWith('/api/user/orders') && req.method === 'GET') {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const email = urlObj.searchParams.get('email') || '';
            const phone = urlObj.searchParams.get('phone') || '';

            if (!email && !phone) {
              return sendJson(res, 400, { success: false, message: 'Email or phone required' });
            }

            let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

            if (email && phone) {
              query = query.or(`customer_email.ilike.${email},customer_phone.eq.${phone}`);
            } else if (email) {
              query = query.ilike('customer_email', email);
            } else {
              query = query.eq('customer_phone', phone);
            }

            const { data, error } = await query;
            if (error) throw error;

            const orders = (data || []).map(item => ({
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

            return sendJson(res, 200, { success: true, orders });
          } catch (err) {
            console.error('User orders fetch error:', err);
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // ============================================================
        // RAZORPAY PAYMENT ROUTES
        // ============================================================

        // 10. Create Razorpay Order
        if (url === '/api/razorpay/create-order' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { amount, currency = 'INR', receipt, notes = {} } = body;

            if (!amount || amount <= 0) {
              return sendJson(res, 400, { success: false, message: 'Valid amount is required' });
            }

            // Call Razorpay Orders API
            const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
            const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
              },
              body: JSON.stringify({
                amount: Math.round(amount * 100), // paise
                currency,
                receipt: receipt || `rcpt_${Date.now()}`,
                notes
              })
            });

            const razorpayData = await razorpayRes.json();

            if (!razorpayRes.ok) {
              return sendJson(res, 400, { success: false, message: razorpayData.error?.description || 'Failed to create Razorpay order' });
            }

            return sendJson(res, 200, {
              success: true,
              orderId: razorpayData.id,
              amount: razorpayData.amount,
              currency: razorpayData.currency,
              keyId: RAZORPAY_KEY_ID
            });
          } catch (err) {
            console.error('Razorpay create-order error:', err);
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        // 11. Verify Razorpay Payment Signature
        if (url === '/api/razorpay/verify-payment' && req.method === 'POST') {
          try {
            const body = await parseBody(req);
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
              return sendJson(res, 400, { success: false, message: 'Missing payment verification fields' });
            }

            // Verify HMAC SHA256 signature
            const expectedSignature = crypto
              .createHmac('sha256', RAZORPAY_KEY_SECRET)
              .update(`${razorpay_order_id}|${razorpay_payment_id}`)
              .digest('hex');

            if (expectedSignature !== razorpay_signature) {
              return sendJson(res, 400, { success: false, message: 'Payment verification failed. Invalid signature.' });
            }

            // Save verified order to Supabase
            let savedOrder = null;
            if (orderData && supabase) {
              try {
                const payload = {
                  id: orderData.id || `ORD-${Date.now().toString().slice(-8)}`,
                  customer_name: orderData.customerName || 'Customer',
                  customer_phone: orderData.customerPhone || '',
                  customer_email: orderData.customerEmail || '',
                  customer_address: orderData.customerAddress || '',
                  items: orderData.items || [],
                  subtotal: Number(orderData.subtotal) || 0,
                  discount: Number(orderData.discount) || 0,
                  shipping: Number(orderData.shipping) || 0,
                  total: Number(orderData.total) || 0,
                  status: 'Processing',
                  payment_method: `Razorpay | ${razorpay_payment_id}`,
                  notes: `Razorpay Order: ${razorpay_order_id}`
                };
                const { data } = await supabase.from('orders').insert([payload]).select().single();
                savedOrder = data;
              } catch (dbErr) {
                console.warn('Order save warning:', dbErr.message);
              }
            }

            return sendJson(res, 200, {
              success: true,
              message: 'Payment verified successfully!',
              paymentId: razorpay_payment_id,
              orderId: savedOrder?.id || orderData?.id
            });
          } catch (err) {
            console.error('Razorpay verify-payment error:', err);
            return sendJson(res, 500, { success: false, message: err.message });
          }
        }

        next();
      });
    }
  };
}
