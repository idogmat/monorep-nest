import { Module } from '@nestjs/common';
import { LoaderFactoryService } from './loader.factory.service';
import { PostResolver } from '../api/resolvers/post.resolver';
import { UserLoader } from '../../user-accounts/devices/loaders/user.loader';
import { ProfileLoader } from '../../profile/application/profile.loader';
import { UsersAccountsModule } from '../../user-accounts/users.accounts.module';
import { PostGraphqlService } from '../application/post.graphql.service';
import { PostMicroserviceService } from '../../posts/application/services/post.microservice.service';
import { GateService } from '../../../common/gate.service';
import { PostFieldResolver } from '../api/resolvers/post-field.resolver';

@Module({
  imports:[
    UsersAccountsModule
  ],
  providers: [
    LoaderFactoryService,
    PostResolver,
    PostResolver,
    UserLoader,
    ProfileLoader,
    PostGraphqlService,
    PostMicroserviceService,
    GateService,
    PostFieldResolver],
  exports: [LoaderFactoryService, PostResolver], // Экспортируем сервис, чтобы другие модули могли его использовать
})
export class LoaderModule {}