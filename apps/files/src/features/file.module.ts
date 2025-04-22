import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files/api/files.controller';
import { FilesService } from './files/application/files.service';
import { FilesRepository } from './files/infrastructure/files.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { MulterModule } from '@nestjs/platform-express';
import { S3StorageAdapterJ } from './files/application/s3.service';
import { ProfileService } from './files/application/profile.service';
import { PostPhotoService } from './files/application/post.photo.service';
import { PostMedia, PostMediaSchema } from './files/domain/post.media.entity';
import { CreatePhotoForPostUseCase } from './files/application/use-cases/create.photo.for.post.use-case';
import { UploadProfilePhotoUseCase } from './files/application/use-cases/upload.profile.photo.use-case';
import { FilesQueryRepository } from './files/infrastructure/files.query-repository';
import { DeletePhotoMediaUseCase } from './files/application/use-cases/delete.photo.media.use-case';

const useCases = [
  CreatePhotoForPostUseCase,
  UploadProfilePhotoUseCase,
  DeletePhotoMediaUseCase
];

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
    MongooseModule.forFeature([{ name: PostMedia.name, schema: PostMediaSchema }]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_POST_SERVICE',
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
      {
        imports: [ConfigModule],
        name: 'RABBITMQ_PROFILE_SERVICE',
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get<string[]>('RABBIT_URLS'),
              queue: 'profile_queue',
              queueOptions: { durable: true },
            },
          }
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    ...useCases,
    FilesService,
    FilesRepository,
    FilesQueryRepository,
    ProfileService,
    PostPhotoService,
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
    {
      provide: 'POST_PHOTO_BUCKET_ADAPTER',
      useFactory: (configService: ConfigService) => {
        return new S3StorageAdapterJ(
          configService,
          configService.get<string>('POST_BUCKET'), // Укажите имя бакета из конфига
        );
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FilesController],
  exports: []
})

export class FileModule { }