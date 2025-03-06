import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';  // Используем bcryptjs вместо старого bcrypt
@Injectable()
export class BcryptService {
  async generationHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
  async checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}