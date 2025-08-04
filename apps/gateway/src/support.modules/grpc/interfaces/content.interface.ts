import { Observable } from 'rxjs';
import { PhotoUploadStatus } from '../../../../../content/prisma/generated/content-client';
import { GetPostsQueryRequest, GetPostResponse } from '../../../../../libs/proto/generated/content';

export interface CommentService {
  CreateComment(data: CreateCommentRequest): Observable<CommentResponse>;
}

export interface PostService {
  CreatePost(data: CreatePostRequest): Observable<PostResponse>;
  GetPosts(data: GetPostsQueryRequest): Observable<GetPostResponse>;
}

// FIXME LENA можно импортировать из генерации прото
// export interface LikeService {
//   createPost(data: CreateLikeRequest): Observable<LikeResponse>;
// }
export interface CreateCommentRequest {
  postId: string;
  userId: string;
  message: string;
}

export interface CommentResponse {
  id: string;
  postId: string;
  message: string;
}
export interface CreatePostRequest {
  userId: string;
  description: string;
  photoUploadStatus: PhotoUploadStatus;
}

export interface PostResponse {
  id: string;
  description: string;
  userId: string;
  photoUploadStatus: PhotoUploadStatus;
}

export interface CreateLikeRequest {
  postId: string;
  userId: string;
}

export interface LikeResponse {
  id: string;
  postId: string;
}