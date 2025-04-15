import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ProfileService } from "./profile.service";
import { FileService } from "../../../../../libs/file.service";

@Injectable()
export class ProfileCronService {
  private readonly logger = new Logger(ProfileCronService.name);
  constructor(
    private readonly profileService: ProfileService,
    private readonly fileService: FileService,
  ) { }
  // "*/10 * * * * *" 10sec
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const events = await this.fileService.processEvents()
    console.log(events)
    for (const event of events) {
      await this.profileService.subscribeProfile(event.userId, event.paymentAccount)
      console.log('Processing event:', event);
    }
    await this.fileService.deleteFileResult()

    this.logger.log('Profile updated');

  }
}