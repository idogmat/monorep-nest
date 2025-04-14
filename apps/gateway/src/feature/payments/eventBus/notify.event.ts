export interface Notify {
  userId: string;
  expiresAt: string;
}
export class NotifySubscribeEvent {
  constructor(public readonly notify: Notify) { }
}