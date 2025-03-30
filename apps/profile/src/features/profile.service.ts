import { ForbiddenException, Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma/prisma.service"
import { Profile } from 'node_modules/.prisma/profile-client';
import { ProfilePhotoInputModel } from "./model/profilePhoto.input.model";
import { InputProfileModel } from "./model/input.profile.model";



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
    return this.prisma.profile.findFirst({
      where: { userId }
    })
  }

  async findMany(): Promise<any> {
    return this.prisma.profile.findMany({})
  }

  async updateProfilePhoto(data: ProfilePhotoInputModel): Promise<Profile> {
    return await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findFirst({
        where: { userId: data.userId }
      })
      if (!profile) throw new ForbiddenException()
      return tx.profile.update({
        where: { userId: data.userId },
        data: { photoUrl: data.photoUrl }
      })
    })
  }

  async updateProfileData(userId: string, data: InputProfileModel): Promise<Profile> {
    return await this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findFirst({
        where: { userId: userId }
      })
      if (!profile) throw new ForbiddenException()
      return tx.profile.update({
        where: { userId },
        data: { ...data }
      })
    })
  }
}