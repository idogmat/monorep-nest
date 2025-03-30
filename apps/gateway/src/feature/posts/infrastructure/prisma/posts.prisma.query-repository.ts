import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class  PostsPrismaQueryRepository {
  constructor(private prisma: PrismaService) {
  }

  async findById(id: string){
    return this.prisma.post.findFirst({
      where: {id}
    })
  }

}