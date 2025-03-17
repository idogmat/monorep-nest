import { Injectable } from '@nestjs/common';
import { Device } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuthUser } from '../../../../common/guard/authGuard';


@Injectable()
export class DeviceQueryRepository {
  constructor(private prisma: PrismaService) { }
  async getAll(user: IAuthUser): Promise<Device[] | []> {
    return await this.prisma.device.findMany({ where: { userId: user.userId } })
  }
}