import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files/api/files.controller';
import { FilesRepository } from './files/infrastructure/files.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getConfiguration } from '../settings/getConfiguration';
import { MulterModule } from '@nestjs/platform-express';
import { S3StorageAdapter } from './files/application/s3.service';
import { ProfileService } from './files/application/profile.service';
import { S3UploadPhotoService } from './files/application/post.photo.service';
import { PostMedia, PostMediaSchema } from './files/domain/post.media.entity';
import { CreatePhotoForPostUseCase } from './files/application/use-cases/create.photo.for.post.use-case';
import { UploadProfilePhotoUseCase } from './files/application/use-cases/upload.profile.photo.use-case';
import { FilesQueryRepository } from './files/infrastructure/files.query-repository';
import { DeletePhotoMediaUseCase } from './files/application/use-cases/delete.photo.media.use-case';
import { SavePhotoForPostUseCase } from './files/application/use-cases/save.photo.for.post.use-case';
import { LoadFilesHandler } from './files/application/event-bus/load.files.post.event';
import { LocalPath, LocalPathSchema } from './files/domain/local.path.entity';
import { LocalPathRepository } from './files/infrastructure/localPath.repository';
import { RabbitService } from './files/application/rabbit.service';
import { SavePhotoForProfileUseCase } from './files/application/use-cases/save.photo.profile.use-case';

const useCases = [
  CreatePhotoForPostUseCase,
  UploadProfilePhotoUseCase,
  DeletePhotoMediaUseCase,
  SavePhotoForPostUseCase,
  SavePhotoForProfileUseCase
];
const eventCases = [
  LoadFilesHandler
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
    MongooseModule.forFeature([
      { name: PostMedia.name, schema: PostMediaSchema },
      { name: LocalPath.name, schema: LocalPathSchema }
    ]),
    // ClientsModule.registerAsync([
    //   {
    //     imports: [ConfigModule],
    //     name: 'RABBITMQ_POST_SERVICE',
    //     useFactory: (configService: ConfigService) => {
    //       return {
    //         transport: Transport.RMQ,
    //         options: {
    //           urls: configService.get<string[]>('RABBIT_URLS'),
    //           queue: 'post_queue',
    //           queueOptions: { durable: true },
    //         },
    //       }
    //     },
    //     inject: [ConfigService],
    //   },
    //   {
    //     imports: [ConfigModule],
    //     name: 'RABBITMQ_PROFILE_PHOTO_SERVICE',
    //     useFactory: (configService: ConfigService) => {
    //       return {
    //         transport: Transport.RMQ,
    //         options: {
    //           urls: configService.get<string[]>('RABBIT_URLS'),
    //           queue: 'profile_photo_queue',
    //           queueOptions: { durable: true },
    //         },
    //       }
    //     },
    //     inject: [ConfigService],
    //   },
    // ]),
  ],
  providers: [
    ...useCases,
    ...eventCases,
    FilesRepository,
    FilesQueryRepository,
    LocalPathRepository,
    ProfileService,
    S3UploadPhotoService,
    {
      provide: 'PROFILE_BUCKET_ADAPTER',
      useFactory: (configService: ConfigService) => {
        return new S3StorageAdapter(
          configService,
          'profile',
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'POST_PHOTO_BUCKET_ADAPTER',
      useFactory: (configService: ConfigService) => {
        return new S3StorageAdapter(
          configService,
          configService.get<string>('POST_BUCKET'), // Укажите имя бакета из конфига
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'RABBIT_SERVICE',
      useFactory: (configService: ConfigService) => {
        return new RabbitService(
          configService,
        );
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FilesController],
  exports: []
})

export class FileModule { }