// src/entities/UserEntity.ts
import { add } from 'date-fns';


export class UserEntity {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;

  constructor(data: { name: string; email: string; passwordHash: string }) {
    this.name = data.name;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.confirmationCode = this.generateConfirmationCode();
    this.expirationDate = add(new Date(), { hours: 99, minutes: 3 });
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
  //     expirationDate: this.expirationDate,
  //     isConfirmed: this.isConfirmed,
  //     posts: []
  //   };
  // }
}
