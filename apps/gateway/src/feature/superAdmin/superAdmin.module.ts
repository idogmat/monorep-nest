import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from "path";
import { SuperAdminService } from "./application/superAdmin.service";
import { SuperAdminResolver } from "./api/superAdmin.resolver";
import { GrpcServiceModule } from "../../support.modules/grpc/grpc.module";
import { UsersAccountsModule } from "../user-accounts/users.accounts.module";
import { ProfileModule } from "../profile/profile.module";

@Module({
  imports: [
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
    ProfileModule
  ],
  providers: [SuperAdminService, SuperAdminResolver],
  controllers: []
})
export class SuperAdminModule { }