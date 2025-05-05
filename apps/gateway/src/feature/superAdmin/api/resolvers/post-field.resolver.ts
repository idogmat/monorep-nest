import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Post } from '../models/post.schema';
import { ProfileLoader } from '../../../profile/application/profile.loader';

@Resolver(() => Post)
export class PostFieldResolver {
  constructor(
    private readonly profileLoader: ProfileLoader,
    ) {}

  @ResolveField(() => String, { name: 'userName', nullable: true })
  async resolveUserName(
    @Parent() post: Post,
    @Context() context: any
  ): Promise<string | null> {
    const user = await context.loaders.userLoader.load(post.userId);
    return user?.name ?? null;
  }

  @ResolveField(() => String, { name: 'banned', nullable: true })
  async resolveUserBanned(
    @Parent() post: Post,
    @Context() context: any
  ): Promise<boolean | null> {
    const user = await context.loaders.userLoader.load(post.userId);
    return user?.banned ?? null;
  }
  @ResolveField(() => String, { name: 'photoUrlProfile', nullable: true })
  async resolvePhotoUrlProfile(@Parent() post: Post): Promise<string | null> {
    const profile  = await this.profileLoader.batchProfiles.load(post.userId);
    return profile?.photoUrl.value ?? null;
  }
}