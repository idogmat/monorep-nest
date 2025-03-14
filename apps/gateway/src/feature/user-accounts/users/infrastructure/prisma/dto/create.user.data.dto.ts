interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  confirmationCode: string;
  codeExpiration: Date;
  isConfirmed: boolean;
}