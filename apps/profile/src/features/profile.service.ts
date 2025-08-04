import { BadRequestException, ConflictException, ForbiddenException, Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma/prisma.service"
import { Profile, Prisma } from '../../prisma/generated/profile-client';
import { ProfilePhotoInputModel } from "./model/profilePhoto.input.model";
import { InputProfileModel } from "./model/input.profile.model";
import { PaginationProfileWithSubscribers, PaginationProfileWithSubscribersGql, ProfileWithSubscribers } from "./model/profile.output.model";
import ts from "typescript";
import {
  GetFollowersGqlQuery,
  UpdateUserProfileRequest,
  UserProfilesQuery,
} from '../../../libs/proto/generated/profile';



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

  async deleteProfile(userId: string): Promise<any> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } })
    if (!profile) throw new BadRequestException()
    return this.prisma.profile.delete({
      where: { userId }
    })
  }

  async banProfile(userId: string): Promise<any> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } })
    if (!profile) throw new BadRequestException()
    return this.prisma.profile.update({
      where: { userId },
      data: { banned: true }
    })
  }

  async findForGql(users: string[]): Promise<ProfileWithSubscribers[]> {
    return await this.prisma.profile.findMany({
      where: {
        userId: {
          in: users
        }
      },
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

  async findMany(query: UserProfilesQuery): Promise<PaginationProfileWithSubscribers> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const userName = query?.userName

    const where: Prisma.ProfileWhereInput = {};

    if (userName) {
      where.userName = {
        contains: userName,
        mode: 'insensitive',
      };
    }

    const allowedSortFields: (keyof ProfileWithSubscribers)[] = [
      'createdAt',
    ];

    const orderBy: Prisma.ProfileOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.profile.findMany({
        where,
        orderBy,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        include: {
          subscribers: {
            include: {
              profile: true
            }
          },
          subscriptions: {
            include: {
              subscriber: true
            }
          }
        }
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { items, totalCount, pageNumber, pageSize };
  }

  async getFollowers(query: GetFollowersGqlQuery): Promise<PaginationProfileWithSubscribersGql> {
    const { offset, limit, sortBy, sortDirection } = query;
    const userId = query?.userId || ''

    const where: Prisma.SubscriptionWhereInput = {};

    if (userId) {
      let profile
      try {
        profile = await this.prisma.profile.findFirstOrThrow({
          where: { userId }
        })
        if (!profile.id) return { items: [], totalCount: 0 };
      } catch (error) {
        console.warn(error, 'error')
        return { items: [], totalCount: 0 };
      }
      where.profileId = profile.id;
    }

    const allowedSortFields: (keyof ProfileWithSubscribers)[] = [
      'createdAt',
    ];

    const orderBy: Prisma.ProfileOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          subscriber: true,
          profile: true
        }
      }),
      this.prisma.subscription.count({ where }),
    ]);
    return { items, totalCount };
  }

  async getFollowing(query: GetFollowersGqlQuery): Promise<PaginationProfileWithSubscribersGql> {
    const { offset, limit, sortBy, sortDirection } = query;
    const userId = query?.userId || ''

    const where: Prisma.SubscriptionWhereInput = {};

    if (userId) {
      let profile
      try {
        profile = await this.prisma.profile.findFirstOrThrow({
          where: { userId }
        })
        if (!profile.id) return { items: [], totalCount: 0 };
      } catch (error) {
        console.warn(error, 'error')
        return { items: [], totalCount: 0 };
      }
      where.subscriberId = profile.id;
    }

    const allowedSortFields: (keyof ProfileWithSubscribers)[] = [
      'createdAt',
    ];

    const orderBy: Prisma.ProfileOrderByWithRelationInput = allowedSortFields.includes(sortBy as any)
      ? { [sortBy]: sortDirection.toLowerCase() as 'asc' | 'desc' }
      : { createdAt: 'desc' };

    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          subscriber: true,
          profile: true
        }
      }),
      this.prisma.subscription.count({ where }),
    ]);
    return { items, totalCount };
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

  async updateProfileFields(
    userId: string,
    data: Partial<UpdateUserProfileRequest>
  ): Promise<Profile> {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findFirst({
        where: { userId: userId }
      });

      if (!profile) throw new ForbiddenException();

      return tx.profile.update({
        where: { userId },
        data: { ...data }
      });
    });
  }

  async updateProfilePayment(userId: string, paymentAccount: boolean): Promise<Profile> {
    return this.prisma.profile.update({
      where: { userId },
      data: { paymentAccount }
    })
  }

  async subscribe(userId: string, userProfileId: string): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const [subscriber, profile] = await Promise.all([
        tx.profile.findUnique({ where: { userId } }),
        tx.profile.findUnique({ where: { userId: userProfileId } }),
      ]);
      if (!subscriber ||
        !profile ||
        subscriber.id === profile.id) throw new ConflictException('Not exist or you subscribe by self');
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