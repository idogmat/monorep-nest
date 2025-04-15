import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { User, Provider } from '../../../../../../prisma/generated/client';
import { CreateUserData } from './dto/create.user.data.dto';


@Injectable()
export class UsersPrismaRepository {
  constructor(private prisma: PrismaService) { }
  async getById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        AND: [
          { confirmationCode },
          { isConfirmed: false }
        ]
      },
    })
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { recoveryCode },
    })
  }

  async updateUserById(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }


  async createUser(userDTO: CreateUserData): Promise<User> {

    return this.prisma.user.create({
      data: {
        email: userDTO.email,
        name: userDTO.name,
        passwordHash: userDTO.passwordHash,
        createdAt: userDTO.createdAt,
        confirmationCode: userDTO.confirmationCode,
        codeExpiration: userDTO.codeExpiration,
        isConfirmed: userDTO.isConfirmed,
        updatedAt: userDTO.updatedAt,
      }
    })
  }

  async createUserFromProvider(email: string, name: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: email,
        name: name,
        isConfirmed: true
      }
    })
  }

  async createProvider(userId: string, providerData: Partial<Pick<Provider, 'googleId' | 'githubId'>>): Promise<Provider> {
    return this.prisma.provider.create({
      data: {
        user: {
          connect: { id: userId }
        },
        googleId: providerData.googleId || null,
        githubId: providerData.githubId || null
      }

    })
  }

  async createUserWithProvider(email: string, name: string, providerData: Partial<Pick<Provider, 'googleId' | 'githubId'>>): Promise<User & { providers: Provider | null }> {
    const user = await this.prisma.user.create({
      data: {
        email: email,
        name: name,
        isConfirmed: true,
        providers: {
          create: {
            googleId: providerData.googleId || null,
            githubId: providerData.githubId || null
          }
        }
      },
      include: {
        providers: true
      }
    })
    return user as User & { providers: Provider | null };
  }

  async findUserByProviderIdOrEmail(
    param: { providerId: string; email: string }
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: param.email },
          {
            providers: {
              OR: [
                { googleId: param.providerId },
                { githubId: param.providerId }
              ]
            }
          }
        ]
      },
      include: { providers: true, devices: true }
    });

    return user as User & { providers: Provider | null };
    // & { providers: Provider | null };
  }

  async updateProvider(id: string, data: Partial<Pick<Provider, 'googleId' | 'githubId'>>) {
    return this.prisma.provider.update({
      where: { id },
      data,
    });
  }
}