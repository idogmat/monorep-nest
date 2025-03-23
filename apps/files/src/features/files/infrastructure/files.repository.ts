import { Injectable } from '@nestjs/common';
import { createFileType, File, FileDocument, FileModelType } from '../domain/file.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UploadPhotoResponse } from '../../../common/types/upload.photo.response';

@Injectable()
export class FilesRepository{
  constructor(
    @InjectModel(File.name)
    private FileModel: FileModelType
  ) {}

  async createFile(data: createFileType): Promise<FileDocument>{

    const fileData = File.create(this.FileModel, data);
    const newFile = await this.FileModel.create(fileData);
    return newFile.save();
  }
}