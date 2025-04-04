import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MessageClientService } from './grpc.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MESSAGE_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: 'message',
              protoPath: join(__dirname, 'proto/message.proto'),
              url: 'localhost:3814',
            },
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [MessageClientService],
  exports: [MessageClientService],
})
export class GrpcServiceModule { }
