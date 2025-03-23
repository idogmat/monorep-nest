import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfiguration } from '../../../gateway/src/settings/getConfiguration';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files/api/files.controller';
import { S3StorageAdapter } from '../common/s3/s3.storage.adapter';
import { FilesService } from './files/application/files.service';
import { FilesRepository } from './files/infrastructure/files.repository';
import { FilesSchema } from './files/domain/file.entity';

@Module({
  imports: [
    CqrsModule,
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
  ],
  providers:[S3StorageAdapter,FilesService, FilesRepository],
  controllers: [FilesController],
  exports:[]
})

export class FileModule {}