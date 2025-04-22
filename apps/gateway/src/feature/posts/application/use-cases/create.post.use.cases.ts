import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostMicroserviceService } from '../services/post.microservice.service';
import { PostCreateModel } from '../../api/model/input/post.create.model';
import { InterlayerNotice } from '../../../../../../libs/common/error-handling/interlayer.notice';

export class CreatePostCommand {
  constructor(
    public readonly userId: string,
    public readonly files: Express.Multer.File[],
    public readonly dto: PostCreateModel) {
  }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCases implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postMicroserviceService: PostMicroserviceService,
  ) {
  }

  async execute(command: CreatePostCommand): Promise<InterlayerNotice> {

    const { files, userId, dto } = command;

    return this.postMicroserviceService.createPost(dto, files, userId);

  }
}