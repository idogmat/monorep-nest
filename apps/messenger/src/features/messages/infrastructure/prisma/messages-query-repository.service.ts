import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MessagesQueryRepository {
  constructor(private prisma: PrismaService) {
  }


  async getAllMessages(queryDto?: any) {

  }
}