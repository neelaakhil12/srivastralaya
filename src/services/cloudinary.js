/**
 * Cloudinary image uploader
 * Uploads a file (or base64 string) to Cloudinary via our backend API proxy with fallbacks
 */
const API_BASE_URLS = [
  '',
  'http://127.0.0.1:5000',
  'http://localhost:5000'
];

export async function uploadToCloudinary(fileOrBase64, folder = 'sri-vastralaya') {
  let base64Data = fileOrBase64;

  // If a File object is passed, convert to base64
  if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
    base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileOrBase64);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // 1. Try serverless backend API endpoint
  for (const base of API_BASE_URLS) {
    try {
      const url = `${base}/api/cloudinary/upload`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          folder: folder
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && base === '') {
        continue;
      }

      const data = await response.json();
      if (response.ok && data.success && data.url) {
        return data.url;
      }
    } catch (err) {
      console.warn('Backend proxy upload attempt note:', err.message);
    }
  }

  // 2. Direct Cloudinary upload fallback
  try {
    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', 'ml_default');
    formData.append('folder', folder);

    const directRes = await fetch('https://api.cloudinary.com/v1_1/k1vemtdl/image/upload', {
      method: 'POST',
      body: formData
    });

    if (directRes.ok) {
      const directData = await directRes.json();
      if (directData.secure_url) return directData.secure_url;
    }
  } catch (directErr) {
    console.warn('Direct upload fallback note:', directErr.message);
  }

  // 3. Resilient fallback: return base64 data URL so user can still save product/category
  if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
    return base64Data;
  }

  throw new Error('Failed to upload image. Please try again with a smaller image file.');
}
