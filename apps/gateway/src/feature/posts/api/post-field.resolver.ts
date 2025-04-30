import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserLoader } from '../../user-accounts/devices/loaders/user.loader';
import { Post } from './model/input/post.schema';

@Resolver(() => Post)
export class PostFieldResolver {
  constructor(private readonly userLoader: UserLoader) {}

  @ResolveField(() => String, { name: 'userName', nullable: true })
  async resolveUserName(@Parent() post: Post): Promise<string | null> {
    const user = await this.userLoader.batchUsers.load(post.userId);
    console.log("this is user", post.userId);
    return user?.name ?? null;
  }
}