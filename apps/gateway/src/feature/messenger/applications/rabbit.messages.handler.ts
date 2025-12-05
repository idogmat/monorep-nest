export const rabbitMessageHandler = async (message: any) => {
  // Реализуйте вашу бизнес-логику здесь
  console.log(message, 'messageFile')
  switch (message.type) {
    case 'UPLOAD_CHAT_FILE':
      // console.log(message, 'UPLOAD_CHAT_FILE')
      // const chat = await this.commandBus.execute(new GetChatByParticipantsCommand(message.senderId, message.userId))
      // console.log(chat, 'chat')
      // const messageFile = await this.commandBus.execute(new CreateMessageWithFileCommand(
      //   chat.id, message.senderId, message.data
      // ));
      // const notifyUser = await this.commandBus.execute(new SendChatNotifyCommand(
      //   chat
      // ));
      console.log(message, 'messageFile')

      break;
    default:
      break;
  }
}