import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UploadPhotoResponse } from '../../../common/types/upload.photo.response';

export type FileDocument = HydratedDocument<File>;
@Schema()
export class File {
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
    FileModel: FileModelType,
    data: createFileType,
  ): Partial<File>{
    return new FileModel({
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

export type FileModelStaticType = {
  create: () => FileDocument;
}

export type createFileType = {
  userId: string,
  postId: string,
  mimetype: string,
  originalName: string,
  uploadData: UploadPhotoResponse
}
export const FilesSchema = SchemaFactory.createForClass(File);
export type FileModelType = Model<FileDocument>&FileModelStaticType;