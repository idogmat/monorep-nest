import { Controller, Delete, Get, HttpCode, Param, Req, UseGuards } from '@nestjs/common';
import { DeviceService } from '../application/device.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guard/authGuard';
import { Request } from 'express';
import { DeviceQueryRepository } from '../infrastructure/device.prisma.query-repository';
import { Device } from '@prisma/client';
import { DeviceModel } from './models/device.model';

@ApiTags('Devices')
@Controller('auth/devices')
export class DevicesController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly deviceQueryRepository: DeviceQueryRepository,
  ) { }

  @ApiResponse({ status: 204, description: 'Delete all device connections' })
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Delete('all-except-current')
  async removeAllSessions(
    @Req() req
  ) {
    await this.deviceService.deleteAllSession(req.user)
  }

  @ApiResponse({ status: 204, description: 'Delete device connection' })
  @UseGuards(AuthGuard)
  @Delete(':id')
  async removeSession(
    @Req() req,
    @Param('id') id: string,
  ) {
    await this.deviceService.deleteSession(id, req.user.userId)
  }

  @ApiResponse({ status: 200, description: 'Your devices', type: DeviceModel, isArray: true })
  @UseGuards(AuthGuard)
  @Get()
  async getAll(
    @Req() req
  ) {

    const devices: Device[] | [] =
      await this.deviceQueryRepository.getAll(req.user);

    return devices;
  }
}