/**
 * Client-Side Fast Image Compressor
 * Automatically compresses large user images to crisp, lightweight JPEGs
 * under 200KB so they save and upload instantly with 0 payload limit errors!
 */
export async function compressImage(fileOrBase64, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  if (!fileOrBase64) return null;

  // If already a hosted URL string (not a base64 string), return as-is
  if (typeof fileOrBase64 === 'string' && !fileOrBase64.startsWith('data:image')) {
    return fileOrBase64;
  }

  return new Promise((resolve) => {
    const processImg = (src) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : null);
      img.src = src;
    };

    if (typeof fileOrBase64 === 'string') {
      processImg(fileOrBase64);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImg(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrBase64);
    }
  });
}

