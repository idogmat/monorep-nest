import { ForbiddenException, Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma/prisma.service"
import { EventPattern } from "@nestjs/microservices";



@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  async createProfile(profile: any): Promise<any> {
    return this.prisma.profile.create({
      data: {
        userId: profile.userId,
        userName: profile.userName,
        email: profile.email
      }
    })
  }

  async findById(id: string): Promise<any> {
    return this.prisma.profile.findFirst({
      where: { id }
    })
  }

  async findByUserId(userId: string): Promise<any> {
    return this.prisma.profile.findMany({
      where: { userId }
    })
  }

  async findMany(device: Partial<any>): Promise<any> {
    return this.prisma.profile.findMany({})
  }

  async update(device: any): Promise<any> {
    return this.prisma.profile.update({
      where: { id: device.id },
      data: device
    })
  }

  async deleteSession(id: string, userId: string): Promise<any> {
    return await this.prisma.$transaction(async (tx) => {
      const device = await tx.profile.findFirst({
        where: { id }
      })
      if (!device || device.userId !== userId) throw new ForbiddenException()
      return this.prisma.profile.delete({
        where: { id, userId },
      })
    })
  }
}