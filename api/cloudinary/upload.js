import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'k1vemtdl',
  api_key: process.env.CLOUDINARY_API_KEY || '111466383194774',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'holv89f9bITRerfFL2ZFuaBiON4',
  secure: true
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

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
    const { image, folder = 'sri-vastralaya' } = req.body || {};
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

    return res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      width: uploadResponse.width,
      height: uploadResponse.height
    });
  } catch (error) {
    console.error('Cloudinary serverless upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary: ' + error.message,
      error: error.message
    });
  }
}
