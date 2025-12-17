import Stripe from 'stripe';
import { logger } from './lib/logger';

// Stripe configuration using environment variables
// Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in your environment

let stripeClient: Stripe | null = null;

/**
 * Get the Stripe client instance
 */
export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    logger.warn('Stripe not configured - STRIPE_SECRET_KEY not set');
    return null;
  }
  
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
    logger.info('Stripe client initialized');
  }
  
  return stripeClient;
}

/**
 * Get the Stripe publishable key for frontend use
 */
export function getStripePublishableKey(): string | null {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    logger.warn('Stripe publishable key not configured');
    return null;
  }
  
  return publishableKey;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(options: {
  customerEmail: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: options.customerEmail,
      line_items: options.lineItems,
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      metadata: options.metadata,
    });
    
    logger.info('Checkout session created', { sessionId: session.id });
    return session;
  } catch (error) {
    logger.error('Failed to create checkout session', error);
    throw error;
  }
}

/**
 * Create a payment intent for custom payment flow
 */
export async function createPaymentIntent(options: {
  amount: number; // in cents
  currency?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency || 'usd',
      receipt_email: options.customerEmail,
      metadata: options.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    logger.info('Payment intent created', { paymentIntentId: paymentIntent.id });
    return paymentIntent;
  } catch (error) {
    logger.error('Failed to create payment intent', error);
    throw error;
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    logger.error('Failed to retrieve payment intent', error, { paymentIntentId });
    return null;
  }
}

/**
 * Create a refund for a payment intent
 */
export async function createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Optional: partial refund in cents
    });
    
    logger.info('Refund created', { refundId: refund.id, paymentIntentId });
    return refund;
  } catch (error) {
    logger.error('Failed to create refund', error, { paymentIntentId });
    throw error;
  }
}

/**
 * Verify a Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    logger.error('Webhook signature verification failed', error);
    return null;
  }
}
