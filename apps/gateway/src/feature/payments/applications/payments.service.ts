import { Inject, Injectable } from "@nestjs/common";
import { StripeAdapter } from "./stripe.adapter";
import { UsersService } from "../../user-accounts/users/application/users.service";
import { products } from "../helpers";
import { PaymentsRepository } from "../infrastructure/payments.repository";

@Injectable()
export class PaymentsService {
  constructor(
    @Inject("STRIPE_ADAPTER") private readonly stripeAdapter: StripeAdapter,
    private readonly usersService: UsersService,
    private readonly paymentsRepository: PaymentsRepository
  ) {

  }

  async findCustomerByUserId(userId) {
    const user = await this.usersService.findById(userId)
    const customer = await this.stripeAdapter.findCustomerByEmail(user.email)
    return customer
  }

  async findOrCreateCustomer(
    userId,
  ) {
    const user = await this.usersService.findById(userId)
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
    console.log(products[product], subscriptionId)
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

  async createPayment(
    customer,
    product,
    userId
  ) {
    return this.stripeAdapter.createCheckoutSession(
      customer,
      products[product].price,
      userId
    )
  }

  async deletePayment(
    paymentId
  ) {

    const payment = await this.paymentsRepository.findPaymentById(paymentId)
    await this.paymentsRepository.markPaymentAsDeleted(
      {
        customerId: payment.customerId,
        deletedAt: new Date().toISOString(),
        subscriptionId: payment.subscriptionId
      })
    return this.stripeAdapter.deleteSubscription(
      payment.subscriptionId
    )
  }


  async listCustomerSubscriptions(customerId: string) {
    return this.stripeAdapter.listCustomerSubscriptions(customerId);
  }

}