import { Injectable } from '@nestjs/common';
import { PostMicroserviceService } from './post.microservice.service';
import { PaginationSearchPostGqlTerm } from '../../../superAdmin/api/utils/pagination';

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