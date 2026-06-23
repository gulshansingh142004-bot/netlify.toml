const crypto = require('crypto');

exports.handler = async (event) => {
  try {
    const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];
    if (!signature) return { statusCode: 400, body: 'Missing signature' };

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(event.body)
      .digest('hex');

    if (signature !== expected) return { statusCode: 400, body: 'Invalid signature' };

    const payload = JSON.parse(event.body);
    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      console.log('✅ Payment captured:', payment.order_id, payment.id);
    }
    return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: 'Webhook handler failed' };
  }
};
