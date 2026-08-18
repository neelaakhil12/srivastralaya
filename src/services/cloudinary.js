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

  let lastError = null;

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
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload image to Cloudinary');
      }

      return data.url;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to upload image to Cloudinary');
}
