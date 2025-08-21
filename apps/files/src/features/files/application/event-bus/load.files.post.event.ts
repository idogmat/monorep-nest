import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LocalPathRepository } from '../../infrastructure/localPath.repository';
import { CreatePhotoForPostCommand } from '../use-cases/create.photo.for.post.use-case';
export class LoadFilesEvent {
  constructor(
    public userId: string,
    public postId: string,
  ) { }
}
@EventsHandler(LoadFilesEvent)
export class LoadFilesHandler implements IEventHandler<LoadFilesEvent> {
  constructor(
    private readonly localPathRepository: LocalPathRepository,
    private readonly commandBus: CommandBus,
  ) { }

  async handle(event: LoadFilesEvent) {
    // paths.forEach(e => this.localPathRepository.deleteLocalPathById(e.id))
    await this.commandBus.execute(
      new CreatePhotoForPostCommand(event.userId, event.postId)
    );
    // console.log('Async UserCreatedEvent handler started');
    // console.log(`Sending welcome email to: ${event.userId}`);
    // // Здесь может быть логика отправки email
    // await new Promise(resolve => setTimeout(resolve, 3000));
    // console.log('Email sent successfully');
  }
}