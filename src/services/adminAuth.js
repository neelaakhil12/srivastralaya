const ADMIN_STORAGE_KEY = 'sri_vastralaya_admin_session';

const API_BASE_URLS = [
  '',
  'http://127.0.0.1:5000',
  'http://localhost:5000'
];

async function fetchWithFallback(endpoint, options = {}) {
  let lastError = null;

  for (const base of API_BASE_URLS) {
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';
      
      // If we got an HTML response from dev server fallback, try next URL
      if (!contentType.includes('application/json') && base === '') {
        continue;
      }
      
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to connect to backend server');
}

export function getAdminSession() {
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(adminData) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export async function loginAdmin(email, password) {
  const { ok, data } = await fetchWithFallback('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }

  saveAdminSession(data.admin);
  return data.admin;
}

export async function sendForgotPasswordEmail(email) {
  const originUrl = window.location.origin;
  const { ok, data } = await fetchWithFallback('/api/admin/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, originUrl })
  });

  if (!ok || !data.success) {
    throw new Error(data.message || 'Failed to send reset link');
  }
  return data;
}

export async function resetAdminPassword(token, newPassword) {
  const { ok, data } = await fetchWithFallback('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });

  if (!ok || !data.success) {
    throw new Error(data.message || 'Failed to reset password');
  }
  return data;
}

export async function testSmtp(targetEmail) {
  const { ok, data } = await fetchWithFallback('/api/admin/test-smtp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEmail })
  });

  if (!ok || !data.success) {
    throw new Error(data.message || 'SMTP test failed');
  }
  return data;
}
