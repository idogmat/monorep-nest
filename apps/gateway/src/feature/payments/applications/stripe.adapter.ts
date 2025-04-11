import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export type subscribeType = 1 | 2 | 3

@Injectable()
export class StripeAdapter {
  private stripe: Stripe;
  private successUrl: string;
  private cancelUrl: string;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_API_KEY'), {
      apiVersion: '2025-03-31.basil',
    });
    this.successUrl = `${this.configService.get('BASE_URL')}/payments/success`;
    this.cancelUrl = `${this.configService.get('BASE_URL')}/payments/error`;
  }

  async findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    const customers = await this.stripe.customers.list({
      email,
      limit: 100000,
    });
    // console.log(customers.data)
    const exactMatch = customers.data.find((customer) => customer.email === email);
    return exactMatch || null;
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async createCheckoutSession(
    customer: Stripe.Customer,
    product,
    userId
  ): Promise<Stripe.Checkout.Session> {

    return this.stripe.checkout.sessions.create({
      customer: customer.id,
      // customer_email:
      line_items: [
        {
          price: product,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Обязательно для recurring
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
      client_reference_id: userId,

    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | undefined> {
    return this.stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>;
  }

  async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async listCustomerSubscriptions(customerId: string): Promise<Stripe.ApiList<Stripe.Subscription>> {
    return this.stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
    });
  }

  async updateSubscriptionToNewPrice(subscriptionId: string, product: string): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: 'create_prorations',
      items: [
        {
          id: subscription.items.data[0].id,
          price: product,
        },
      ],
    });
    return updatedSubscription;
  }

  async deleteSubscription(subscriptionId: string): Promise<Stripe.Subscription> {

    const cancelSubscription = await this.stripe.subscriptions.cancel(subscriptionId);
    return cancelSubscription;
  }

  async webHook(buffer: Buffer, signature: string): Promise<Stripe.Event> {
    const secret = this.configService.get('STRIPE_WEBHOOK_SECRET')
    const event = await this.stripe.webhooks.constructEvent(
      buffer,
      signature,
      secret
    );
    return event
  }
}