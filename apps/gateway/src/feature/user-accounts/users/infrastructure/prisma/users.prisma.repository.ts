import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UserEntity } from '../../domain/entites/user.entity';
import { User } from '../../../../../../prisma/generated';

@Injectable()
export class UsersPrismaRepository{
  constructor(private prisma: PrismaService) { }
    async findUserByEmail(email: string): Promise<User|null>{
      return this.prisma.user.findUnique({
        where: {email},
      })
    }

    async createUser(user: UserEntity ): Promise<User>{

    return this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        confirmationCode: user.confirmationCode,
        expirationDate: user.expirationDate,
        isConfirmed: user.isConfirmed,
        updatedAt: user.updatedAt,
      }
    })
  }
}