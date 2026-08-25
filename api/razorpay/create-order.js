/**
 * Vercel Serverless Function: Create Razorpay Order
 */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TTxuY6jG2BTZS5';
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
    const { amount, currency = 'INR', receipt, notes } = req.body || {};
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
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

    const data = await razorpayRes.json();

    if (!razorpayRes.ok || !data.id) {
      return res.status(razorpayRes.status || 500).json({
        success: false,
        message: data.error?.description || 'Failed to create Razorpay order',
        error: data.error
      });
    }

    return res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay create-order serverless error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating Razorpay order: ' + error.message
    });
  }
}
