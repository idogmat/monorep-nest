export class PrismaServiceMock {
  prisma={
    user:{
      create:(data:any) =>{},
      findUnique:(data:any) =>{},
      findMany:(data:any) =>{}
    }
  }
  constructor() { }
}