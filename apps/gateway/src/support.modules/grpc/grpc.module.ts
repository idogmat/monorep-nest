import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join, resolve } from 'path';
import { ProfileClientService } from './grpc.service';
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
    ]),
  ],
  controllers: [],
  providers: [ProfileClientService],
  exports: [ProfileClientService],
})
export class GrpcServiceModule { }
