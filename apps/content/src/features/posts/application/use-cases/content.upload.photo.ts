import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Post } from "apps/content/prisma/generated/content-client";
import { PostsPrismaRepository } from "../../infrastructure/prisma/posts.prisma.repository";
import { UploadedFileResponse } from "apps/files/src/features/files/application/s3.service";


export class UploadPhotoCommand {
  constructor(
    public userId: string,
    public postId: string,
    public data: UploadedFileResponse[]
  ) {
  }
}

@CommandHandler(UploadPhotoCommand)
export class UploadPhotoUseCase implements ICommandHandler<UploadPhotoCommand> {
  constructor(
    private postsPrismaRepository: PostsPrismaRepository

  ) {
  }

  async execute(command: UploadPhotoCommand): Promise<Post> {

    const newPost = await this.postsPrismaRepository.uploadPhotos(command.userId,
      command.postId, command.data);
    return newPost;
  }
}