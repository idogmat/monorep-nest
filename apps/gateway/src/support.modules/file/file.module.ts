import { Global, Module } from "@nestjs/common";
import { SendFileService } from "./file.service";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [{
    provide: 'SEND_FILE_SERVICE',
    useFactory: (configService: ConfigService) => {
      return new SendFileService(
        configService,
      );
    },
    inject: [ConfigService],
  },],
  exports: ['SEND_FILE_SERVICE'],
})
export class FileServiceModule { }