import { Router } from 'express';
import { createSubscriptionOrder, handleWebhook, verifyPaymentAndCreateSubscription } from '@/controllers/billingController';

const router = Router();

router.post('/order', createSubscriptionOrder);
router.post('/verify', verifyPaymentAndCreateSubscription);
router.post('/webhook', handleWebhook);

export default router;


