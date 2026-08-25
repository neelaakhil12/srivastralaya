import crypto from 'crypto';

/**
 * Vercel Serverless Function: Verify Razorpay Payment Signature
 */
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET || 'gbrnL9PsaDpECuwqNGlX2u1F';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body || {};

    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing payment ID' });
    }

    // If order_id and signature are provided, verify SHA256 HMAC
    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isValid = generatedSignature === razorpay_signature;
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Razorpay payment signature'
        });
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Razorpay payment verification serverless error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying payment: ' + error.message
    });
  }
}
