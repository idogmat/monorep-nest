import { ForbiddenException, Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma/prisma.service"
import { Profile } from 'node_modules/.prisma/profile-client';
import { ProfilePhotoInputModel } from "./model/profilePhoto.input.model";
import { InputProfileModel } from "./model/input.profile.model";
import { ProfileWithSubscribers } from "./model/profile.output.model";



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

  async findByUserId(userId: string): Promise<ProfileWithSubscribers> {
    return await this.prisma.profile.findFirst({
      where: { userId },
      include: {
        subscribers: {
          include: {
            profile: true // Получаем связанные профили
          }
        },
        subscriptions: {
          include: {
            subscriber: true // Получаем связанные профили
          }
        }
      }
    })
  }

  async findMany(): Promise<ProfileWithSubscribers[]> {
    const profiles = await this.prisma.profile.findMany({
      include: {
        subscribers: {
          include: {
            profile: true // Получаем связанные профили
          }
        },
        subscriptions: {
          include: {
            subscriber: true // Получаем связанные профили
          }
        }
      }
    });

    return profiles
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

  async subscribe(userId: string, userProfileId: string): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const subscriber = await tx.profile.findFirst({
        where: { userId }
      })
      const profile = await tx.profile.findFirst({
        where: { userId: userProfileId }
      })
      if (!subscriber || !profile) throw new Error()
      const sub = await tx.subscription.findFirst({
        where: {
          AND: [
            { subscriberId: subscriber.id },
            { profileId: profile.id }
          ]
        }
      });

      if (sub) {
        await tx.subscription.delete({
          where: {
            subscriberId_profileId: {
              subscriberId: sub.subscriberId,
              profileId: sub.profileId
            }
          }
        })
      } else {
        await tx.subscription.create({
          data: {
            subscriberId: subscriber.id,
            profileId: profile.id
          }
        });
      }

    })
  }
}