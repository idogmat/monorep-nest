import { Inject, Injectable } from "@nestjs/common";
import { StripeAdapter } from "./stripe.adapter";
import { UsersService } from "../../user-accounts/users/application/users.service";
import { products, productsName } from "../helpers";
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

  async webHook(
    buffer,
    signature
  ) {
    // const user = await this.usersService.findById(userId)
    const event = await this.stripeAdapter.webHook(buffer, signature)

    switch (event.type) {
      case 'customer.subscription.created':
        console.log(event.data.object)
        console.log(JSON.stringify(event.data.object), 'customer.subscription.created')
        try {
          const {
            id: subscriptionId,
            created,
            customer,
          } = event.data.object
          const planId = event.data.object.items?.data?.[0]?.plan?.id || ''
          const payment = {
            subscriptionId,
            createdAt: new Date(created * 1000).toISOString(),
            customerId: customer as string,
            subType: productsName[planId],
            amount: Object.values(products).find(p => p.price === planId)?.amount
          }
          await this.paymentsRepository.updatePayment(payment)
        } catch {

        }
        break;
      case 'checkout.session.completed':
        console.log(event.data.object)
        console.log(JSON.stringify(event.data.object), 'customer.subscription.completed')
        try {
          const {
            expires_at,
            client_reference_id: userId
          } = event.data.object
          const subscriptionId = (event.data.object as any).subscription
          const payment = {
            subscriptionId,
            expiresAt: new Date(expires_at * 1000).toISOString(),
            userId
          }
          console.log(event.data.object)
          await this.paymentsRepository.updatePaymentExpire(payment)
        } catch {

        }

        break;

      case 'customer.subscription.updated':
        //   try {
        //     const {

        //       id: subscriptionId,
        //       expires_at,
        //       created,
        //       client_reference_id: userId
        //     } = event.data.object
        //     const planId = (event.data.object as any)?.plan?.id
        //     const customerId = (event.data.object as any)?.customer
        //     const payment = {
        //       subscriptionId,
        //       customerId,
        //       subType: productsName[planId],
        //       expiresAt: new Date(Date.now() * 1000).toISOString(),
        //       userId
        //     }
        //     const paymentExpire = {
        //       subscriptionId,
        //       customerId,
        //       subType: productsName[planId],
        //       expiresAt: new Date(Date.now() * 1000).toISOString(),
        //       userId
        //     }
        console.log(event.data.object)
        console.log(JSON.stringify(event.data.object), 'customer.subscription.updated')
        // await this.paymentsRepository.updatePaymentExpire(payment)
        // } catch {

        // }

        break;
      case 'customer.subscription.deleted':
        try {
          const { id, customer, canceled_at } = event.data.object

          // const result = await this.stripeAdapter.deleteSubscription(id)
          await this.paymentsRepository.markPaymentAsDeleted({
            subscriptionId: id,
            customerId: customer as string,
            deletedAt: new Date(canceled_at * 1000).toISOString()
          })
          // console.log(result)
        } catch {

        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
  }

}