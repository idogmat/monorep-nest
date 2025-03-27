import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UploadPhotoResponse } from '../../../common/types/upload.photo.response';

export type PostMediaDocument = HydratedDocument<PostMedia >;
@Schema()
export class PostMedia {
  @Prop()
  postId: string;

  @Prop()
  userId: string;

  @Prop({default: Date.now})
  createdAt: Date;

  @Prop()
  originalKey: string;

  @Prop()
  compressedKey: string;

  @Prop()
  mimetype: string;

  @Prop()
  originalName: string;

  @Prop()
  originalFileId: string;

  @Prop()
  compressedFileId: string;

  static create(
    PostMediaModel: PostMediaModelType,
    data: createPostMediaType,
  ): Partial<PostMedia>{
    return new PostMediaModel({
      userId: data.userId,
      postId: data.postId,
      mimetype: data.mimetype,
      originalName: data.originalName,
      originalKey: data.uploadData.originalKey,
      compressedKey: data.uploadData.compressedKey,
      originalFileId: data.uploadData.originalFileId,
      compressedFileId: data.uploadData.compressedFileId,
    })
  }
}

export type PostMediaModelStaticType = {
  create: () => PostMediaDocument;
}

export type createPostMediaType = {
  userId: string,
  postId: string,
  mimetype: string,
  originalName: string,
  uploadData: UploadPhotoResponse
}
export const PostMediaSchema = SchemaFactory.createForClass(PostMedia );
export type PostMediaModelType = Model<PostMediaDocument>&PostMediaModelStaticType;