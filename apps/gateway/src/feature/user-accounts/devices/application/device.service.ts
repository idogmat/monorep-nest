import { ForbiddenException, Injectable } from '@nestjs/common';
import { Device } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DeviceModel } from '../api/models/device.model';
import { IAuthUser } from '../../../../common/guard/authGuard';


@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) { }

  async createDevice(device: Partial<DeviceModel>): Promise<Device> {
    return this.prisma.device.create({
      data: {
        userId: device.userId,
        ip: device.ip,
        title: device.title,
      }
    })
  }

  async findById(id: string): Promise<Device | null> {
    return this.prisma.device.findFirst({
      where: { id }
    })
  }

  async findByUserId(userId: string): Promise<Device[] | null> {
    return this.prisma.device.findMany({
      where: { userId }
    })
  }

  async find(device: Partial<DeviceModel>): Promise<Device> {
    return this.prisma.device.findFirst({
      where: {
        AND: [
          { ip: device.ip },
          { title: device.title },
          { userId: device.userId }
        ]
      }
    })
  }

  async update(device: DeviceModel): Promise<Device> {
    return this.prisma.device.update({
      where: { id: device.id },
      data: device
    })
  }

  async deleteSession(id: string, userId: string): Promise<Device> {
    return await this.prisma.$transaction(async (tx) => {
      const device = await tx.device.findFirst({
        where: { id }
      })
      if (!device || device.userId !== userId) throw new ForbiddenException()
      return this.prisma.device.delete({
        where: { id, userId },
      })
    })
  }

  async deleteAllSession(user: IAuthUser): Promise<void> {
    await this.prisma.device.deleteMany({
      where: {
        id: { not: user.deviceId },
        userId: user.userId
      },
    })
  }
}