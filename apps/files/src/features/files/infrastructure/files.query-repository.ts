import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostMedia, PostMediaDocument, PostMediaModelType } from '../domain/post.media.entity';
import { Model } from 'mongoose';
import { LocationViewModel, PostMediaViewModel } from '../api/model/output/location.view.model';

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

  async getPostsMedia(userId: string): Promise<PostMediaViewModel[]> {

    const filter = !userId?{}: {userId};

    const postsMedia = await this.PostMediaModel.find(filter).exec();

    const grouped = postsMedia.reduce((acc, postMedia) => {
      if(!acc[postMedia.postId]){
        acc[postMedia.postId] = {postId: postMedia.postId, userId: postMedia.userId, photoUrls: []}
      }
      acc[postMedia.postId].photoUrls.push(postMedia.location);
      return acc;
    }, {} as PostMediaViewModel[])

    return grouped;

  }
}