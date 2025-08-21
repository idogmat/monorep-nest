import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type LocalPathDocument = HydratedDocument<LocalPath>;
@Schema()
export class LocalPath {
  @Prop()
  postId: string;

  @Prop()
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  entity: string;

  static createLocalPath(
    PostMediaModel: LocalPathModelType,
    data: CreateLocalPathType,
  ): LocalPathDocument {
    const newPost = new PostMediaModel({
      userId: data.userId,
      postId: data.postId,
      entity: data.entity
    })

    return newPost;
  }

}

export type LocalPathModelStaticType = {
  createLocalPath: (
    localPath: LocalPathModelType,
    data: CreateLocalPathType
  ) => LocalPathDocument;
}

export type CreateLocalPathType = {
  userId: string,
  postId: string,
  entity: string,
}
export const LocalPathSchema = SchemaFactory.createForClass(LocalPath);

LocalPathSchema.statics = {
  createLocalPath: LocalPath.createLocalPath
} as LocalPathModelStaticType;

export type LocalPathModelType = Model<LocalPathDocument> &
  LocalPathModelStaticType;