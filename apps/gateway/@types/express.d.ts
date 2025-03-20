declare namespace Express {
  interface Request {
    user: {
      userId: string
      deviceId: string
      updatedAt: string
      iat?: number;
      exp?: number;
    };
  }
}