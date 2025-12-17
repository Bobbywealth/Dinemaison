import { getStripeClient } from './stripeClient';
import { storage } from './storage';
import { logger } from './lib/logger';
import type { Booking, ChefProfile } from '@shared/schema';
import Stripe from 'stripe';

export class StripeService {
  private getStripe(): Stripe {
    const stripe = getStripeClient();
    if (!stripe) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
    }
    return stripe;
  }

  async createCustomer(email: string, userId: string, name?: string) {
    const stripe = this.getStripe();
    return await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });
  }

  async createPaymentIntent(
    amount: number,
    customerId: string,
    bookingId: string,
    chefId: string,
    description: string
  ) {
    const stripe = this.getStripe();
    
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: customerId,
      description,
      metadata: {
        bookingId,
        chefId,
        type: 'booking_payment',
      },
      capture_method: 'automatic',
    });
  }

  async createBookingCheckoutSession(
    customerId: string,
    booking: Booking,
    chef: ChefProfile,
    successUrl: string,
    cancelUrl: string
  ) {
    const stripe = this.getStripe();
    
    const total = parseFloat(booking.total);
    
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(total * 100),
            product_data: {
              name: `Private Dining Experience with ${chef.displayName}`,
              description: `${booking.guestCount} guests on ${new Date(booking.eventDate).toLocaleDateString()}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        chefId: chef.id,
        type: 'booking_payment',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ) {
    const stripe = this.getStripe();
    
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }
    
    return await stripe.refunds.create(refundParams);
  }

  async createConnectedAccount(
    email: string,
    chefId: string,
    firstName: string,
    lastName: string
  ) {
    const stripe = this.getStripe();
    
    return await stripe.accounts.create({
      type: 'express',
      email,
      metadata: { chefId },
      business_type: 'individual',
      individual: {
        first_name: firstName,
        last_name: lastName,
        email,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
  }

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
    const stripe = this.getStripe();
    
    return await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  async getAccountStatus(accountId: string) {
    const stripe = this.getStripe();
    return await stripe.accounts.retrieve(accountId);
  }

  async createTransfer(
    amount: number,
    destinationAccountId: string,
    bookingId: string,
    description: string
  ) {
    const stripe = this.getStripe();
    
    return await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: destinationAccountId,
      metadata: {
        bookingId,
        type: 'chef_payout',
      },
      description,
    });
  }

  async calculateChefPayout(booking: Booking, chef: ChefProfile): Promise<number> {
    const total = parseFloat(booking.total);
    const serviceFee = parseFloat(booking.serviceFee || '0');
    const subtotal = total - serviceFee;
    
    const commissionRate = parseFloat(chef.commissionRate || '15') / 100;
    const platformCommission = subtotal * commissionRate;
    
    return subtotal - platformCommission;
  }
}

export const stripeService = new StripeService();
