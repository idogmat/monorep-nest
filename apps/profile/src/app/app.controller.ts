import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ProfileService } from '../features/profile.service';

@Controller()
export class AppController {
  constructor(readonly profileService: ProfileService) { }

  @Get()
  healthCheck() {
    return this.profileService.findMany({});  // Возвращаем статус микросервиса
  }
  @Post()
  async createProfile(
    @Body() data: any
  ) {
    console.log(data, 'profile-data')
    this.profileService.createProfile(data)
  }

  // @EventPattern('test_event')
  // handleTestEvent(data: any) {
  //   console.log('📩 Received event: PROFILE', data);
  // }

  @EventPattern('load_profile_photo')
  handleTestEvent(data: any) {
    console.log('📩 Received event: PROFILE', data);
    // 

  }
}