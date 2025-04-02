import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostMedia, PostMediaDocument, PostMediaModelType } from '../domain/post.media.entity';
import { Model } from 'mongoose';
import { LocationViewModel } from '../api/model/output/location.view.model';

@Injectable()
export class FilesQueryRepository{
  constructor(
    @InjectModel(PostMedia.name)
    private PostMediaModel: Model<PostMediaDocument>
  ) {}

  async getLocationByPostId(postId: string): Promise<LocationViewModel>{

    const locations = await this.PostMediaModel.find({ postId }).exec();

    return  {postId, photoUrls: locations.map((item) => item.location)};
  }
}