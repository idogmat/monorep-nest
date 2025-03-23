import { Module } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [ProfileController],
  exports: []
})
export class ProfileModule { }