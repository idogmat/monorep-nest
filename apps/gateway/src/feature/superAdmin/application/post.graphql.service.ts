import { Injectable } from '@nestjs/common';
import { PostMicroserviceService } from '../../posts/application/services/post.microservice.service';
import { PaginationSearchPostGqlTerm } from '../api/utils/pagination';

@Injectable()
export class PostGraphqlService {
  constructor(

    private postMicroserviceService: PostMicroserviceService,

  ) { }
  async findPosts(query: PaginationSearchPostGqlTerm
  )
  {

    try {
      return await this.postMicroserviceService.getPostsGQL(query);

    } catch (e) {

      console.log(e, 'fail')
      return { posts: [], totalCount: 0 };
    }

  }
}