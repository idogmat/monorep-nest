import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join, resolve } from 'path';
import { ProfileClientService } from './grpc.profile.service';
import { PaymentsClientService } from './grpc.payments.service';
import { ContentClientService } from './grpc.content.service';
@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'PROFILE_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'profile',
              protoPath: join(__dirname, 'profile.proto'),
              url: configService.get('GATE_PROFILE_GRPC_URL'),
              loader: {
                includeDirs: ['node_modules/google-proto-files'],
              },
            },
          }
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'PAYMENTS_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'payments',
              protoPath: join(__dirname, 'payments.proto'),
              url: configService.get('GATE_PAYMENTS_GRPC_URL'),
              loader: {
                includeDirs: ['node_modules/google-proto-files'],
              },
            },
          }
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'CONTENT_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'content',
              protoPath: join(__dirname, 'content.proto'),
              url: configService.get('GATE_CONTENT_GRPC_URL'),
              loader: {
                includeDirs: ['node_modules/google-proto-files'],
              },
            },
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [ProfileClientService, PaymentsClientService, ContentClientService],
  exports: [ProfileClientService, PaymentsClientService, ContentClientService],
})
export class GrpcServiceModule { }
