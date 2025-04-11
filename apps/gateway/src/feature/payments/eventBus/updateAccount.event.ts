export class UpdateAccountEvent {
  constructor(public readonly userId: string, public readonly paymentAccount: boolean) { }
}