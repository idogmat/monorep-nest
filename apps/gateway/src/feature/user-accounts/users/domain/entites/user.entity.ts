// src/entities/UserEntity.ts
import { add } from 'date-fns';


export class UserEntity {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  confirmationCode: string;
  expirationDate?: Date;
  codeExpiration?: Date;
  isConfirmed: boolean;

  constructor(data: { name: string; email: string; passwordHash: string }) {
    this.name = data.name;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.confirmationCode = this.generateConfirmationCode();
    this.codeExpiration = add(new Date(), { hours: 24 });
    this.isConfirmed = false;
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 15); // Простенький пример генерации
  }

  // Метод для преобразования в формат Prisma
  // toPrisma(): Partial <Prisma.UserCreateInput> {
  //   return {
  //     name: this.name,
  //     email: this.email,
  //     passwordHash: this.passwordHash,
  //     createdAt: this.createdAt,
  //     updatedAt: this.updatedAt,
  //     confirmationCode: this.confirmationCode,
  //     codeExpiration: this.codeExpiration,
  //     isConfirmed: this.isConfirmed,
  //     posts: []
  //   };
  // }
}
