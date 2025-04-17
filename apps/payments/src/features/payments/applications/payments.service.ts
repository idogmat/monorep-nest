import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { StripeAdapter } from "./stripe.adapter";
import { products } from "../helpers";
import { PaymentsRepository } from "../infrastructure/payments.repository";

@Injectable()
export class PaymentsService {
  constructor(
    @Inject("STRIPE_ADAPTER") private readonly stripeAdapter: StripeAdapter,
    private readonly paymentsRepository: PaymentsRepository
  ) {

  }

  async findCustomerByUserId(user) {
    const customer = await this.stripeAdapter.findCustomerByEmail(user.email)
    return customer
  }


  async findPaymentByUserId(
    userId
  ) {
    return await this.paymentsRepository.findPaymentByUserId(userId)
  }

  async findOrCreateCustomer(
    user,
  ) {
    let customer = await this.stripeAdapter.findCustomerByEmail(user.email)
    if (!customer) {
      customer = await this.stripeAdapter.createCustomer(user.email, user.name)
    }
    return customer
  }

  async updatePayment(
    subscriptionId,
    product,
  ) {
    await this.paymentsRepository.updatePaymentProduct({
      subscriptionId,
      subType: products[product].name,
      amount: products[product].amount
    })

    return this.stripeAdapter.updateSubscriptionToNewPrice(
      subscriptionId,
      products[product].price,
    )
  }

  async activateSubscribe(
    customer,
    product,
    userId
  ) {
    return this.stripeAdapter.createCheckoutSession(
      customer,
      products[product?.toString()].price,
      userId
    )
  }

  async deletePayment(
    userId,
    paymentId
  ) {
    const payment = await this.paymentsRepository.findPaymentById(paymentId)
    if (payment?.userId !== userId) throw new ForbiddenException()
    return this.stripeAdapter.deleteSubscription(
      payment.subscriptionId
    )
  }


  async listCustomerSubscriptions(customerId: string) {
    return this.stripeAdapter.listCustomerSubscriptions(customerId);
  }

}