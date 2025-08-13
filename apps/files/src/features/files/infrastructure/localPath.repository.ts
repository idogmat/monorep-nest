import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocalPathType, LocalPath, LocalPathDocument, LocalPathModelType } from '../domain/local.path.entity';

@Injectable()
export class LocalPathRepository {
  constructor(
    @InjectModel(LocalPath.name)
    private localPathModel: LocalPathModelType
  ) { }

  async createLocalPath(data: CreateLocalPathType): Promise<LocalPathDocument> {

    const path = await this.localPathModel.createLocalPath(this.localPathModel, data);
    return path.save();
  }

  async getLocalPath(userId: string, postId: string): Promise<LocalPathDocument[]> {

    const paths = await this.localPathModel.find({ postId });
    return paths
  }

  async deleteLocalPath(postId: string, userId: string) {
    await this.localPathModel.deleteOne({
      postId,
      userId
    });
  }
  async deleteLocalPathById(_id: string) {
    await this.localPathModel.findByIdAndDelete({
      _id
    });
  }
}