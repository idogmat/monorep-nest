import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserLoader } from '../../user-accounts/devices/loaders/user.loader';
import { Post } from './model/input/post.schema';
import { ProfileLoader } from '../../profile/application/profile.loader';

@Resolver(() => Post)
export class PostFieldResolver {
  constructor(
    private readonly userLoader: UserLoader,
    private readonly profileLoader: ProfileLoader,
    ) {}

  @ResolveField(() => String, { name: 'userName', nullable: true })
  async resolveUserName(@Parent() post: Post): Promise<string | null> {
    const user = await this.userLoader.batchUsers.load(post.userId);
    console.log("users--------",user);
    return user?.name ?? null;
  }

  @ResolveField(() => String, { name: 'banned', nullable: true })
  async resolveUserBanned(@Parent() post: Post): Promise<boolean | null> {
    const user = await this.userLoader.batchUsers.load(post.userId);
    return user?.banned ?? null;
  }
  @ResolveField(() => String, { name: 'photoUrlProfile', nullable: true })
  async resolvePhotoUrlProfile(@Parent() post: Post): Promise<string | null> {
    const profile  = await this.profileLoader.batchProfiles.load(post.userId);
    return profile?.photoUrl.value ?? null;
  }
}