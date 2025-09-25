import { findDiffDate } from "./date.helper"
import { NotificationsRepository } from "../infrastrucrure/notifications.repository";

export const createRabbitMessageHandler = (
  notificationsRepository: NotificationsRepository,
  sendNotifies: (userId: string, result: any, type: string) => void
) => {
  return async (payment: any) => {
    // сохраняем уведомление
    await notificationsRepository.createNotificationBySubscribe(payment.userId, payment.expiresAt);

    // вычисляем разницу времени
    const result = findDiffDate(payment.expiresAt);

    // отправляем через сокет
    sendNotifies(payment.userId, result, 'new_subscribe');
  };
};