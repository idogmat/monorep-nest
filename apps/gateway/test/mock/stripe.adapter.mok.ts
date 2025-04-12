import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeAdapterMock {
  async findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    return { id: 'mock_customer_id', email } as Stripe.Customer;
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return { id: 'mock_customer_id', email, name } as Stripe.Customer;
  }

  async createCheckoutSession(customer, product, userId) {
    return { id: 'mock_session_id' };
  }

  async getCustomer(customerId: string) {
    return { id: customerId };
  }

  async getSession(sessionId: string) {
    return { id: sessionId };
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    return { url: 'https://mock-portal-url' };
  }

  async listCustomerSubscriptions(customerId: string) {
    return { data: [] };
  }

  async updateSubscriptionToNewPrice(subscriptionId: string, product: string) {
    return { id: subscriptionId, updated: true };
  }

  async deleteSubscription(subscriptionId: string) {
    return { id: subscriptionId, canceled: true };
  }

  async webHook(buffer: Buffer, signature: string) {
    return {
      id: 'mock_event_id',
      type: 'checkout.session.completed',
      data: { object: {} },
    } as any;
  }
}