import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';


@Injectable()
export class ChatsQueryRepository {
  constructor(private prisma: PrismaService) {
  }

  async getAllChats(queryDto?: any) {

  }

}