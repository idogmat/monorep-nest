import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files/api/files.controller';
import { S3StorageAdapter } from '../common/s3/s3.storage.adapter';
import { FilesService } from './files/application/files.service';
import { FilesRepository } from './files/infrastructure/files.repository';
import { FilesSchema } from './files/domain/file.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    CqrsModule,
    MulterModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [getConfiguration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get('MONGO_DB_URL');
        return {
          uri: uri,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FilesSchema }]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'file_queue',
              queueOptions: { durable: false },
            },
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [S3StorageAdapter, FilesService, FilesRepository],
  controllers: [FilesController],
  exports: []
})

export class FileModule { }