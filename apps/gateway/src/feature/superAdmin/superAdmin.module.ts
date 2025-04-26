import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from "path";
import { SuperAdminService } from "./application/superAdmin.service";
import { SuperAdminResolver } from "./api/superAdmin.resolver";
import { GrpcServiceModule } from "../../support.modules/grpc/grpc.module";
import { UsersAccountsModule } from "../user-accounts/users.accounts.module";
import { ProfileModule } from "../profile/profile.module";
import { PostsModule } from '../posts/posts.module';
import { PostMicroserviceService } from '../posts/application/services/post.microservice.service';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    PostsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Генерация схемы на лету
      sortSchema: true,
      playground: true, // GraphQL UI
      context: ({ req }) => ({ req }),
      path: 'api/v1/graphql'
    }),
    GrpcServiceModule,
    UsersAccountsModule,
    ProfileModule,
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_POST_BAN_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'post_queue',
              queueOptions: { durable: true },
            },
          }
        },
        inject: [ConfigService],
      },
    ])
  ],
  providers: [SuperAdminService, SuperAdminResolver],
  controllers: []
})
export class SuperAdminModule { }