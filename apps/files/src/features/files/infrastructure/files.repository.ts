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

    const fileData = PostMedia.create(this.PostMediaModel, data);
    const newFile = await this.PostMediaModel.create(fileData);
    return newFile.save();
  }
}