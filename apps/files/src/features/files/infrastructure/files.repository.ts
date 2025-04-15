import { Injectable } from '@nestjs/common';
import {
  createPostMediaType,
  PostMedia, PostMediaDocument,
  PostMediaModelType,
} from '../domain/post.media.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FilesRepository{
  constructor(
    @InjectModel(PostMedia.name)
    private PostMediaModel: PostMediaModelType
  ) {}

  async createPostMedia(data: createPostMediaType): Promise<PostMediaDocument>{

      const newFile = await this.PostMediaModel.createNewPost( this.PostMediaModel, data);
      return newFile.save();
  }

 async deletePostMedia(postId: string) {
    await this.PostMediaModel.deleteOne({postId});
  }
}