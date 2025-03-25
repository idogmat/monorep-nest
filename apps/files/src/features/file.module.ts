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
import { S3StorageAdapterJ } from './files/application/s3.service';
import { ProfileService } from './files/application/profile.service';

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
  providers: [
    S3StorageAdapter,
    FilesService,
    FilesRepository,
    ProfileService,
    {
      provide: 'PROFILE_BUCKET_ADAPTER',
      useFactory: (configService: ConfigService) => {
        return new S3StorageAdapterJ(
          configService,
          'profile', // Укажите имя бакета из конфига
        );
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FilesController],
  exports: []
})

export class FileModule { }