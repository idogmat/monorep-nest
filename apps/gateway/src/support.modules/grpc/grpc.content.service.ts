import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CommentService,
  CreateCommentRequest,
  CreatePostRequest,
  // LikeService,
  PostService,
} from './interfaces/content.interface';
import { lastValueFrom } from 'rxjs';
import { GetPostRequest, GetPostsQueryRequest } from '../../../../libs/proto/generated/content';

@Injectable()
export class ContentClientService implements OnModuleInit {
  private commentService: CommentService;
  private postService: PostService;
  // private likeService: LikeService;

  constructor(
    @Inject('CONTENT_SERVICE') private readonly client: ClientGrpc
  ) { }
  onModuleInit() {
    this.commentService = this.client.getService<CommentService>('CommentService');
    this.postService = this.client.getService<PostService>('PostService');
    // this.likeService = this.client.getService<LikeService>('LikeService');
  }

  async createComment(data: CreateCommentRequest) {
    return lastValueFrom(this.commentService.CreateComment(data));
  }

  async createPost(data: CreatePostRequest) {
    return lastValueFrom(this.postService.CreatePost(data));
  }

  async getPosts(data: GetPostsQueryRequest) {
    return lastValueFrom(this.postService.GetPosts(data));
  }

  async getPost(data: GetPostRequest) {
    return lastValueFrom(this.postService.GetPost(data));
  }
}