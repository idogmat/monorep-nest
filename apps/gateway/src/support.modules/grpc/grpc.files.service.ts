import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable, } from 'rxjs';
import { FileChunk, LoadOnS3Request, LoadOnS3Response, ProfileFileChunk } from '../../../../libs/proto/generated/files';


interface FilesGrpcClient {
  Upload(s: Observable<FileChunk>): any;
  LoadOnS3(s: LoadOnS3Request): Observable<LoadOnS3Response>;
  UploadProfile(s: Observable<ProfileFileChunk>): any;
}

@Injectable()
export class FilesClientService implements OnModuleInit {
  private filesService: FilesGrpcClient;
  // private likeService: LikeService;

  constructor(
    @Inject('FILES_SERVICE') private readonly client: ClientGrpc
  ) { }
  onModuleInit() {
    this.filesService = this.client.getService<FilesGrpcClient>('FileService');
  }


  async loadOnS3(userId: string, postId: string) {
    return lastValueFrom(this.filesService.LoadOnS3({ userId, postId }));
  }
}