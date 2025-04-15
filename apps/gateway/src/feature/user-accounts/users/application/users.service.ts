import { Injectable } from '@nestjs/common';

import { User } from '../../../../../prisma/generated/client';
import { PrismaService } from '../../../prisma/prisma.service';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // async createUser(data: { email: string; name?: string }): Promise<User> {
  //   // return this.prisma.user.create({ data });
  // }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}