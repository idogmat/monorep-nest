import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPrismaRepository } from '../../infrastructure/prisma/posts.prisma.repository';
import { FileMetadata } from '../../api/model/interfaces/files-uploaded-event.interface';

export class UpdatePostStatusOnFileUploadCommand{
  constructor(public postId: string,
              public files: FileMetadata[]) {
  }

}

@CommandHandler(UpdatePostStatusOnFileUploadCommand)
export class UpdatePostStatusOnFileUploadUseCases implements ICommandHandler<UpdatePostStatusOnFileUploadCommand>{
  constructor(
    private readonly postsPrismaRepository: PostsPrismaRepository,

  ) {
  }

  async execute(command: UpdatePostStatusOnFileUploadCommand ){
    const status = command.files.length > 0 ? 'COMPLETED' : 'FAILED';
    await this.postsPrismaRepository.updateStatusForPost(command.postId, status);
    await this.postsPrismaRepository.createUrlForPost(command.postId, command.files);

  }
}