/* eslint-disable */
import { $Enums } from '../../../gateway/prisma/generated/client';
import PhotoUploadStatus = $Enums.PhotoUploadStatus;
import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';

export const protobufPackage = "content";

export interface CreatePostRequest {
  userId: string;
  description: string;
  photoUploadStatus: PhotoUploadStatus;
}

export interface PostResponse {
  id: string|null;
}

export interface PostServiceClient {
  createPost(request: CreatePostRequest, metadata?: Metadata): Observable<PostResponse>;
}

export interface PostServiceController {
  createPost(request: CreatePostRequest, metadata?: Metadata): Promise<PostResponse> |  Observable<PostResponse>;
}

export function PostServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createPost",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("PostService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("PostService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}
