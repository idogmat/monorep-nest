export interface UserAccounts {
  userId: string;
  paymentAccount: boolean
}
export class UpdateAccountEvent {
  constructor(public readonly users: UserAccounts[]) { }
}