import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UploadPhotoResponse } from '../../../common/types/upload.photo.response';

export type PostMediaDocument = HydratedDocument<PostMedia>;
@Schema()
export class PostMedia {
  @Prop()
  postId: string;

  @Prop()
  userId: string;

  @Prop({default: Date.now})
  createdAt: Date;

  @Prop()
  key: string;

  @Prop()
  mimetype: string;

  @Prop()
  originalName: string;

  @Prop()
  location: string;

  @Prop()
  ETag: string;

  @Prop()
  bucket: string;


  static createNewPost(
    PostMediaModel: PostMediaModelType,
    data: createPostMediaType,
  ): PostMediaDocument{
    const newPost = new PostMediaModel({
      userId: data.userId,
      postId: data.postId,
      mimetype: data.mimetype,
      originalName: data.originalName,
      key: data.uploadData.key,
      location: data.uploadData.Location,
      ETag: data.uploadData.ETag,
      bucket: data.uploadData.Bucket,
    })

    return newPost;
  }
}

export type PostMediaModelStaticType = {
  createNewPost: (PostMediaModel: PostMediaModelType,
           data: createPostMediaType) => PostMediaDocument;
}

export type createPostMediaType = {
  userId: string,
  postId: string,
  mimetype: string,
  originalName: string,
  uploadData: UploadPhotoResponse
}
export const PostMediaSchema = SchemaFactory.createForClass(PostMedia);

PostMediaSchema.statics = {
  createNewPost: PostMedia.createNewPost
} as PostMediaModelStaticType;
export type PostMediaModelType = Model<PostMediaDocument> &
  PostMediaModelStaticType;