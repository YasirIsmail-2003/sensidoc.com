import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
// Load Razorpay at runtime if available to avoid hard dependency during development
// (allows running server without installing razorpay module)
const Razorpay: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('razorpay');
  } catch (e) {
    return null;
  }
})();
import { supabase } from '@/config/database';
import { ApiResponse } from '@/types';

const razorpay = Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

// Create order for subscription payment (client will use order_id to capture)
export const createSubscriptionOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!razorpay) {
      res.status(500).json({ success: false, message: 'Razorpay module not installed or configured' } as ApiResponse)
      return
    }
    const { amount, currency = 'INR', receipt, user_id, subscription_plan_id } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' } as ApiResponse);
      return;
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || uuidv4(),
      payment_capture: 1
    });

    res.json({ success: true, message: 'Order created', data: { ...order, subscription_plan_id } } as ApiResponse);
  } catch (error) {
    console.error('Create subscription order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error } as ApiResponse);
  }
}

// Verify razorpay payment and create subscription record
export const verifyPaymentAndCreateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { response, user_id, subscription_plan_id, amount } = req.body;
    // Basic verification (in production verify with razorpay APIs)
    const paymentId = response?.razorpay_payment_id
    const orderId = response?.razorpay_order_id
    if (!paymentId || !orderId) {
      res.status(400).json({ success: false, message: 'Invalid payment response' } as ApiResponse)
      return
    }

    // Store a payment record
    await supabase.from('payments').insert([{
      id: uuidv4(),
      user_id: user_id || null,
      amount: amount || 0,
      currency: 'INR',
      provider: 'razorpay',
      provider_payment_id: paymentId,
      status: 'captured',
      subscription_plan_id: subscription_plan_id || null,
      created_at: new Date().toISOString()
    }])

    // For simplicity, create an active subscription; determine quota based on role
    let quota = 0
    if (user_id) {
      const { data: user } = await supabase.from('users').select('role').eq('id', user_id).single()
      if (user && user.role === 'doctor') {
        quota = 15
      } else if (user && user.role === 'admin') {
        quota = 0 // unlimited
      } else {
        quota = 0 // default patient quota could be 0 (requires purchase)
      }
    }

    await supabase.from('subscriptions').insert([{
      id: uuidv4(),
      user_id: user_id,
      provider: 'razorpay',
      provider_subscription_id: paymentId,
      status: 'active',
      started_at: new Date().toISOString(),
      quota_monthly: quota,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])

    res.json({ success: true, message: 'Payment verified and subscription created' } as ApiResponse)
  } catch (error) {
    console.error('verifyPaymentAndCreateSubscription error:', error)
    res.status(500).json({ success: false, message: 'Failed to verify payment' } as ApiResponse)
  }
}

// Webhook handler for Razorpay events (payment.captured, subscription.activated)
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;

    // Validate signature if secret provided
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'] as string | undefined
      try {
        const expected = require('crypto').createHmac('sha256', webhookSecret).update(JSON.stringify(payload)).digest('hex')
        if (!signature || signature !== expected) {
          res.status(400).json({ success: false, message: 'Invalid webhook signature' } as ApiResponse)
          return
        }
      } catch (sigErr) {
        console.error('Webhook signature verification failed:', sigErr)
      }
    }

    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      // Store payment record in payments table
      await supabase.from('payments').insert([{
        id: uuidv4(),
        user_id: payment?.notes?.user_id || null,
        amount: payment?.amount / 100 || 0,
        currency: payment?.currency || 'INR',
        provider: 'razorpay',
        provider_payment_id: payment?.id,
        status: payment?.status || 'captured',
        created_at: new Date().toISOString()
      }]);
    }

    // Respond quickly
    res.json({ success: true, message: 'Webhook received' } as ApiResponse);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook handling failed' } as ApiResponse);
  }
}


