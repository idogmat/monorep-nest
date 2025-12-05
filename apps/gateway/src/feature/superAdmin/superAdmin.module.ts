import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from "path";
import { SuperAdminService } from "./application/superAdmin.service";
import { SuperAdminResolver } from "./api/resolvers/superAdmin.resolver";
import { GrpcServiceModule } from "../../support.modules/grpc/grpc.module";
import { UsersAccountsModule } from "../user-accounts/users.accounts.module";
import { ProfileModule } from "../profile/profile.module";
import { PostsModule } from '../posts/posts.module';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";


@Module({
  imports: [
    PostsModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UsersAccountsModule, ProfileModule], // добавь сюда модуль, где находится LoaderFactoryService, если он в другом модуле
      inject: [],
      useFactory: async () => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: true,
        path: '/api/v1/graphql',
        // Убираем context, если не нужно передавать лоадеры в контекст
      }),
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